package com.canon.printmanagement.controller;

import com.canon.printmanagement.dto.DepartmentPrintStatistics;
import com.canon.printmanagement.dto.PrintStatisticsResponse;
import com.canon.printmanagement.entity.PrintJob;
import com.canon.printmanagement.service.CostOptimizationService;
import com.canon.printmanagement.service.PrintJobService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 출력 작업 API Controller
 * 
 * 출력 통계, 비용 분석, 출력 작업 관리
 */
@RestController
@RequestMapping("/api/v1/print-jobs")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Print Jobs", description = "출력 작업 관리 API")
public class PrintJobController {

    private final PrintJobService printJobService;
    private final CostOptimizationService costOptimizationService;

    /**
     * 전체 출력 통계 조회
     */
    @GetMapping("/stats")
    @Operation(summary = "전체 출력 통계", description = "기간별 전체 출력량, 비용, 절감 효과 조회")
    public ResponseEntity<PrintStatisticsResponse> getOverallStatistics(
        @Parameter(description = "시작 날짜 (기본: 이번 달 1일)")
        @RequestParam(required = false) 
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) 
        LocalDateTime startDate,
        
        @Parameter(description = "종료 날짜 (기본: 현재)")
        @RequestParam(required = false) 
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) 
        LocalDateTime endDate
    ) {
        if (startDate == null) {
            startDate = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }

        log.info("📊 전체 출력 통계 요청: {} ~ {}", startDate, endDate);
        
        PrintStatisticsResponse statistics = printJobService.getOverallStatistics(startDate, endDate);
        return ResponseEntity.ok(statistics);
    }

    /**
     * 부서별 출력 통계
     */
    @GetMapping("/by-department")
    @Operation(summary = "부서별 출력 통계", description = "부서별 출력량, 비용, 예산 사용률 조회")
    public ResponseEntity<List<DepartmentPrintStatistics>> getDepartmentStatistics(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        if (startDate == null) {
            startDate = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }

        log.info("🏢 부서별 출력 통계 요청: {} ~ {}", startDate, endDate);
        
        List<DepartmentPrintStatistics> statistics = printJobService.getDepartmentStatistics(startDate, endDate);
        return ResponseEntity.ok(statistics);
    }

    /**
     * 사용자별 출력 통계
     */
    @GetMapping("/by-user")
    @Operation(summary = "사용자별 출력 통계", description = "특정 부서의 사용자별 출력량 조회")
    public ResponseEntity<List<Object[]>> getUserStatistics(
        @Parameter(description = "부서 ID") @RequestParam Long departmentId,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        if (startDate == null) {
            startDate = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }

        log.info("👤 사용자별 출력 통계 요청: 부서 {}, {} ~ {}", departmentId, startDate, endDate);
        
        List<Object[]> statistics = printJobService.getUserStatisticsByDepartment(departmentId, startDate, endDate);
        return ResponseEntity.ok(statistics);
    }

    /**
     * 프린터별 출력 통계
     */
    @GetMapping("/by-printer")
    @Operation(summary = "프린터별 출력 통계", description = "프린터별 출력 작업 수, 페이지 수, 비용 조회")
    public ResponseEntity<List<Object[]>> getPrinterStatistics(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        if (startDate == null) {
            startDate = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }

        log.info("🖨️  프린터별 출력 통계 요청: {} ~ {}", startDate, endDate);
        
        List<Object[]> statistics = printJobService.getPrinterStatistics(startDate, endDate);
        return ResponseEntity.ok(statistics);
    }

    /**
     * 비용 분석
     */
    @GetMapping("/cost-analysis")
    @Operation(summary = "비용 분석", description = "부서별/사용자별 비용 상세 분석 및 절감 효과")
    public ResponseEntity<Map<String, Object>> getCostAnalysis(
        @RequestParam(required = false) Long departmentId,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        if (startDate == null) {
            startDate = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }

        log.info("💰 비용 분석 요청: 부서 {}, {} ~ {}", departmentId, startDate, endDate);

        return ResponseEntity.ok(Map.of(
            "message", "비용 분석 기능 구현 예정",
            "departmentId", departmentId != null ? departmentId : "전체",
            "period", startDate + " ~ " + endDate
        ));
    }

    /**
     * 출력 작업 목록 조회 (페이징)
     */
    @GetMapping
    @Operation(summary = "출력 작업 목록", description = "출력 작업 이력 조회 (페이징)")
    public ResponseEntity<Page<PrintJob>> getPrintJobs(
        @RequestParam(required = false) Long departmentId,
        @RequestParam(required = false) Long userId,
        @RequestParam(required = false) Long printerId,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(defaultValue = "timestamp,desc") String sort
    ) {
        if (startDate == null) {
            startDate = LocalDateTime.now().minusDays(7);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }

        String[] sortParams = sort.split(",");
        Sort sortOrder = Sort.by(Sort.Direction.fromString(sortParams[1]), sortParams[0]);
        Pageable pageable = PageRequest.of(page, size, sortOrder);

        Page<PrintJob> printJobs = printJobService.getPrintJobs(
            departmentId, userId, printerId, startDate, endDate, pageable
        );

        return ResponseEntity.ok(printJobs);
    }

    /**
     * 출력 작업 생성 (테스트용)
     */
    @PostMapping
    @Operation(summary = "출력 작업 생성", description = "새로운 출력 작업 등록 (테스트/시뮬레이션용)")
    public ResponseEntity<PrintJob> createPrintJob(@RequestBody PrintJob printJob) {
        log.info("🖨️  출력 작업 생성 요청: {}", printJob.getDocumentName());

        // 비용 절감 정책 적용
        costOptimizationService.applyPolicies(printJob);

        // 출력 작업 저장
        PrintJob savedJob = printJobService.createPrintJob(printJob);

        // 절감 효과 계산
        CostOptimizationService.CostSavingsReport savings = 
            costOptimizationService.calculateSavings(savedJob);

        log.info("✅ 출력 작업 생성 완료: {} (총 {}원 절감)", 
            savedJob.getId(), savings.getTotalSavings());

        return ResponseEntity.ok(savedJob);
    }
}
