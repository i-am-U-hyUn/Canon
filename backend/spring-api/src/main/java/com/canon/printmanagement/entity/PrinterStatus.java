package com.canon.printmanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * 프린터 상태 엔티티
 * TimescaleDB hypertable
 */
@Entity
@Table(name = "printer_status")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(PrinterStatusId.class)
public class PrinterStatus {

    @Id
    @Column(name = "printer_id", nullable = false)
    private Long printerId;

    @Id
    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false, length = 50)
    private String status;

    @Column(name = "toner_level_black")
    private Integer tonerLevelBlack;

    @Column(name = "toner_level_cyan")
    private Integer tonerLevelCyan;

    @Column(name = "toner_level_magenta")
    private Integer tonerLevelMagenta;

    @Column(name = "toner_level_yellow")
    private Integer tonerLevelYellow;

    @Column(name = "paper_level")
    private Integer paperLevel;

    @Column(name = "error_code", length = 50)
    private String errorCode;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "total_page_count")
    private Long totalPageCount;

    @Column(name = "color_page_count")
    private Long colorPageCount;

    @PrePersist
    public void prePersist() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
}
