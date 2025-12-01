package com.canon.printmanagement.controller;

import com.canon.printmanagement.dto.PrinterStatusResponse;
import com.canon.printmanagement.entity.Printer;
import com.canon.printmanagement.entity.PrinterStatus;
import com.canon.printmanagement.repository.PrinterRepository;
import com.canon.printmanagement.repository.PrinterStatusRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 프린터 관리 API Controller
 * 
 * 장비 모니터링, 상태 조회, 알림 관리
 */
@RestController
@RequestMapping("/api/v1/printers")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Printers", description = "프린터/복합기 관리 API")
public class PrinterController {

    private final PrinterRepository printerRepository;
    private final PrinterStatusRepository printerStatusRepository;

    /**
     * 프린터 목록 조회
     */
    @GetMapping
    @Operation(summary = "프린터 목록", description = "등록된 모든 프린터 조회")
    public ResponseEntity<List<Printer>> getAllPrinters(
        @RequestParam(required = false) Boolean activeOnly
    ) {
        log.info("🖨️  프린터 목록 조회 (활성만: {})", activeOnly);

        List<Printer> printers = activeOnly != null && activeOnly 
            ? printerRepository.findByIsActiveTrue()
            : printerRepository.findAll();

        return ResponseEntity.ok(printers);
    }

    /**
     * 프린터 상세 조회
     */
    @GetMapping("/{id}")
    @Operation(summary = "프린터 상세", description = "프린터 상세 정보 조회")
    public ResponseEntity<Printer> getPrinter(@PathVariable Long id) {
        log.info("🖨️  프린터 상세 조회: {}", id);

        Optional<Printer> printer = printerRepository.findById(id);
        return printer.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 프린터 실시간 상태 조회
     */
    @GetMapping("/{id}/status")
    @Operation(summary = "프린터 실시간 상태", description = "프린터의 최신 상태 정보 조회")
    public ResponseEntity<PrinterStatus> getPrinterStatus(@PathVariable Long id) {
        log.info("📊 프린터 상태 조회: {}", id);

        Optional<PrinterStatus> status = printerStatusRepository.findLatestByPrinterId(id);
        return status.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 프린터 상태 이력 조회
     */
    @GetMapping("/{id}/status-history")
    @Operation(summary = "프린터 상태 이력", description = "프린터 상태 변화 이력 조회")
    public ResponseEntity<List<PrinterStatus>> getPrinterStatusHistory(
        @PathVariable Long id,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        if (startDate == null) {
            startDate = LocalDateTime.now().minusDays(7);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }

        log.info("📈 프린터 상태 이력 조회: {}, {} ~ {}", id, startDate, endDate);

        List<PrinterStatus> history = printerStatusRepository
            .findByPrinterIdAndTimestampBetweenOrderByTimestampDesc(id, startDate, endDate);

        return ResponseEntity.ok(history);
    }

    /**
     * 토너 부족 프린터 조회
     */
    @GetMapping("/alerts/low-toner")
    @Operation(summary = "토너 부족 프린터", description = "토너 잔량이 임계값 이하인 프린터 목록")
    public ResponseEntity<List<PrinterStatus>> getPrintersWithLowToner(
        @RequestParam(defaultValue = "15") Integer threshold
    ) {
        log.info("⚠️  토너 부족 프린터 조회 (임계값: {}%)", threshold);

        List<PrinterStatus> printers = printerStatusRepository.findPrintersWithLowToner(
            threshold, LocalDateTime.now().minusMinutes(30)
        );

        return ResponseEntity.ok(printers);
    }

    /**
     * 용지 부족 프린터 조회
     */
    @GetMapping("/alerts/low-paper")
    @Operation(summary = "용지 부족 프린터", description = "용지 잔량이 임계값 이하인 프린터 목록")
    public ResponseEntity<List<PrinterStatus>> getPrintersWithLowPaper(
        @RequestParam(defaultValue = "20") Integer threshold
    ) {
        log.info("⚠️  용지 부족 프린터 조회 (임계값: {}%)", threshold);

        List<PrinterStatus> printers = printerStatusRepository.findPrintersWithLowPaper(
            threshold, LocalDateTime.now().minusMinutes(30)
        );

        return ResponseEntity.ok(printers);
    }

    /**
     * 오류 발생 프린터 조회
     */
    @GetMapping("/alerts/errors")
    @Operation(summary = "오류 발생 프린터", description = "오류/경고 상태인 프린터 목록")
    public ResponseEntity<List<PrinterStatus>> getPrintersWithErrors() {
        log.info("🚨 오류 발생 프린터 조회");

        List<PrinterStatus> printers = printerStatusRepository.findPrintersWithErrors(
            LocalDateTime.now().minusMinutes(30)
        );

        return ResponseEntity.ok(printers);
    }

    /**
     * 프린터 예방 정비 예측 (추후 ML 모델 연동)
     */
    @PostMapping("/{id}/predict-maintenance")
    @Operation(summary = "예방 정비 예측", description = "프린터 고장 예측 및 정비 시기 추천")
    public ResponseEntity<String> predictMaintenance(@PathVariable Long id) {
        log.info("🔧 예방 정비 예측 요청: {}", id);

        // TODO: ML 모델 연동하여 고장 예측
        return ResponseEntity.ok("예방 정비 예측 기능 개발 예정 (ML 모델 연동)");
    }

    /**
     * 프린터 등록
     */
    @PostMapping
    @Operation(summary = "프린터 등록", description = "새로운 프린터 등록")
    public ResponseEntity<Printer> registerPrinter(@RequestBody Printer printer) {
        log.info("➕ 프린터 등록: {}", printer.getName());

        Printer savedPrinter = printerRepository.save(printer);
        return ResponseEntity.ok(savedPrinter);
    }

    /**
     * 프린터 수정
     */
    @PutMapping("/{id}")
    @Operation(summary = "프린터 수정", description = "프린터 정보 수정")
    public ResponseEntity<Printer> updatePrinter(
        @PathVariable Long id,
        @RequestBody Printer printer
    ) {
        log.info("✏️  프린터 수정: {}", id);

        return printerRepository.findById(id)
            .map(existingPrinter -> {
                printer.setId(id);
                Printer updated = printerRepository.save(printer);
                return ResponseEntity.ok(updated);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 프린터 삭제 (비활성화)
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "프린터 삭제", description = "프린터 비활성화")
    public ResponseEntity<Void> deletePrinter(@PathVariable Long id) {
        log.info("🗑️  프린터 삭제: {}", id);

        return printerRepository.findById(id)
            .map(printer -> {
                printer.setIsActive(false);
                printerRepository.save(printer);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }
}
