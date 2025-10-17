package com.training.demo.service;

import com.training.demo.dto.response.Product.ExportProductResponse;
import com.training.demo.dto.response.User.ExportUserResponse;
import com.training.demo.helpers.Reports.JasperReportGenerator;
import com.training.demo.repository.ProductRepository;
import com.training.demo.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import net.sf.jasperreports.engine.*;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
@Slf4j
public class JasperReportService {

    private final JasperReportGenerator reportGenerator;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public JasperReportService(UserRepository userRepository, ProductRepository productRepository) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.reportGenerator = new JasperReportGenerator();
    }

    public byte[] generateUserReportPdf() {
        try {
            log.info("[JasperReportService] Fetching users from database");
            List<ExportUserResponse> users = userRepository.findAllWithRoles();
            log.info("[JasperReportService] {} users fetched", users.size());

            log.info("[JasperReportService] Start generating Jasper user report");
            JasperPrint jasperPrint = reportGenerator.generateUserReport(users);
            log.info("[JasperReportService] User report generated successfully");

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            JasperExportManager.exportReportToPdfStream(jasperPrint, outputStream);
            log.info("[JasperReportService] User report exported to PDF stream");

            return outputStream.toByteArray();
        } catch (JRException e) {
            log.error("[JasperReportService] Error generating user report: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate user report", e);
        }
    }

    public byte[] generateProductReportPdf() {
        try {
            log.info("[JasperReportService] Fetching products from database");
            List<ExportProductResponse> products = productRepository.findAllProjectedWithCategory();
            log.info("[JasperReportService] {} products fetched", products.size());

            log.info("[JasperReportService] Start generating Jasper product report");
            JasperPrint jasperPrint = reportGenerator.generateProductReport(products);
            log.info("[JasperReportService] Product report generated successfully");

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            JasperExportManager.exportReportToPdfStream(jasperPrint, outputStream);
            log.info("[JasperReportService] Product report exported to PDF stream");

            return outputStream.toByteArray();
        } catch (JRException e) {
            log.error("[JasperReportService] Error generating product report: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate product report", e);
        }
    }
}