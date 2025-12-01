package com.canon.printmanagement.entity;

import lombok.*;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * PrinterStatus 복합키 클래스
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class PrinterStatusId implements Serializable {
    private Long printerId;
    private LocalDateTime timestamp;
}
