package com.canon.printmanagement.repository;

import com.canon.printmanagement.entity.Printer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 프린터 Repository
 */
@Repository
public interface PrinterRepository extends JpaRepository<Printer, Long> {

    /**
     * 시리얼 번호로 프린터 조회
     */
    Optional<Printer> findBySerialNumber(String serialNumber);

    /**
     * IP 주소로 프린터 조회
     */
    Optional<Printer> findByIpAddress(String ipAddress);

    /**
     * 부서별 프린터 조회
     */
    List<Printer> findByDepartmentId(Long departmentId);

    /**
     * 활성 프린터 목록
     */
    List<Printer> findByIsActiveTrue();

    /**
     * 모델별 프린터 조회
     */
    List<Printer> findByModelId(Long modelId);

    /**
     * 프린터 상태 요약 (최신 상태와 함께)
     */
    @Query("""
        SELECT 
            p.id,
            p.name,
            p.serialNumber,
            p.ipAddress,
            p.location,
            p.isActive,
            ps.status,
            ps.tonerLevelBlack,
            ps.tonerLevelCyan,
            ps.tonerLevelMagenta,
            ps.tonerLevelYellow,
            ps.paperLevel,
            ps.errorMessage
        FROM Printer p
        LEFT JOIN PrinterStatus ps ON p.id = ps.printerId
        WHERE p.isActive = true
        AND ps.timestamp = (
            SELECT MAX(ps2.timestamp) 
            FROM PrinterStatus ps2 
            WHERE ps2.printerId = p.id
        )
        """)
    List<Object[]> findAllWithLatestStatus();
}
