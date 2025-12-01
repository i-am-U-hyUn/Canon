package com.canon.printmanagement.repository;

import com.canon.printmanagement.entity.PrintJob;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 출력 작업 Repository
 */
@Repository
public interface PrintJobRepository extends JpaRepository<PrintJob, Long> {

    /**
     * 부서별 출력 작업 조회
     */
    Page<PrintJob> findByDepartmentIdAndTimestampBetween(
        Long departmentId, 
        LocalDateTime startDate, 
        LocalDateTime endDate,
        Pageable pageable
    );

    /**
     * 사용자별 출력 작업 조회
     */
    Page<PrintJob> findByUserIdAndTimestampBetween(
        Long userId,
        LocalDateTime startDate,
        LocalDateTime endDate,
        Pageable pageable
    );

    /**
     * 프린터별 출력 작업 조회
     */
    Page<PrintJob> findByPrinterIdAndTimestampBetween(
        Long printerId,
        LocalDateTime startDate,
        LocalDateTime endDate,
        Pageable pageable
    );

    /**
     * 전체 출력 통계 (부서별)
     */
    @Query("""
        SELECT 
            pj.departmentId as departmentId,
            COUNT(pj.id) as totalJobs,
            SUM(pj.pageCount) as totalPages,
            SUM(pj.colorPageCount) as totalColorPages,
            SUM(pj.bwPageCount) as totalBwPages,
            SUM(pj.totalCost) as totalCost
        FROM PrintJob pj
        WHERE pj.timestamp BETWEEN :startDate AND :endDate
        GROUP BY pj.departmentId
        """)
    List<Object[]> getDepartmentStatistics(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    /**
     * 사용자별 통계
     */
    @Query("""
        SELECT 
            pj.userId as userId,
            COUNT(pj.id) as totalJobs,
            SUM(pj.pageCount) as totalPages,
            SUM(pj.colorPageCount) as totalColorPages,
            SUM(pj.totalCost) as totalCost
        FROM PrintJob pj
        WHERE pj.timestamp BETWEEN :startDate AND :endDate
        AND pj.departmentId = :departmentId
        GROUP BY pj.userId
        ORDER BY SUM(pj.totalCost) DESC
        """)
    List<Object[]> getUserStatisticsByDepartment(
        @Param("departmentId") Long departmentId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    /**
     * 프린터별 통계
     */
    @Query("""
        SELECT 
            pj.printerId as printerId,
            COUNT(pj.id) as totalJobs,
            SUM(pj.pageCount) as totalPages,
            SUM(pj.totalCost) as totalCost
        FROM PrintJob pj
        WHERE pj.timestamp BETWEEN :startDate AND :endDate
        GROUP BY pj.printerId
        ORDER BY COUNT(pj.id) DESC
        """)
    List<Object[]> getPrinterStatistics(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    /**
     * 비용 절감 효과 분석
     */
    @Query("""
        SELECT 
            COUNT(*) FILTER (WHERE pj.wasColorConverted = true) as colorConvertedCount,
            COUNT(*) FILTER (WHERE pj.wasDuplexEnforced = true) as duplexEnforcedCount,
            SUM(CASE WHEN pj.wasColorConverted = true THEN (pj.colorPageCount * :colorCostDiff) ELSE 0 END) as colorSavings,
            SUM(CASE WHEN pj.wasDuplexEnforced = true THEN (pj.pageCount * :duplexSavings) ELSE 0 END) as duplexSavings
        FROM PrintJob pj
        WHERE pj.timestamp BETWEEN :startDate AND :endDate
        """)
    Object[] getCostSavingsAnalysis(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        @Param("colorCostDiff") Double colorCostDiff,
        @Param("duplexSavings") Double duplexSavings
    );
}
