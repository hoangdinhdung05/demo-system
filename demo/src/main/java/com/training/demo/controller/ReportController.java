package com.training.demo.controller;

import com.training.demo.service.JasperReportService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@Slf4j
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
public class ReportController {

    private final JasperReportService reportService;

    public ReportController(JasperReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/users")
    public ResponseEntity<byte[]> generateUserReport() {
        log.info("[JasperReportController] Request to generate user report");

        byte[] pdfBytes = reportService.generateUserReportPdf();

        log.info("[JasperReportController] Returning PDF report users, size: {} bytes", pdfBytes.length);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=users_report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/products")
    public ResponseEntity<byte[]> exportProductsPdf() {
        log.info("[JasperReportController] Request to generate products report");

        byte[] pdfBytes = reportService.generateProductReportPdf();

        log.info("[JasperReportController] Returning PDF report products, size: {} bytes", pdfBytes.length);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=products.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}
