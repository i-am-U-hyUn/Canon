package com.canon.printmanagement.service;

import com.canon.printmanagement.dto.DepartmentPrintStatistics;
import com.canon.printmanagement.dto.PrintStatisticsResponse;
import com.canon.printmanagement.entity.PrintJob;
import com.canon.printmanagement.repository.PrintJobRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 출력 작업 서비스
 * 
 * 출력량 통계, 비용 분석, 비용 절감 효과 계산
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class PrintJobService {

    private final PrintJobRepository printJobRepository;

    @Value("${canon.cost.per-page.bw:30}")
    private Double costPerPageBw;

    @Value("${canon.cost.per-page.color:150}")
    private Double costPerPageColor;

    @Value("${canon.cost.per-page.duplex:20}")
    private Double costPerPageDuplex;

    /**
     * 전체 출력 통계 조회 (캐시 적용)
     */
    @Cacheable(value = "printStatistics", key = "#startDate + '-' + #endDate")
    public PrintStatisticsResponse getOverallStatistics(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("전체 출력 통계 조회: {} ~ {}", startDate, endDate);

        // 비용 절감 효과 분석
        Double colorCostDiff = costPerPageColor - costPerPageBw; // 120원 절감
        Object[] savingsData = printJobRepository.getCostSavingsAnalysis(
            startDate, endDate, colorCostDiff, costPerPageDuplex
        );

        return PrintStatisticsResponse.builder()
            .totalJobs(((Number) savingsData[0]).longValue())
            .totalPages(0L) // 추가 쿼리 필요
            .totalColorPages(0L)
            .totalBwPages(0L)
            .totalCost(BigDecimal.ZERO)
            .colorConvertedCount(((Number) savingsData[0]).longValue())
            .duplexEnforcedCount(((Number) savingsData[1]).longValue())
            .colorSavings(new BigDecimal(savingsData[2].toString()))
            .duplexSavings(new BigDecimal(savingsData[3].toString()))
            .totalSavings(
                new BigDecimal(savingsData[2].toString())
                    .add(new BigDecimal(savingsData[3].toString()))
            )
            .periodStart(startDate)
            .periodEnd(endDate)
            .build();
    }

    /**
     * 부서별 출력 통계
     */
    @Cacheable(value = "departmentStatistics", key = "#startDate + '-' + #endDate")
    public List<DepartmentPrintStatistics> getDepartmentStatistics(
        LocalDateTime startDate, 
        LocalDateTime endDate
    ) {
        log.info("부서별 출력 통계 조회: {} ~ {}", startDate, endDate);

        List<Object[]> results = printJobRepository.getDepartmentStatistics(startDate, endDate);
        List<DepartmentPrintStatistics> statistics = new ArrayList<>();

        for (Object[] row : results) {
            DepartmentPrintStatistics stat = DepartmentPrintStatistics.builder()
                .departmentId(((Number) row[0]).longValue())
                .totalJobs(((Number) row[1]).longValue())
                .totalPages(((Number) row[2]).longValue())
                .totalColorPages(((Number) row[3]).longValue())
                .totalBwPages(((Number) row[4]).longValue())
                .totalCost((BigDecimal) row[5])
                .build();

            // 예산 정보는 별도 조회 필요
            // stat.setMonthlyBudget(...);
            // stat.setBudgetUsagePercentage(...);

            statistics.add(stat);
        }

        return statistics;
    }

    /**
     * 사용자별 출력 통계
     */
    public List<Object[]> getUserStatisticsByDepartment(
        Long departmentId,
        LocalDateTime startDate,
        LocalDateTime endDate
    ) {
        log.info("사용자별 출력 통계 조회: 부서 {}, {} ~ {}", departmentId, startDate, endDate);
        return printJobRepository.getUserStatisticsByDepartment(departmentId, startDate, endDate);
    }

    /**
     * 프린터별 출력 통계
     */
    @Cacheable(value = "printerStatistics", key = "#startDate + '-' + #endDate")
    public List<Object[]> getPrinterStatistics(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("프린터별 출력 통계 조회: {} ~ {}", startDate, endDate);
        return printJobRepository.getPrinterStatistics(startDate, endDate);
    }

    /**
     * 출력 작업 조회 (페이징)
     */
    public Page<PrintJob> getPrintJobs(
        Long departmentId,
        Long userId,
        Long printerId,
        LocalDateTime startDate,
        LocalDateTime endDate,
        Pageable pageable
    ) {
        if (departmentId != null) {
            return printJobRepository.findByDepartmentIdAndTimestampBetween(
                departmentId, startDate, endDate, pageable
            );
        } else if (userId != null) {
            return printJobRepository.findByUserIdAndTimestampBetween(
                userId, startDate, endDate, pageable
            );
        } else if (printerId != null) {
            return printJobRepository.findByPrinterIdAndTimestampBetween(
                printerId, startDate, endDate, pageable
            );
        }

        return Page.empty(pageable);
    }

    /**
     * 출력 작업 생성
     */
    @Transactional
    public PrintJob createPrintJob(PrintJob printJob) {
        // 비용 계산
        calculateCost(printJob);
        
        log.info("출력 작업 생성: {} (사용자: {}, 프린터: {})", 
            printJob.getDocumentName(), printJob.getUserId(), printJob.getPrinterId());

        return printJobRepository.save(printJob);
    }

    /**
     * 비용 계산
     */
    private void calculateCost(PrintJob printJob) {
        BigDecimal bwCost = BigDecimal.valueOf(printJob.getBwPageCount() * costPerPageBw);
        BigDecimal colorCost = BigDecimal.valueOf(printJob.getColorPageCount() * costPerPageColor);
        
        // 양면 출력 할인
        if (printJob.getIsDuplex()) {
            BigDecimal duplexDiscount = BigDecimal.valueOf(
                printJob.getPageCount() * costPerPageDuplex
            );
            bwCost = bwCost.subtract(duplexDiscount);
        }

        printJob.setCostBw(bwCost);
        printJob.setCostColor(colorCost);
        printJob.setTotalCost(bwCost.add(colorCost));
    }
}
