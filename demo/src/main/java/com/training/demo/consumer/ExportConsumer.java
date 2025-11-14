package com.training.demo.consumer;

import com.rabbitmq.client.Channel;
import com.training.demo.dto.ExportMessageDTO;
import com.training.demo.dto.response.Product.ExportProductResponse;
import com.training.demo.dto.response.User.ExportUserResponse;
import com.training.demo.helpers.Reports.JasperReportGenerator;
import com.training.demo.producer.EmailProducer;
import com.training.demo.repository.ProductRepository;
import com.training.demo.repository.UserRepository;
import com.training.demo.utils.constants.RabbitMQConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sf.jasperreports.engine.JRException;
import net.sf.jasperreports.engine.JasperExportManager;
import net.sf.jasperreports.engine.JasperPrint;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;
import java.io.ByteArrayOutputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@Slf4j
@RequiredArgsConstructor
public class ExportConsumer {

    private final JasperReportGenerator reportGenerator;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final EmailProducer emailProducer;

    private static final String EXPORT_DIR = "exports/";
    private static final int MAX_RETRY_COUNT = 3;

    @RabbitListener(queues = RabbitMQConstants.EXPORT_QUEUE)
    public void processExportRequest(
            ExportMessageDTO exportMessage,
            Channel channel,
            Message message,
            @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag) throws IOException {

        try {
            log.info("[ExportConsumer] Processing export - Type: {}, User: {}, File: {}", 
                    exportMessage.getExportType(),
                    exportMessage.getUserId(),
                    exportMessage.getFileName());

            // Create export directory if not exists
            Path exportPath = Paths.get(EXPORT_DIR);
            if (!Files.exists(exportPath)) {
                Files.createDirectories(exportPath);
            }

            byte[] pdfBytes = null;
            String filePath = EXPORT_DIR + exportMessage.getFileName();

            // Generate report based on type
            switch (exportMessage.getExportType()) {
                case "USER_PDF":
                    pdfBytes = generateUserReport(exportMessage);
                    break;
                case "PRODUCT_PDF":
                    pdfBytes = generateProductReport(exportMessage);
                    break;
                default:
                    throw new IllegalArgumentException("Unknown export type: " + exportMessage.getExportType());
            }

            // Save to file
            try (FileOutputStream fos = new FileOutputStream(filePath)) {
                fos.write(pdfBytes);
            }

            log.info("[ExportConsumer] Export completed - File saved: {}", filePath);

            // Send email with download link
            sendExportCompletionEmail(exportMessage, filePath);

            // Acknowledge success
            channel.basicAck(deliveryTag, false);

        } catch (Exception e) {
            log.error("[ExportConsumer] Failed to process export - Type: {}, Error: {}", 
                    exportMessage.getExportType(), e.getMessage(), e);

            // Retry logic - send to DLQ after max retries
            channel.basicNack(deliveryTag, false, false);
        }
    }

    /**
     * Generate user report PDF
     */
    private byte[] generateUserReport(ExportMessageDTO exportMessage) throws JRException {
        String username = (String) exportMessage.getParameters().get("username");
        
        log.info("[ExportConsumer] Generating user report, filter: {}", username);
        List<ExportUserResponse> users = userRepository.findAllWithRoles(username);
        
        JasperPrint jasperPrint = reportGenerator.generateUserReport(users);
        
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        JasperExportManager.exportReportToPdfStream(jasperPrint, outputStream);
        
        return outputStream.toByteArray();
    }

    /**
     * Generate product report PDF
     */
    private byte[] generateProductReport(ExportMessageDTO exportMessage) throws JRException {
        String productName = (String) exportMessage.getParameters().get("productName");
        
        log.info("[ExportConsumer] Generating product report, filter: {}", productName);
        List<ExportProductResponse> products = productRepository.findAllProjectedWithCategory(productName);
        
        JasperPrint jasperPrint = reportGenerator.generateProductReport(products);
        
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        JasperExportManager.exportReportToPdfStream(jasperPrint, outputStream);
        
        return outputStream.toByteArray();
    }

    /**
     * Send email notification when export is completed
     */
    private void sendExportCompletionEmail(ExportMessageDTO exportMessage, String filePath) {
        try {
            // TODO: Get user email from userId
            // For now, using a simple message
            
            Map<String, Object> emailData = new HashMap<>();
            emailData.put("fileName", exportMessage.getFileName());
            emailData.put("exportType", exportMessage.getExportType());
            emailData.put("filePath", filePath);
            emailData.put("downloadUrl", "http://localhost:8080/api/exports/download/" + exportMessage.getFileName());
            
            String subject = "Export Completed - " + exportMessage.getFileName();
            String content = String.format(
                    "Your export request has been completed.\n\n" +
                    "File: %s\n" +
                    "Type: %s\n" +
                    "Download URL: %s\n\n" +
                    "This link will be available for 24 hours.",
                    exportMessage.getFileName(),
                    exportMessage.getExportType(),
                    emailData.get("downloadUrl")
            );
            
            // emailProducer.sendSimpleEmail(userEmail, subject, content);
            log.info("[ExportConsumer] Export completion email would be sent for file: {}", exportMessage.getFileName());
            
        } catch (Exception e) {
            log.error("[ExportConsumer] Failed to send export completion email", e);
        }
    }
}
