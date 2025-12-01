package com.canon.printmanagement.repository;

import com.canon.printmanagement.entity.PrinterStatus;
import com.canon.printmanagement.entity.PrinterStatusId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 프린터 상태 Repository (TimescaleDB)
 */
@Repository
public interface PrinterStatusRepository extends JpaRepository<PrinterStatus, PrinterStatusId> {

    /**
     * 프린터의 최신 상태 조회
     */
    @Query("""
        SELECT ps FROM PrinterStatus ps
        WHERE ps.printerId = :printerId
        ORDER BY ps.timestamp DESC
        LIMIT 1
        """)
    Optional<PrinterStatus> findLatestByPrinterId(@Param("printerId") Long printerId);

    /**
     * 프린터 상태 이력 조회
     */
    List<PrinterStatus> findByPrinterIdAndTimestampBetweenOrderByTimestampDesc(
        Long printerId,
        LocalDateTime startDate,
        LocalDateTime endDate
    );

    /**
     * 토너 부족 프린터 조회
     */
    @Query("""
        SELECT ps FROM PrinterStatus ps
        WHERE ps.timestamp >= :since
        AND (
            ps.tonerLevelBlack <= :threshold OR
            ps.tonerLevelCyan <= :threshold OR
            ps.tonerLevelMagenta <= :threshold OR
            ps.tonerLevelYellow <= :threshold
        )
        AND ps.timestamp = (
            SELECT MAX(ps2.timestamp)
            FROM PrinterStatus ps2
            WHERE ps2.printerId = ps.printerId
        )
        """)
    List<PrinterStatus> findPrintersWithLowToner(
        @Param("threshold") Integer threshold,
        @Param("since") LocalDateTime since
    );

    /**
     * 오류 상태 프린터 조회
     */
    @Query("""
        SELECT ps FROM PrinterStatus ps
        WHERE ps.status IN ('ERROR', 'WARNING')
        AND ps.timestamp >= :since
        AND ps.timestamp = (
            SELECT MAX(ps2.timestamp)
            FROM PrinterStatus ps2
            WHERE ps2.printerId = ps.printerId
        )
        """)
    List<PrinterStatus> findPrintersWithErrors(@Param("since") LocalDateTime since);

    /**
     * 용지 부족 프린터 조회
     */
    @Query("""
        SELECT ps FROM PrinterStatus ps
        WHERE ps.paperLevel <= :threshold
        AND ps.timestamp >= :since
        AND ps.timestamp = (
            SELECT MAX(ps2.timestamp)
            FROM PrinterStatus ps2
            WHERE ps2.printerId = ps.printerId
        )
        """)
    List<PrinterStatus> findPrintersWithLowPaper(
        @Param("threshold") Integer threshold,
        @Param("since") LocalDateTime since
    );
}
