package com.canon.printmanagement.service;

import com.canon.printmanagement.entity.PrintJob;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * 비용 절감 정책 엔진
 * 
 * 1. 컬러 → 흑백 자동 변환
 * 2. 양면 출력 강제
 * 3. 할당량 관리
 */
@Service
@Slf4j
public class CostOptimizationService {

    @Value("${canon.policy.auto-convert-color-to-bw:true}")
    private Boolean autoConvertColorToBw;

    @Value("${canon.policy.force-duplex:true}")
    private Boolean forceDuplex;

    @Value("${canon.policy.color-image-threshold:0.1}")
    private Double colorImageThreshold;

    /**
     * 출력 작업에 비용 절감 정책 적용
     */
    public void applyPolicies(PrintJob printJob) {
        log.debug("비용 절감 정책 적용 시작: {}", printJob.getJobId());

        // 1. 컬러 → 흑백 자동 변환 정책
        if (autoConvertColorToBw && shouldConvertColorToBw(printJob)) {
            applyColorToBwConversion(printJob);
        }

        // 2. 양면 출력 강제 정책
        if (forceDuplex && shouldForceDuplex(printJob)) {
            applyDuplexEnforcement(printJob);
        }

        log.debug("비용 절감 정책 적용 완료: {}", printJob.getJobId());
    }

    /**
     * 컬러 → 흑백 변환 여부 판단
     * 
     * 로직:
     * - 컬러 페이지 비율이 임계값(기본 10%) 미만이면 변환
     * - 예: 100페이지 중 컬러 5페이지 → 흑백 변환
     */
    private boolean shouldConvertColorToBw(PrintJob printJob) {
        if (printJob.getColorPageCount() == null || printJob.getColorPageCount() == 0) {
            return false;
        }

        double colorRatio = (double) printJob.getColorPageCount() / printJob.getPageCount();
        
        if (colorRatio <= colorImageThreshold) {
            log.info("컬러 비율 {}% ≤ {}% → 흑백 변환 대상", 
                colorRatio * 100, colorImageThreshold * 100);
            return true;
        }

        return false;
    }

    /**
     * 컬러 → 흑백 변환 적용
     */
    private void applyColorToBwConversion(PrintJob printJob) {
        int colorPages = printJob.getColorPageCount();
        
        // 컬러 페이지를 흑백으로 변환
        printJob.setBwPageCount(printJob.getBwPageCount() + colorPages);
        printJob.setColorPageCount(0);
        printJob.setWasColorConverted(true);
        printJob.setPolicyApplied("COLOR_TO_BW_AUTO_CONVERT");

        log.info("✅ 컬러 → 흑백 자동 변환 적용: {}페이지 (약 {}원 절감)", 
            colorPages, colorPages * 120); // 페이지당 120원 절감
    }

    /**
     * 양면 출력 강제 여부 판단
     */
    private boolean shouldForceDuplex(PrintJob printJob) {
        // 이미 양면 출력이면 스킵
        if (Boolean.TRUE.equals(printJob.getIsDuplex())) {
            return false;
        }

        // 용지 크기가 A3나 사진 용지면 제외
        if ("A3".equalsIgnoreCase(printJob.getPaperSize()) || 
            "PHOTO".equalsIgnoreCase(printJob.getPaperSize())) {
            return false;
        }

        // 페이지 수가 2페이지 미만이면 제외
        if (printJob.getPageCount() < 2) {
            return false;
        }

        return true;
    }

    /**
     * 양면 출력 강제 적용
     */
    private void applyDuplexEnforcement(PrintJob printJob) {
        printJob.setIsDuplex(true);
        printJob.setWasDuplexEnforced(true);
        printJob.setPolicyApplied("FORCE_DUPLEX");

        int pageSavings = printJob.getPageCount() / 2;
        log.info("✅ 양면 출력 강제 적용: {}페이지 절감 (약 {}원 절감)", 
            pageSavings, pageSavings * 30);
    }

    /**
     * 비용 절감 효과 계산
     */
    public CostSavingsReport calculateSavings(PrintJob printJob) {
        double colorSavings = 0;
        double duplexSavings = 0;

        if (Boolean.TRUE.equals(printJob.getWasColorConverted())) {
            // 컬러 → 흑백: 페이지당 120원 절감
            colorSavings = printJob.getBwPageCount() * 120.0;
        }

        if (Boolean.TRUE.equals(printJob.getWasDuplexEnforced())) {
            // 양면 출력: 용지 50% 절감 (페이지당 30원)
            int pageSavings = printJob.getPageCount() / 2;
            duplexSavings = pageSavings * 30.0;
        }

        return CostSavingsReport.builder()
            .colorSavings(colorSavings)
            .duplexSavings(duplexSavings)
            .totalSavings(colorSavings + duplexSavings)
            .build();
    }

    /**
     * 비용 절감 리포트
     */
    @lombok.Builder
    @lombok.Data
    public static class CostSavingsReport {
        private double colorSavings;
        private double duplexSavings;
        private double totalSavings;
    }
}
