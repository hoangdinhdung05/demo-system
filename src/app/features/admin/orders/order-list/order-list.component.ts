import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { OrderService } from 'src/app/core/services/orders/order.service';
import { PaymentService } from 'src/app/core/services/payments/payment.service';
import { OrderResponse } from 'src/app/core/models/response/Order/OrderResponse';
import { OrderStatus, OrderStatusLabels, OrderStatusColors } from 'src/app/utils/OrderStatus';
import { PaymentMethodLabels } from 'src/app/utils/PaymentMethod';
import { PaymentStatus, PaymentStatusLabels, PaymentStatusColors } from 'src/app/utils/PaymentStatus';

declare var bootstrap: any;

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit {

  orders: OrderResponse[] = [];
  filteredOrders: OrderResponse[] = [];
  totalPages = 0;
  totalElements = 0;
  currentPage = 0;
  pageSize = 20;
  loading = false;

  selectedStatus?: OrderStatus;
  OrderStatus = OrderStatus;
  OrderStatusLabels = OrderStatusLabels;
  OrderStatusColors = OrderStatusColors;
  PaymentStatus = PaymentStatus;
  PaymentMethodLabels = PaymentMethodLabels;
  PaymentStatusLabels = PaymentStatusLabels;
  PaymentStatusColors = PaymentStatusColors;

  @ViewChild('updateStatusModal') updateStatusModal!: ElementRef;
  updateStatusForm!: FormGroup;
  selectedOrder: OrderResponse | null = null;
  updateModalInstance: any;

  statusOptions = [
    { value: OrderStatus.PENDING, label: OrderStatusLabels[OrderStatus.PENDING] },
    { value: OrderStatus.CONFIRMED, label: OrderStatusLabels[OrderStatus.CONFIRMED] },
    { value: OrderStatus.PROCESSING, label: OrderStatusLabels[OrderStatus.PROCESSING] },
    { value: OrderStatus.SHIPPING, label: OrderStatusLabels[OrderStatus.SHIPPING] },
    { value: OrderStatus.DELIVERED, label: OrderStatusLabels[OrderStatus.DELIVERED] },
    { value: OrderStatus.CANCELLED, label: OrderStatusLabels[OrderStatus.CANCELLED] },
    { value: OrderStatus.REFUNDED, label: OrderStatusLabels[OrderStatus.REFUNDED] }
  ];

  constructor(
    private orderService: OrderService,
    private paymentService: PaymentService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.updateStatusForm = this.fb.group({
      status: ['', [Validators.required]]
    });

    this.loadOrders(this.currentPage);
  }

  loadOrders(page: number) {
    this.loading = true;
    this.orderService.getAllOrders(this.selectedStatus, page, this.pageSize).subscribe({
      next: (response) => {
        if (response.success) {
          this.orders = response.data.content;
          this.totalPages = response.data.totalPages;
          this.totalElements = response.data.totalElements;
          this.currentPage = response.data.pageNumber;
          this.filteredOrders = this.orders;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading orders', err);
        this.toastr.error('Không thể tải danh sách đơn hàng!', 'Lỗi');
        this.loading = false;
      }
    });
  }

  filterByStatus() {
    this.currentPage = 0;
    this.loadOrders(0);
  }

  clearFilter() {
    this.selectedStatus = undefined;
    this.currentPage = 0;
    this.loadOrders(0);
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) this.loadOrders(this.currentPage + 1);
  }

  previousPage() {
    if (this.currentPage > 0) this.loadOrders(this.currentPage - 1);
  }

  goToPage(page: number) {
    this.loadOrders(page);
  }

  getPageNumbers(): number[] {
    const maxPagesToShow = 5;
    const pages: number[] = [];

    if (this.totalPages <= maxPagesToShow) {
      for (let i = 0; i < this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(0);

      let startPage = Math.max(1, this.currentPage - 1);
      let endPage = Math.min(this.totalPages - 2, this.currentPage + 1);

      if (this.currentPage <= 2) {
        endPage = Math.min(3, this.totalPages - 2);
      }
      if (this.currentPage >= this.totalPages - 3) {
        startPage = Math.max(1, this.totalPages - 4);
      }

      if (startPage > 1) {
        pages.push(-1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < this.totalPages - 2) {
        pages.push(-1);
      }

      pages.push(this.totalPages - 1);
    }

    return pages;
  }

  openUpdateStatusModal(order: OrderResponse) {
    this.selectedOrder = order;
    this.updateStatusForm.patchValue({
      status: order.status
    });

    this.updateModalInstance = new bootstrap.Modal(this.updateStatusModal.nativeElement);
    this.updateModalInstance.show();
  }

  closeUpdateStatusModal() {
    if (this.updateModalInstance) this.updateModalInstance.hide();
  }

  submitUpdateStatus() {
    if (this.updateStatusForm.invalid || !this.selectedOrder) return;

    this.loading = true;
    const request = { status: this.updateStatusForm.value.status };

    this.orderService.updateOrderStatus(this.selectedOrder.id, request).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Cập nhật trạng thái đơn hàng thành công!', 'Thành công');
          this.closeUpdateStatusModal();
          this.loadOrders(this.currentPage);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Update status error:', err);
        this.toastr.error(err.error?.message || 'Có lỗi xảy ra khi cập nhật!', 'Lỗi');
        this.loading = false;
      }
    });
  }

  viewOrderDetails(orderId: number) {
    // Navigate to order detail page or open modal
    window.location.href = `/admin/orders/${orderId}`;
  }

  confirmPayment(order: OrderResponse) {
    if (order.paymentStatus !== PaymentStatus.PENDING) {
      this.toastr.warning('Chỉ có thể xác nhận thanh toán đang chờ', 'Cảnh báo');
      return;
    }

    if (!confirm(`Xác nhận thanh toán cho đơn hàng #${order.id}?`)) {
      return;
    }

    this.loading = true;

    // Lấy payment của order trước
    this.paymentService.getOrderPayments(order.id).subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.length > 0) {
          const payment = response.data[0]; // Lấy payment đầu tiên
          
          const confirmRequest = {
            status: PaymentStatus.PAID,
            transactionId: payment.transactionId || `TXN-${Date.now()}`,
            paymentInfo: 'Xác nhận bởi Admin'
          };

          this.paymentService.confirmPayment(payment.id, confirmRequest).subscribe({
            next: (confirmResponse) => {
              if (confirmResponse.success) {
                this.toastr.success('Xác nhận thanh toán thành công', 'Thành công');
                this.loadOrders(this.currentPage);
              }
              this.loading = false;
            },
            error: (error) => {
              console.error('Error confirming payment:', error);
              this.toastr.error(error.error?.message || 'Không thể xác nhận thanh toán', 'Lỗi');
              this.loading = false;
            }
          });
        } else {
          this.toastr.warning('Không tìm thấy thông tin thanh toán', 'Cảnh báo');
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error loading payment:', error);
        this.toastr.error('Không thể tải thông tin thanh toán', 'Lỗi');
        this.loading = false;
      }
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('vi-VN');
  }
}
