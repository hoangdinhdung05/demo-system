package com.training.demo.service.impl;

import com.training.demo.dto.request.Payment.ConfirmPaymentRequest;
import com.training.demo.dto.request.Payment.CreatePaymentRequest;
import com.training.demo.dto.response.Payment.PaymentResponse;
import com.training.demo.entity.Order;
import com.training.demo.entity.Payment;
import com.training.demo.exception.BadRequestException;
import com.training.demo.exception.NotFoundException;
import com.training.demo.mapper.PaymentMapper;
import com.training.demo.producer.EmailProducer;
import com.training.demo.repository.OrderRepository;
import com.training.demo.repository.PaymentRepository;
import com.training.demo.service.PaymentService;
import com.training.demo.utils.enums.PaymentStatus;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final EmailProducer emailProducer;

    /**
     * Lấy tất cả payments (ADMIN)
     */
    @Override
    public Page<PaymentResponse> getAllPayments(Pageable pageable) {
        log.info("[PaymentService] Getting all payments with page: {}, size: {}", 
                pageable.getPageNumber(), pageable.getPageSize());
        
        Page<Payment> payments = paymentRepository.findAll(pageable);
        return payments.map(PaymentMapper::toPaymentResponse);
    }

    /**
     * Tạo payment mới
     */
    @Override
    @Transactional
    public PaymentResponse createPayment(Long userId, CreatePaymentRequest request) {
        log.info("[PaymentService] Creating payment for order: {}", request.getOrderId());

        // Validate order
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new NotFoundException("Order not found with id: " + request.getOrderId()));

        // Validate ownership
        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("You don't have permission to create payment for this order");
        }

        // Check if order already paid
        if (order.getPaymentStatus() == com.training.demo.utils.enums.PaymentStatus.PAID) {
            throw new BadRequestException("Order has already been paid");
        }

        // Create payment
        Payment payment = Payment.builder()
                .order(order)
                .paymentMethod(request.getPaymentMethod())
                .amount(order.getTotalAmount())
                .transactionId(generateTransactionId())
                .status(PaymentStatus.PENDING)
                .paymentInfo(request.getPaymentInfo())
                .build();

        payment = paymentRepository.save(payment);

        log.info("[PaymentService] Payment created: {}", payment.getTransactionId());

        return PaymentMapper.toPaymentResponse(payment);
    }

    /**
     * Xác nhận thanh toán
     */
    @Override
    @Transactional
    public PaymentResponse confirmPayment(Long paymentId, ConfirmPaymentRequest request) {
        log.info("[PaymentService] Confirming payment: {}", paymentId);

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new NotFoundException("Payment not found with id: " + paymentId));

        // Check status
        if (payment.getStatus() == PaymentStatus.PAID) {
            throw new BadRequestException("Payment has already been confirmed");
        }

        if (payment.getStatus() == PaymentStatus.FAILED) {
            throw new BadRequestException("Cannot confirm failed payment");
        }

        // Update payment
        payment.setStatus(PaymentStatus.PAID);
        payment.setPaymentDate(LocalDateTime.now());
        if (request.getPaymentInfo() != null) {
            payment.setPaymentInfo(request.getPaymentInfo());
        }
        if (request.getTransactionId() != null) {
            payment.setTransactionId(request.getTransactionId());
        }

        payment = paymentRepository.save(payment);

        // Update order payment status
        Order order = payment.getOrder();
        order.setPaymentStatus(com.training.demo.utils.enums.PaymentStatus.PAID);
        
        // Auto confirm order khi thanh toán thành công
        if (order.getStatus() == com.training.demo.utils.enums.OrderStatus.PENDING) {
            order.setStatus(com.training.demo.utils.enums.OrderStatus.CONFIRMED);
        }
        
        orderRepository.save(order);

        log.info("[PaymentService] Payment confirmed: {}", payment.getTransactionId());

        // Send payment confirmation email via RabbitMQ queue
        try {
            java.util.Map<String, Object> emailData = new java.util.HashMap<>();
            emailData.put("orderNumber", order.getOrderNumber());
            emailData.put("receiverName", order.getReceiverName());
            emailData.put("totalAmount", order.getTotalAmount());
            emailData.put("paymentMethod", payment.getPaymentMethod());
            emailData.put("transactionId", payment.getTransactionId());
            emailData.put("paymentDate", payment.getPaymentDate());
            
            emailProducer.sendPaymentSuccessEmail(order.getUser().getEmail(), emailData);
        } catch (Exception e) {
            log.error("[PaymentService] Failed to queue payment confirmation email", e);
        }

        return PaymentMapper.toPaymentResponse(payment);
    }

    /**
     * Lấy chi tiết payment
     */
    @Override
    public PaymentResponse getPaymentById(Long paymentId) {
        log.info("[PaymentService] Getting payment: {}", paymentId);

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new NotFoundException("Payment not found with id: " + paymentId));

        return PaymentMapper.toPaymentResponse(payment);
    }

    /**
     * Lấy lịch sử thanh toán của order
     */
    @Override
    public List<PaymentResponse> getOrderPayments(Long orderId) {
        log.info("[PaymentService] Getting payments for order: {}", orderId);

        List<Payment> payments = paymentRepository.findByOrderIdOrderByCreatedAtDesc(orderId);

        return payments.stream()
                .map(PaymentMapper::toPaymentResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy payment theo transaction ID
     */
    @Override
    public PaymentResponse getPaymentByTransactionId(String transactionId) {
        log.info("[PaymentService] Getting payment by transaction: {}", transactionId);

        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new NotFoundException("Payment not found with transaction ID: " + transactionId));

        return PaymentMapper.toPaymentResponse(payment);
    }

    /**
     * Hủy payment
     */
    @Override
    @Transactional
    public PaymentResponse cancelPayment(Long paymentId) {
        log.info("[PaymentService] Canceling payment: {}", paymentId);

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new NotFoundException("Payment not found with id: " + paymentId));

        // Check status
        if (payment.getStatus() == PaymentStatus.PAID) {
            throw new BadRequestException("Cannot cancel paid payment. Please use refund instead");
        }

        payment.setStatus(PaymentStatus.FAILED);
        payment.setErrorMessage("Payment cancelled by user");
        payment = paymentRepository.save(payment);

        log.info("[PaymentService] Payment cancelled: {}", payment.getTransactionId());

        return PaymentMapper.toPaymentResponse(payment);
    }

    // ========== PRIVATE METHODS ==========

    /**
     * Generate unique transaction ID
     */
    private String generateTransactionId() {
        String txnId = "TXN-" + UUID.randomUUID().toString().substring(0, 18).toUpperCase();
        
        // Check uniqueness
        while (paymentRepository.existsByTransactionId(txnId)) {
            txnId = "TXN-" + UUID.randomUUID().toString().substring(0, 18).toUpperCase();
        }
        
        return txnId;
    }
}
