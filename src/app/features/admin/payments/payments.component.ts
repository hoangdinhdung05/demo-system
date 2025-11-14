import { Component, OnInit } from '@angular/core';
import { PaymentService } from '../../../core/services/payments/payment.service';
import { PaymentResponse } from '../../../core/models/response/Payment/PaymentResponse';
import { PaymentStatus } from '../../../utils/PaymentStatus';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css']
})
export class PaymentsComponent implements OnInit {
  payments: PaymentResponse[] = [];
  isLoading = false;
  
  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  
  // Sorting
  sortBy = 'createdAt';
  sortDirection = 'DESC';
  
  // View state
  selectedPayment: PaymentResponse | null = null;
  showDetailModal = false;

  // Math object for template
  Math = Math;

  constructor(
    private paymentService: PaymentService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.isLoading = true;
    this.paymentService.getAllPayments(this.currentPage, this.pageSize, this.sortBy, this.sortDirection)
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.payments = response.data.content;
            this.totalElements = response.data.totalElements;
            this.totalPages = response.data.totalPages;
            this.currentPage = response.data.number;
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading payments:', error);
          this.toastr.error('Không thể tải danh sách thanh toán', 'Lỗi');
          this.isLoading = false;
        }
      });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadPayments();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 0;
    this.loadPayments();
  }

  onSort(column: string): void {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.sortBy = column;
      this.sortDirection = 'DESC';
    }
    this.loadPayments();
  }

  confirmPayment(payment: PaymentResponse): void {
    if (payment.status !== PaymentStatus.PENDING) {
      this.toastr.warning('Chỉ có thể xác nhận thanh toán đang chờ', 'Cảnh báo');
      return;
    }

    if (!confirm(`Xác nhận thanh toán #${payment.id}?`)) {
      return;
    }

    const confirmRequest = {
      transactionId: payment.transactionId || `TXN-${Date.now()}`
    };

    this.paymentService.confirmPayment(payment.id, confirmRequest)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.toastr.success('Xác nhận thanh toán thành công', 'Thành công');
            this.loadPayments();
          }
        },
        error: (error) => {
          console.error('Error confirming payment:', error);
          this.toastr.error('Không thể xác nhận thanh toán', 'Lỗi');
        }
      });
  }

  viewPaymentDetails(payment: PaymentResponse): void {
    this.selectedPayment = payment;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedPayment = null;
  }

  getStatusBadgeClass(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.PENDING:
        return 'badge-warning';
      case PaymentStatus.PAID:
        return 'badge-success';
      case PaymentStatus.FAILED:
        return 'badge-danger';
      case PaymentStatus.REFUNDED:
        return 'badge-info';
      default:
        return 'badge-secondary';
    }
  }

  getStatusLabel(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.PENDING:
        return 'Chờ thanh toán';
      case PaymentStatus.PAID:
        return 'Đã thanh toán';
      case PaymentStatus.FAILED:
        return 'Thất bại';
      case PaymentStatus.REFUNDED:
        return 'Đã hoàn tiền';
      default:
        return 'Không xác định';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('vi-VN');
  }
}
