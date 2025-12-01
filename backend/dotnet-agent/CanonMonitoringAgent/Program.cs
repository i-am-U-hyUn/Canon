using CanonMonitoringAgent.Services;
using CanonMonitoringAgent.Workers;
using Serilog;

var builder = Host.CreateApplicationBuilder(args);

// Serilog 설정
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/canon-monitoring-agent-.log", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Services.AddSerilog();

// Configuration
builder.Services.Configure<SnmpConfig>(builder.Configuration.GetSection("SnmpConfig"));
builder.Services.Configure<NotificationConfig>(builder.Configuration.GetSection("Notification"));

// Services
builder.Services.AddSingleton<ISnmpService, SnmpService>();
builder.Services.AddSingleton<INotificationService, NotificationService>();
builder.Services.AddSingleton<IPrinterDiscoveryService, PrinterDiscoveryService>();

// Redis
var redisConnection = builder.Configuration.GetConnectionString("Redis") ?? "localhost:6379";
builder.Services.AddSingleton<StackExchange.Redis.IConnectionMultiplexer>(
    StackExchange.Redis.ConnectionMultiplexer.Connect(redisConnection)
);

// Background Workers
builder.Services.AddHostedService<PrinterMonitoringWorker>();
builder.Services.AddHostedService<AlertWorker>();

var host = builder.Build();

Log.Information("╔═══════════════════════════════════════════════════════════╗");
Log.Information("║                                                           ║");
Log.Information("║   Canon Monitoring Agent Started                         ║");
Log.Information("║   SNMP/IPP 프린터 모니터링 에이전트                        ║");
Log.Information("║                                                           ║");
Log.Information("╚═══════════════════════════════════════════════════════════╝");

await host.RunAsync();

// Configuration classes
public class SnmpConfig
{
    public string Community { get; set; } = "public";
    public int Timeout { get; set; } = 5000;
    public string NetworkRange { get; set; } = "192.168.1.0/24";
}

public class NotificationConfig
{
    public string SmtpHost { get; set; } = "";
    public int SmtpPort { get; set; } = 587;
    public string SmtpUser { get; set; } = "";
    public string SmtpPassword { get; set; } = "";
    public string SlackWebhook { get; set; } = "";
}
