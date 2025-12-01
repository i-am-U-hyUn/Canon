package com.canon.printmanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 출력 작업 엔티티
 * 
 * TimescaleDB hypertable로 저장되는 시계열 데이터
 */
@Entity
@Table(name = "print_jobs", indexes = {
    @Index(name = "idx_print_jobs_user_id", columnList = "user_id, timestamp"),
    @Index(name = "idx_print_jobs_department_id", columnList = "department_id, timestamp"),
    @Index(name = "idx_print_jobs_printer_id", columnList = "printer_id, timestamp")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrintJob {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "job_id", nullable = false, length = 100)
    private String jobId;

    @Column(name = "printer_id", nullable = false)
    private Long printerId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "department_id", nullable = false)
    private Long departmentId;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "document_name", length = 500)
    private String documentName;

    @Column(name = "file_size_kb")
    private Long fileSizeKb;

    @Column(name = "page_count", nullable = false)
    private Integer pageCount;

    @Column(name = "color_page_count")
    private Integer colorPageCount = 0;

    @Column(name = "bw_page_count")
    private Integer bwPageCount = 0;

    @Column(name = "is_duplex")
    private Boolean isDuplex = false;

    @Column
    private Integer copies = 1;

    @Column(name = "paper_size", length = 20)
    private String paperSize = "A4";

    @Column(length = 50)
    private String status = "COMPLETED";

    @Column(name = "cost_bw", precision = 10, scale = 2)
    private BigDecimal costBw;

    @Column(name = "cost_color", precision = 10, scale = 2)
    private BigDecimal costColor;

    @Column(name = "total_cost", precision = 10, scale = 2)
    private BigDecimal totalCost;

    @Column(name = "was_color_converted")
    private Boolean wasColorConverted = false;

    @Column(name = "was_duplex_enforced")
    private Boolean wasDuplexEnforced = false;

    @Column(name = "policy_applied", length = 100)
    private String policyApplied;

    @PrePersist
    public void prePersist() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
}
