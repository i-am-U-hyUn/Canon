package com.canon.printmanagement.dto;

import lombok.*;
import java.time.LocalDateTime;

/**
 * 프린터 상태 응답 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrinterStatusResponse {

    private Long printerId;
    private String printerName;
    private String serialNumber;
    private String ipAddress;
    private String location;
    private String modelName;
    private String departmentName;
    
    private String status; // ONLINE, OFFLINE, ERROR, WARNING
    
    private Integer tonerLevelBlack;
    private Integer tonerLevelCyan;
    private Integer tonerLevelMagenta;
    private Integer tonerLevelYellow;
    private Integer paperLevel;
    
    private String errorCode;
    private String errorMessage;
    
    private Long totalPageCount;
    private Long colorPageCount;
    
    private LocalDateTime lastUpdateTime;
    
    /**
     * 토너 부족 여부 체크
     */
    public boolean isTonerLow(int threshold) {
        return (tonerLevelBlack != null && tonerLevelBlack <= threshold) ||
               (tonerLevelCyan != null && tonerLevelCyan <= threshold) ||
               (tonerLevelMagenta != null && tonerLevelMagenta <= threshold) ||
               (tonerLevelYellow != null && tonerLevelYellow <= threshold);
    }
    
    /**
     * 용지 부족 여부 체크
     */
    public boolean isPaperLow(int threshold) {
        return paperLevel != null && paperLevel <= threshold;
    }
    
    /**
     * 알림 필요 여부
     */
    public boolean needsAlert() {
        return "ERROR".equals(status) || 
               "WARNING".equals(status) || 
               isTonerLow(15) || 
               isPaperLow(20);
    }
}
