using MailKit.Net.Smtp;
using MimeKit;

namespace CanonMonitoringAgent.Services;

/// <summary>
/// 알림 전송 서비스 (Email/Slack)
/// </summary>
public interface INotificationService
{
    Task SendEmailAsync(string to, string subject, string body);
    Task SendSlackAsync(string message);
}

public class NotificationService : INotificationService
{
    private readonly ILogger<NotificationService> _logger;
    private readonly string _smtpHost;
    private readonly int _smtpPort;
    private readonly string _smtpUser;
    private readonly string _smtpPassword;
    private readonly string _slackWebhook;

    public NotificationService(
        ILogger<NotificationService> logger,
        IConfiguration configuration)
    {
        _logger = logger;
        _smtpHost = configuration["Notification:SmtpHost"] ?? "";
        _smtpPort = int.Parse(configuration["Notification:SmtpPort"] ?? "587");
        _smtpUser = configuration["Notification:SmtpUser"] ?? "";
        _smtpPassword = configuration["Notification:SmtpPassword"] ?? "";
        _slackWebhook = configuration["Notification:SlackWebhook"] ?? "";
    }

    /// <summary>
    /// 이메일 전송
    /// </summary>
    public async Task SendEmailAsync(string to, string subject, string body)
    {
        if (string.IsNullOrEmpty(_smtpHost) || string.IsNullOrEmpty(_smtpUser))
        {
            _logger.LogWarning("SMTP 설정이 없어 이메일 전송을 건너뜁니다.");
            return;
        }

        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("Canon Print Management", _smtpUser));
            message.To.Add(new MailboxAddress("", to));
            message.Subject = subject;

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = body,
                TextBody = body
            };
            message.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();
            await client.ConnectAsync(_smtpHost, _smtpPort, MailKit.Security.SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(_smtpUser, _smtpPassword);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            _logger.LogInformation("✉️  이메일 전송 성공: {To} - {Subject}", to, subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ 이메일 전송 실패: {To} - {Subject}", to, subject);
        }
    }

    /// <summary>
    /// Slack 알림 전송
    /// </summary>
    public async Task SendSlackAsync(string message)
    {
        if (string.IsNullOrEmpty(_slackWebhook))
        {
            _logger.LogDebug("Slack Webhook이 설정되지 않았습니다.");
            return;
        }

        try
        {
            using var httpClient = new HttpClient();
            var payload = new
            {
                text = message,
                username = "Canon Print Alert",
                icon_emoji = ":printer:"
            };

            var json = System.Text.Json.JsonSerializer.Serialize(payload);
            var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");

            var response = await httpClient.PostAsync(_slackWebhook, content);
            response.EnsureSuccessStatusCode();

            _logger.LogInformation("📢 Slack 알림 전송 성공");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Slack 알림 전송 실패");
        }
    }
}
