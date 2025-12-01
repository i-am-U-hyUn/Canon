using CanonMonitoringAgent.Services;
using StackExchange.Redis;
using System.Text.Json;

namespace CanonMonitoringAgent.Workers;

/// <summary>
/// 프린터 모니터링 백그라운드 워커
/// 5분마다 모든 프린터 상태를 SNMP로 조회하여 Redis/DB 저장
/// </summary>
public class PrinterMonitoringWorker : BackgroundService
{
    private readonly ILogger<PrinterMonitoringWorker> _logger;
    private readonly ISnmpService _snmpService;
    private readonly IConnectionMultiplexer _redis;
    private readonly TimeSpan _interval = TimeSpan.FromMinutes(5);

    // 테스트용 프린터 목록 (실제로는 DB에서 조회)
    private readonly List<(long id, string ip, string community)> _printers = new()
    {
        (1, "192.168.1.101", "public"),
        (2, "192.168.1.103", "public"),
        (3, "192.168.1.104", "public"),
        (4, "192.168.1.105", "public")
    };

    public PrinterMonitoringWorker(
        ILogger<PrinterMonitoringWorker> logger,
        ISnmpService snmpService,
        IConnectionMultiplexer redis)
    {
        _logger = logger;
        _snmpService = snmpService;
        _redis = redis;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("🚀 프린터 모니터링 워커 시작");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await MonitorAllPrintersAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ 프린터 모니터링 오류");
            }

            _logger.LogInformation("⏸️  다음 모니터링까지 대기: {Minutes}분", _interval.TotalMinutes);
            await Task.Delay(_interval, stoppingToken);
        }

        _logger.LogInformation("⏹️  프린터 모니터링 워커 종료");
    }

    /// <summary>
    /// 모든 프린터 상태 모니터링
    /// </summary>
    private async Task MonitorAllPrintersAsync()
    {
        _logger.LogInformation("🔄 전체 프린터 상태 조회 시작 ({Count}대)", _printers.Count);

        var tasks = _printers.Select(async printer =>
        {
            var (id, ip, community) = printer;

            try
            {
                // SNMP로 상태 조회
                var status = await _snmpService.GetPrinterStatusAsync(ip, community);

                if (status != null)
                {
                    status.PrinterId = id;

                    // Redis에 저장 (캐싱)
                    await SaveToRedisAsync(status);

                    // PostgreSQL에 저장 (TODO: DB 연동)
                    // await SaveToDatabaseAsync(status);

                    _logger.LogInformation("✅ 프린터 #{Id} 모니터링 완료: {Status}", id, status.Status);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ 프린터 #{Id} 모니터링 실패", id);
            }
        });

        await Task.WhenAll(tasks);

        _logger.LogInformation("✅ 전체 프린터 상태 조회 완료");
    }

    /// <summary>
    /// Redis에 프린터 상태 저장 (캐싱)
    /// </summary>
    private async Task SaveToRedisAsync(Models.PrinterStatus status)
    {
        try
        {
            var db = _redis.GetDatabase();
            var key = $"printer:status:{status.PrinterId}";
            var json = JsonSerializer.Serialize(status);

            await db.StringSetAsync(key, json, TimeSpan.FromMinutes(10));

            _logger.LogDebug("💾 Redis 저장: {Key}", key);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Redis 저장 실패: 프린터 #{PrinterId}", status.PrinterId);
        }
    }
}
