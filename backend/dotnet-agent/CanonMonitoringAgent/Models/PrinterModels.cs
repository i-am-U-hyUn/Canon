namespace CanonMonitoringAgent.Models;

/// <summary>
/// 프린터 상태 모델
/// </summary>
public class PrinterStatus
{
    public long PrinterId { get; set; }
    public DateTime Timestamp { get; set; }
    public string Status { get; set; } = "UNKNOWN";
    
    // 토너 잔량 (0-100%)
    public int? TonerLevelBlack { get; set; }
    public int? TonerLevelCyan { get; set; }
    public int? TonerLevelMagenta { get; set; }
    public int? TonerLevelYellow { get; set; }
    
    // 용지 잔량 (0-100%)
    public int? PaperLevel { get; set; }
    
    // 오류 정보
    public string? ErrorCode { get; set; }
    public string? ErrorMessage { get; set; }
    
    // 카운터
    public long? TotalPageCount { get; set; }
    public long? ColorPageCount { get; set; }
}

/// <summary>
/// 프린터 정보 모델
/// </summary>
public class PrinterInfo
{
    public long Id { get; set; }
    public string Name { get; set; } = "";
    public string SerialNumber { get; set; } = "";
    public string IpAddress { get; set; } = "";
    public string? MacAddress { get; set; }
    public long? ModelId { get; set; }
    public string? Location { get; set; }
    public long? DepartmentId { get; set; }
    public string SnmpCommunity { get; set; } = "public";
    public string SnmpVersion { get; set; } = "v2c";
    public bool IsActive { get; set; } = true;
}

/// <summary>
/// SNMP OID 상수
/// </summary>
public static class SnmpOids
{
    // 표준 프린터 MIB (RFC 3805)
    public const string SysDescr = "1.3.6.1.2.1.1.1.0";
    public const string SysUpTime = "1.3.6.1.2.1.1.3.0";
    public const string SysName = "1.3.6.1.2.1.1.5.0";
    
    // 프린터 상태
    public const string PrinterStatus = "1.3.6.1.2.1.25.3.5.1.1.1";
    public const string PrinterDetectedErrorState = "1.3.6.1.2.1.25.3.5.1.2.1";
    
    // 토너 잔량 (prtMarkerSuppliesLevel)
    public const string TonerLevelBlack = "1.3.6.1.2.1.43.11.1.1.9.1.1";
    public const string TonerLevelCyan = "1.3.6.1.2.1.43.11.1.1.9.1.2";
    public const string TonerLevelMagenta = "1.3.6.1.2.1.43.11.1.1.9.1.3";
    public const string TonerLevelYellow = "1.3.6.1.2.1.43.11.1.1.9.1.4";
    
    // 토너 최대 용량 (prtMarkerSuppliesMaxCapacity)
    public const string TonerMaxCapacityBlack = "1.3.6.1.2.1.43.11.1.1.8.1.1";
    public const string TonerMaxCapacityCyan = "1.3.6.1.2.1.43.11.1.1.8.1.2";
    public const string TonerMaxCapacityMagenta = "1.3.6.1.2.1.43.11.1.1.8.1.3";
    public const string TonerMaxCapacityYellow = "1.3.6.1.2.1.43.11.1.1.8.1.4";
    
    // 용지 상태
    public const string PaperLevel = "1.3.6.1.2.1.43.8.2.1.10.1.1";
    public const string PaperMaxCapacity = "1.3.6.1.2.1.43.8.2.1.9.1.1";
    
    // 페이지 카운터
    public const string TotalPageCount = "1.3.6.1.2.1.43.10.2.1.4.1.1";
    public const string ColorPageCount = "1.3.6.1.2.1.43.10.2.1.4.1.2";
    
    // Canon 전용 OID (제조사별로 다를 수 있음)
    public const string CanonSerialNumber = "1.3.6.1.4.1.1602.1.2.1.4.0";
    public const string CanonModelName = "1.3.6.1.4.1.1602.1.1.1.1.0";
}
