using System.Net;
using Lextm.SharpSnmpLib;
using Lextm.SharpSnmpLib.Messaging;
using CanonMonitoringAgent.Models;

namespace CanonMonitoringAgent.Services;

/// <summary>
/// SNMP 프로토콜을 사용한 프린터 상태 조회 서비스
/// </summary>
public interface ISnmpService
{
    Task<PrinterStatus?> GetPrinterStatusAsync(string ipAddress, string community = "public");
    Task<bool> IsPrinterOnlineAsync(string ipAddress, string community = "public");
}

public class SnmpService : ISnmpService
{
    private readonly ILogger<SnmpService> _logger;
    private readonly int _timeout = 5000;

    public SnmpService(ILogger<SnmpService> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// 프린터 온라인 여부 확인
    /// </summary>
    public async Task<bool> IsPrinterOnlineAsync(string ipAddress, string community = "public")
    {
        try
        {
            var endpoint = new IPEndPoint(IPAddress.Parse(ipAddress), 161);
            var variables = new List<Variable> 
            { 
                new Variable(new ObjectIdentifier(SnmpOids.SysName)) 
            };

            var result = await Task.Run(() => 
                Messenger.Get(VersionCode.V2, endpoint, 
                    new OctetString(community), variables, _timeout)
            );

            return result != null && result.Count > 0;
        }
        catch (Exception ex)
        {
            _logger.LogDebug("프린터 오프라인: {IpAddress} - {Error}", ipAddress, ex.Message);
            return false;
        }
    }

    /// <summary>
    /// 프린터 상태 조회 (SNMP)
    /// </summary>
    public async Task<PrinterStatus?> GetPrinterStatusAsync(string ipAddress, string community = "public")
    {
        try
        {
            _logger.LogDebug("SNMP 프린터 상태 조회 시작: {IpAddress}", ipAddress);

            var endpoint = new IPEndPoint(IPAddress.Parse(ipAddress), 161);
            var status = new PrinterStatus
            {
                Timestamp = DateTime.UtcNow,
                Status = "ONLINE"
            };

            // SNMP GET 요청 (토너 잔량)
            status.TonerLevelBlack = await GetTonerLevelAsync(endpoint, community, SnmpOids.TonerLevelBlack, SnmpOids.TonerMaxCapacityBlack);
            status.TonerLevelCyan = await GetTonerLevelAsync(endpoint, community, SnmpOids.TonerLevelCyan, SnmpOids.TonerMaxCapacityCyan);
            status.TonerLevelMagenta = await GetTonerLevelAsync(endpoint, community, SnmpOids.TonerLevelMagenta, SnmpOids.TonerMaxCapacityMagenta);
            status.TonerLevelYellow = await GetTonerLevelAsync(endpoint, community, SnmpOids.TonerLevelYellow, SnmpOids.TonerMaxCapacityYellow);

            // 용지 잔량
            status.PaperLevel = await GetPaperLevelAsync(endpoint, community);

            // 페이지 카운터
            status.TotalPageCount = await GetCounterAsync(endpoint, community, SnmpOids.TotalPageCount);
            status.ColorPageCount = await GetCounterAsync(endpoint, community, SnmpOids.ColorPageCount);

            // 오류 상태 확인
            var errorState = await GetErrorStateAsync(endpoint, community);
            if (!string.IsNullOrEmpty(errorState))
            {
                status.Status = "ERROR";
                status.ErrorMessage = errorState;
            }

            _logger.LogInformation("✅ 프린터 상태 조회 성공: {IpAddress} - 토너(K:{Black}% C:{Cyan}% M:{Magenta}% Y:{Yellow}%) 용지:{Paper}%",
                ipAddress, status.TonerLevelBlack, status.TonerLevelCyan, status.TonerLevelMagenta, status.TonerLevelYellow, status.PaperLevel);

            return status;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ 프린터 상태 조회 실패: {IpAddress}", ipAddress);
            return new PrinterStatus
            {
                Timestamp = DateTime.UtcNow,
                Status = "OFFLINE",
                ErrorMessage = ex.Message
            };
        }
    }

    /// <summary>
    /// 토너 잔량 조회 (퍼센트)
    /// </summary>
    private async Task<int?> GetTonerLevelAsync(IPEndPoint endpoint, string community, string levelOid, string maxOid)
    {
        try
        {
            var variables = new List<Variable>
            {
                new Variable(new ObjectIdentifier(levelOid)),
                new Variable(new ObjectIdentifier(maxOid))
            };

            var result = await Task.Run(() =>
                Messenger.Get(VersionCode.V2, endpoint, new OctetString(community), variables, _timeout)
            );

            if (result.Count >= 2)
            {
                var currentLevel = Convert.ToInt32(result[0].Data.ToString());
                var maxCapacity = Convert.ToInt32(result[1].Data.ToString());

                if (maxCapacity > 0)
                {
                    return (int)((double)currentLevel / maxCapacity * 100);
                }
            }

            return null;
        }
        catch (Exception ex)
        {
            _logger.LogDebug("토너 잔량 조회 실패: {Oid} - {Error}", levelOid, ex.Message);
            return null;
        }
    }

    /// <summary>
    /// 용지 잔량 조회 (퍼센트)
    /// </summary>
    private async Task<int?> GetPaperLevelAsync(IPEndPoint endpoint, string community)
    {
        try
        {
            var variables = new List<Variable>
            {
                new Variable(new ObjectIdentifier(SnmpOids.PaperLevel)),
                new Variable(new ObjectIdentifier(SnmpOids.PaperMaxCapacity))
            };

            var result = await Task.Run(() =>
                Messenger.Get(VersionCode.V2, endpoint, new OctetString(community), variables, _timeout)
            );

            if (result.Count >= 2)
            {
                var currentLevel = Convert.ToInt32(result[0].Data.ToString());
                var maxCapacity = Convert.ToInt32(result[1].Data.ToString());

                if (maxCapacity > 0)
                {
                    return (int)((double)currentLevel / maxCapacity * 100);
                }
            }

            return null;
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// 페이지 카운터 조회
    /// </summary>
    private async Task<long?> GetCounterAsync(IPEndPoint endpoint, string community, string oid)
    {
        try
        {
            var variables = new List<Variable>
            {
                new Variable(new ObjectIdentifier(oid))
            };

            var result = await Task.Run(() =>
                Messenger.Get(VersionCode.V2, endpoint, new OctetString(community), variables, _timeout)
            );

            if (result.Count > 0)
            {
                return Convert.ToInt64(result[0].Data.ToString());
            }

            return null;
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// 오류 상태 조회
    /// </summary>
    private async Task<string?> GetErrorStateAsync(IPEndPoint endpoint, string community)
    {
        try
        {
            var variables = new List<Variable>
            {
                new Variable(new ObjectIdentifier(SnmpOids.PrinterDetectedErrorState))
            };

            var result = await Task.Run(() =>
                Messenger.Get(VersionCode.V2, endpoint, new OctetString(community), variables, _timeout)
            );

            if (result.Count > 0)
            {
                var errorByte = result[0].Data.ToString();
                if (errorByte != "00")
                {
                    return ParseErrorState(errorByte);
                }
            }

            return null;
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// 오류 코드 파싱
    /// </summary>
    private string ParseErrorState(string errorByte)
    {
        // RFC 3805 - Printer MIB 오류 비트
        var errors = new List<string>();
        
        // 간단한 오류 파싱 로직 (실제로는 비트 플래그 분석)
        if (errorByte.Contains("1")) errors.Add("용지 없음");
        if (errorByte.Contains("2")) errors.Add("용지 걸림");
        if (errorByte.Contains("4")) errors.Add("토너 부족");
        if (errorByte.Contains("8")) errors.Add("커버 열림");

        return errors.Count > 0 ? string.Join(", ", errors) : "알 수 없는 오류";
    }
}
