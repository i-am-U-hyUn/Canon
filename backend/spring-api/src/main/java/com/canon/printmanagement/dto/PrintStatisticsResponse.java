package com.canon.printmanagement.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 출력 통계 응답 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrintStatisticsResponse {

    private Long totalJobs;
    private Long totalPages;
    private Long totalColorPages;
    private Long totalBwPages;
    private BigDecimal totalCost;
    
    private Long colorConvertedCount;
    private Long duplexEnforcedCount;
    private BigDecimal colorSavings;
    private BigDecimal duplexSavings;
    private BigDecimal totalSavings;
    
    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;
}
