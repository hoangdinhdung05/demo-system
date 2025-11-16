import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../../core/services/orders/order.service';
import { OrderResponse } from '../../../core/models/response/Order/OrderResponse';
import { OrderStatus } from '../../../utils/OrderStatus';
import { UpdateOrderStatusRequest } from '../../../core/models/request/Order/UpdateOrderStatusRequest';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-admin-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class AdminOrdersComponent implements OnInit {
  orders: OrderResponse[] = [];
  isLoading = false;
  
  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;
  
  // Filter
  selectedStatus: OrderStatus | undefined = undefined;
  searchSubject = new Subject<string>();
  searchTerm = '';
  
  // Status options
  statusOptions = [
    { value: undefined, label: 'Tất cả trạng thái' },
    { value: OrderStatus.PENDING, label: 'Chờ xác nhận' },
    { value: OrderStatus.CONFIRMED, label: 'Đã xác nhận' },
    { value: OrderStatus.SHIPPING, label: 'Đang giao hàng' },
    { value: OrderStatus.DELIVERED, label: 'Đã giao hàng' },
    { value: OrderStatus.CANCELLED, label: 'Đã hủy' }
  ];
  
  // View state
  selectedOrder: OrderResponse | null = null;
  showDetailModal = false;
  showUpdateStatusModal = false;
  newStatus: OrderStatus = OrderStatus.PENDING;
  
  // Expose to template
  Math = Math;
  OrderStatus = OrderStatus;

  constructor(
    private orderService: OrderService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
    this.setupSearch();
  }

  setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(searchValue => {
      this.searchTerm = searchValue;
      this.currentPage = 0;
      this.loadOrders();
    });
  }

  loadOrders(): void {
    this.isLoading = true;
    this.orderService.getAllOrders(this.selectedStatus, this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.orders = response.data.content;
          this.totalPages = response.data.totalPages;
          this.totalElements = response.data.totalElements;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.toastr.error('Không thể tải danh sách đơn hàng', 'Lỗi');
        this.isLoading = false;
      }
    });
  }

  onSearchChange(value: string): void {
    this.searchSubject.next(value);
  }

  onStatusFilterChange(): void {
    this.currentPage = 0;
    this.loadOrders();
  }

  viewOrderDetails(order: OrderResponse): void {
    // Admin xem chi tiết order từ data đã load
    this.selectedOrder = order;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedOrder = null;
  }

  openUpdateStatusModal(order: OrderResponse): void {
    this.selectedOrder = order;
    this.newStatus = order.status;
    this.showUpdateStatusModal = true;
  }

  closeUpdateStatusModal(): void {
    this.showUpdateStatusModal = false;
    this.selectedOrder = null;
  }

  submitUpdateStatus(): void {
    if (!this.selectedOrder) return;

    const request: UpdateOrderStatusRequest = {
      status: this.newStatus
    };

    this.orderService.updateOrderStatus(this.selectedOrder.id, request).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastr.success('Cập nhật trạng thái đơn hàng thành công', 'Thành công');
          this.closeUpdateStatusModal();
          this.loadOrders();
        }
      },
      error: (error) => {
        console.error('Error updating order status:', error);
        this.toastr.error('Không thể cập nhật trạng thái đơn hàng', 'Lỗi');
      }
    });
  }

  getStatusBadgeClass(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return 'badge-warning';
      case OrderStatus.CONFIRMED:
        return 'badge-info';
      case OrderStatus.SHIPPING:
        return 'badge-primary';
      case OrderStatus.DELIVERED:
        return 'badge-success';
      case OrderStatus.CANCELLED:
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  }

  getStatusLabel(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return 'Chờ xác nhận';
      case OrderStatus.CONFIRMED:
        return 'Đã xác nhận';
      case OrderStatus.SHIPPING:
        return 'Đang giao hàng';
      case OrderStatus.DELIVERED:
        return 'Đã giao hàng';
      case OrderStatus.CANCELLED:
        return 'Đã hủy';
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

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadOrders();
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadOrders();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadOrders();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    const halfPages = Math.floor(maxPagesToShow / 2);
    
    let startPage = Math.max(0, this.currentPage - halfPages);
    let endPage = Math.min(this.totalPages - 1, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(0, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  exportOrderPDF(order: OrderResponse): void {
    this.toastr.info('Đang tạo PDF đơn hàng...', 'Thông báo');
    
    // Create HTML content for single order PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { color: #333; margin: 0; }
          .header p { color: #666; margin: 5px 0; }
          .section { margin: 20px 0; }
          .section h3 { background: #4CAF50; color: white; padding: 10px; margin: 0 0 10px 0; }
          .info-row { display: flex; margin: 8px 0; }
          .info-label { font-weight: bold; width: 150px; }
          .info-value { flex: 1; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .total-row { font-weight: bold; background-color: #f9f9f9; }
          .status-badge { padding: 5px 10px; border-radius: 4px; display: inline-block; }
          .badge-warning { background-color: #ffc107; color: #000; }
          .badge-info { background-color: #17a2b8; color: white; }
          .badge-primary { background-color: #007bff; color: white; }
          .badge-success { background-color: #28a745; color: white; }
          .badge-danger { background-color: #dc3545; color: white; }
          .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>HÓA ĐƠN ĐẶT HÀNG</h1>
          <p>Mã đơn hàng: #${order.orderNumber}</p>
          <p>Ngày tạo: ${this.formatDate(order.createdAt)}</p>
        </div>

        <div class="section">
          <h3>Thông tin khách hàng</h3>
          <div class="info-row">
            <span class="info-label">Người nhận:</span>
            <span class="info-value">${order.receiverName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Số điện thoại:</span>
            <span class="info-value">${order.phoneNumber}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Địa chỉ:</span>
            <span class="info-value">${order.shippingAddress}</span>
          </div>
        </div>

        <div class="section">
          <h3>Thông tin đơn hàng</h3>
          <div class="info-row">
            <span class="info-label">Trạng thái:</span>
            <span class="info-value">
              <span class="status-badge ${this.getStatusBadgeClass(order.status).replace('badge-', 'badge-')}">
                ${this.getStatusLabel(order.status)}
              </span>
            </span>
          </div>
          <div class="info-row">
            <span class="info-label">Phương thức TT:</span>
            <span class="info-value">${order.paymentMethod}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Trạng thái TT:</span>
            <span class="info-value">
              <span class="status-badge ${order.paymentStatus === 'PAID' ? 'badge-success' : 'badge-warning'}">
                ${order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
              </span>
            </span>
          </div>
        </div>

        <div class="section">
          <h3>Chi tiết sản phẩm</h3>
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên sản phẩm</th>
                <th>Số lượng</th>
                <th>Đơn giá</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map((item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.productName}</td>
                  <td>${item.quantity}</td>
                  <td>${this.formatCurrency(item.price)}</td>
                  <td>${this.formatCurrency(item.quantity * item.price)}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="4" style="text-align: right;">Tổng cộng:</td>
                <td style="color: #dc3545;">${this.formatCurrency(order.totalAmount)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        ${order.note ? `
        <div class="section">
          <h3>Ghi chú</h3>
          <p>${order.note}</p>
        </div>
        ` : ''}

        <div class="footer">
          <p>Cảm ơn quý khách đã đặt hàng!</p>
          <p>© ${new Date().getFullYear()} - Hệ thống quản lý bán hàng</p>
        </div>
      </body>
      </html>
    `;

    // Create a new window and print
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        this.toastr.success('PDF đơn hàng đã được tạo', 'Thành công');
      }, 250);
    } else {
      this.toastr.error('Không thể mở cửa sổ in', 'Lỗi');
    }
  }

  exportOrdersReport(): void {
    this.toastr.info('Đang tạo báo cáo PDF...', 'Thông báo');
    
    // Create report content
    const reportData = this.orders.map((order, index) => ({
      stt: index + 1 + (this.currentPage * this.pageSize),
      orderId: order.id,
      customerName: order.receiverName || order.username || 'N/A',
      totalAmount: this.formatCurrency(order.totalAmount),
      status: this.getStatusLabel(order.status),
      createdAt: this.formatDate(order.createdAt)
    }));

    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; color: #333; }
          .info { text-align: center; margin-bottom: 20px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #4CAF50; color: white; }
          tr:nth-child(even) { background-color: #f2f2f2; }
          .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>BÁO CÁO QUẢN LÝ ĐƠN HÀNG</h1>
        <div class="info">
          <p>Ngày xuất: ${new Date().toLocaleString('vi-VN')}</p>
          <p>Tổng số đơn hàng: ${this.totalElements}</p>
          ${this.selectedStatus ? `<p>Trạng thái lọc: ${this.getStatusLabel(this.selectedStatus)}</p>` : ''}
        </div>
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Mã ĐH</th>
              <th>Khách hàng</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.map(row => `
              <tr>
                <td>${row.stt}</td>
                <td>#${row.orderId}</td>
                <td>${row.customerName}</td>
                <td>${row.totalAmount}</td>
                <td>${row.status}</td>
                <td>${row.createdAt}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          <p>© ${new Date().getFullYear()} - Hệ thống quản lý đơn hàng</p>
        </div>
      </body>
      </html>
    `;

    // Create a new window and print
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        this.toastr.success('Báo cáo đã được tạo', 'Thành công');
      }, 250);
    } else {
      this.toastr.error('Không thể mở cửa sổ in', 'Lỗi');
    }
  }
}
