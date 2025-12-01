using System.Net;
using System.Net.NetworkInformation;

namespace CanonMonitoringAgent.Services;

/// <summary>
/// 프린터 자동 검색 서비스
/// </summary>
public interface IPrinterDiscoveryService
{
    Task<List<string>> DiscoverPrintersAsync(string networkRange);
}

public class PrinterDiscoveryService : IPrinterDiscoveryService
{
    private readonly ILogger<PrinterDiscoveryService> _logger;

    public PrinterDiscoveryService(ILogger<PrinterDiscoveryService> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// 네트워크에서 프린터 자동 검색 (ICMP Ping)
    /// </summary>
    public async Task<List<string>> DiscoverPrintersAsync(string networkRange)
    {
        _logger.LogInformation("🔍 프린터 자동 검색 시작: {NetworkRange}", networkRange);

        var discoveredPrinters = new List<string>();

        // 간단한 네트워크 스캔 (192.168.1.0/24 형식)
        var baseIp = networkRange.Split('/')[0];
        var parts = baseIp.Split('.');
        var baseNetwork = $"{parts[0]}.{parts[1]}.{parts[2]}";

        var tasks = new List<Task<(string ip, bool isAlive)>>();

        // 1~254 범위 스캔
        for (int i = 1; i <= 254; i++)
        {
            var ip = $"{baseNetwork}.{i}";
            tasks.Add(PingAsync(ip));
        }

        var results = await Task.WhenAll(tasks);

        foreach (var (ip, isAlive) in results)
        {
            if (isAlive)
            {
                _logger.LogDebug("✅ 활성 IP 발견: {IpAddress}", ip);
                discoveredPrinters.Add(ip);
            }
        }

        _logger.LogInformation("🔍 프린터 검색 완료: {Count}개 발견", discoveredPrinters.Count);

        return discoveredPrinters;
    }

    /// <summary>
    /// ICMP Ping 체크
    /// </summary>
    private async Task<(string ip, bool isAlive)> PingAsync(string ipAddress)
    {
        try
        {
            using var ping = new Ping();
            var reply = await ping.SendPingAsync(ipAddress, 1000);
            return (ipAddress, reply.Status == IPStatus.Success);
        }
        catch
        {
            return (ipAddress, false);
        }
    }
}
