package com.canon.printmanagement.dto;

import lombok.*;
import java.math.BigDecimal;

/**
 * 부서별 출력 통계 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentPrintStatistics {

    private Long departmentId;
    private String departmentName;
    private String departmentCode;
    
    private Long totalJobs;
    private Long totalPages;
    private Long totalColorPages;
    private Long totalBwPages;
    private BigDecimal totalCost;
    
    private BigDecimal monthlyBudget;
    private BigDecimal budgetUsagePercentage;
    private BigDecimal remainingBudget;
}
