package com.training.demo.repository;

import com.training.demo.entity.Order;
import com.training.demo.utils.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    /**
     * Tìm order theo order number
     */
    Optional<Order> findByOrderNumber(String orderNumber);

    /**
     * Kiểm tra order number đã tồn tại
     */
    boolean existsByOrderNumber(String orderNumber);

    /**
     * Lấy danh sách orders của user
     */
    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    /**
     * Lấy orders theo user và status
     */
    Page<Order> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, OrderStatus status, Pageable pageable);

    /**
     * Đếm số orders của user
     */
    long countByUserId(Long userId);

    /**
     * Lấy tất cả orders theo status
     */
    Page<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status, Pageable pageable);

    /**
     * Tìm orders trong khoảng thời gian
     */
    @Query("SELECT o FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate ORDER BY o.createdAt DESC")
    List<Order> findOrdersBetweenDates(@Param("startDate") LocalDateTime startDate, 
                                       @Param("endDate") LocalDateTime endDate);

    /**
     * Lấy order với orderItems
     */
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.orderItems WHERE o.id = :orderId")
    Optional<Order> findByIdWithItems(@Param("orderId") Long orderId);

    /**
     * Lấy order với orderItems và payments
     */
    @Query("SELECT DISTINCT o FROM Order o " +
           "LEFT JOIN FETCH o.orderItems " +
           "LEFT JOIN FETCH o.payments " +
           "WHERE o.id = :orderId")
    Optional<Order> findByIdWithItemsAndPayments(@Param("orderId") Long orderId);

    /**
     * Tìm orders theo phone number
     */
    Page<Order> findByPhoneNumberContaining(String phoneNumber, Pageable pageable);

    /**
     * Tìm orders theo receiver name
     */
    Page<Order> findByReceiverNameContainingIgnoreCase(String receiverName, Pageable pageable);

    /**
     * Đếm đơn hàng theo trạng thái
     */
    long countByStatus(OrderStatus status);
}
