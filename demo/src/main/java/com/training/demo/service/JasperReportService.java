package com.training.demo.service;

import com.training.demo.dto.response.User.ExportUserResponse;
import com.training.demo.helpers.Reports.JasperReportGenerator;
import com.training.demo.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.JasperExportManager;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
@Slf4j
public class JasperReportService {

    private final JasperReportGenerator reportGenerator;
    private final UserRepository userRepository;

    public JasperReportService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.reportGenerator = new JasperReportGenerator();
    }

    public byte[] generateUserReportPdf() {
        try {
            log.info("[JasperReportService] Fetching users from database");
            List<ExportUserResponse> users = userRepository.findAllWithRoles();
            log.info("[JasperReportService] {} users fetched", users.size());

            log.info("[JasperReportService] Start generating Jasper report");
            JasperPrint jasperPrint = reportGenerator.generateUserReport(users);
            log.info("[JasperReportService] Report generated successfully");

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            JasperExportManager.exportReportToPdfStream(jasperPrint, outputStream);
            log.info("[JasperReportService] Report exported to PDF stream");

            return outputStream.toByteArray();
        } catch (JRException e) {
            log.error("[JasperReportService] Error generating report: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate report", e);
        }
    }
}
