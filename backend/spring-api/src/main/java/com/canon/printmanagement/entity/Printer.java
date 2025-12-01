package com.canon.printmanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * 프린터 장비 엔티티
 */
@Entity
@Table(name = "printers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Printer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "serial_number", unique = true, nullable = false, length = 100)
    private String serialNumber;

    @Column(name = "ip_address", nullable = false)
    private String ipAddress;

    @Column(name = "mac_address")
    private String macAddress;

    @Column(name = "model_id")
    private Long modelId;

    @Column(length = 255)
    private String location;

    @Column(name = "department_id")
    private Long departmentId;

    @Column(name = "installation_date")
    private LocalDateTime installationDate;

    @Column(name = "snmp_community", length = 100)
    private String snmpCommunity = "public";

    @Column(name = "snmp_version", length = 10)
    private String snmpVersion = "v2c";

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "last_seen_at")
    private LocalDateTime lastSeenAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
