using CanonMonitoringAgent.Services;
using StackExchange.Redis;
using System.Text.Json;

namespace CanonMonitoringAgent.Workers;

/// <summary>
/// 알림 처리 백그라운드 워커
/// 프린터 상태를 확인하여 토너 부족, 용지 부족, 오류 발생 시 알림 전송
/// </summary>
public class AlertWorker : BackgroundService
{
    private readonly ILogger<AlertWorker> _logger;
    private readonly INotificationService _notificationService;
    private readonly IConnectionMultiplexer _redis;
    private readonly TimeSpan _interval = TimeSpan.FromMinutes(10);

    // 알림 임계값
    private const int TONER_LOW_THRESHOLD = 15; // 15% 이하
    private const int PAPER_LOW_THRESHOLD = 20; // 20% 이하

    public AlertWorker(
        ILogger<AlertWorker> logger,
        INotificationService notificationService,
        IConnectionMultiplexer redis)
    {
        _logger = logger;
        _notificationService = notificationService;
        _redis = redis;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("🚀 알림 워커 시작");

        // 초기 대기 (모니터링 워커가 먼저 실행되도록)
        await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CheckAlertsAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ 알림 처리 오류");
            }

            await Task.Delay(_interval, stoppingToken);
        }

        _logger.LogInformation("⏹️  알림 워커 종료");
    }

    /// <summary>
    /// 모든 프린터 상태 확인 및 알림 전송
    /// </summary>
    private async Task CheckAlertsAsync()
    {
        _logger.LogInformation("🔔 알림 상태 확인 시작");

        var db = _redis.GetDatabase();

        // Redis에서 모든 프린터 상태 조회
        var server = _redis.GetServer(_redis.GetEndPoints().First());
        var keys = server.Keys(pattern: "printer:status:*").ToList();

        _logger.LogInformation("📊 확인할 프린터: {Count}대", keys.Count);

        foreach (var key in keys)
        {
            try
            {
                var json = await db.StringGetAsync(key);
                if (json.IsNullOrEmpty) continue;

                var status = JsonSerializer.Deserialize<Models.PrinterStatus>(json!);
                if (status == null) continue;

                // 알림 필요 여부 확인
                await CheckAndSendAlertsAsync(status);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ 프린터 상태 확인 실패: {Key}", key);
            }
        }

        _logger.LogInformation("✅ 알림 상태 확인 완료");
    }

    /// <summary>
    /// 프린터 상태 확인 및 알림 전송
    /// </summary>
    private async Task CheckAndSendAlertsAsync(Models.PrinterStatus status)
    {
        var alerts = new List<string>();

        // 1. 오류 상태
        if (status.Status == "ERROR")
        {
            alerts.Add($"🚨 프린터 오류 발생: {status.ErrorMessage}");
        }

        // 2. 토너 부족
        if (status.TonerLevelBlack.HasValue && status.TonerLevelBlack <= TONER_LOW_THRESHOLD)
        {
            alerts.Add($"⚠️ 블랙 토너 부족: {status.TonerLevelBlack}%");
        }
        if (status.TonerLevelCyan.HasValue && status.TonerLevelCyan <= TONER_LOW_THRESHOLD)
        {
            alerts.Add($"⚠️ 시안 토너 부족: {status.TonerLevelCyan}%");
        }
        if (status.TonerLevelMagenta.HasValue && status.TonerLevelMagenta <= TONER_LOW_THRESHOLD)
        {
            alerts.Add($"⚠️ 마젠타 토너 부족: {status.TonerLevelMagenta}%");
        }
        if (status.TonerLevelYellow.HasValue && status.TonerLevelYellow <= TONER_LOW_THRESHOLD)
        {
            alerts.Add($"⚠️ 옐로우 토너 부족: {status.TonerLevelYellow}%");
        }

        // 3. 용지 부족
        if (status.PaperLevel.HasValue && status.PaperLevel <= PAPER_LOW_THRESHOLD)
        {
            alerts.Add($"📄 용지 부족: {status.PaperLevel}%");
        }

        // 알림 전송
        if (alerts.Count > 0)
        {
            var message = $"""
                ━━━━━━━━━━━━━━━━━━━━━━━━
                🖨️ Canon 프린터 알림
                ━━━━━━━━━━━━━━━━━━━━━━━━
                
                프린터 ID: #{status.PrinterId}
                시각: {status.Timestamp:yyyy-MM-dd HH:mm:ss}
                
                {string.Join("\n", alerts)}
                
                ━━━━━━━━━━━━━━━━━━━━━━━━
                """;

            _logger.LogWarning("📢 알림 전송: 프린터 #{PrinterId}", status.PrinterId);

            // 이메일 전송 (관리자)
            await _notificationService.SendEmailAsync(
                "admin@canon.co.kr",
                $"[Canon 프린터 알림] 프린터 #{status.PrinterId}",
                message
            );

            // Slack 전송
            await _notificationService.SendSlackAsync(message);
        }
    }
}
