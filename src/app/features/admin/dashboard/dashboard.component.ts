import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryService } from 'src/app/core/services/categories/category.service';
import { ProductService } from 'src/app/core/services/products/product.service';
import { UserService } from 'src/app/core/services/users/user.service';
import { OrderService } from 'src/app/core/services/orders/order.service';
import { PaymentService } from 'src/app/core/services/payments/payment.service';
import { OrderStatus } from 'src/app/utils/OrderStatus';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  totalUsers = 0;
  totalProducts = 0;
  totalCategories = 0;
  totalOrders = 0;
  pendingOrders = 0;
  completedOrders = 0;
  totalRevenue = 0;

  constructor(
    private router: Router,
    private userService: UserService, 
    private productService: ProductService, 
    private categoryService: CategoryService,
    private orderService: OrderService,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    this.countUsers();
    this.countProducts();
    this.countCategories();
    this.countOrders();
    this.countPendingOrders();
    this.countCompletedOrders();
    this.getTotalRevenue();
  }

  countUsers() {
    this.userService.countUser().subscribe({
      next: (count) => this.totalUsers = count,
      error: (err) => console.error('Error counting users:', err)
    });
  }

  countProducts() {
    this.productService.countProducts().subscribe({
      next: (count) => this.totalProducts = count,
      error: (err) => console.error('Error counting products:', err)
    });
  }

  countCategories() {
    this.categoryService.countCategories().subscribe({
      next: (count) => this.totalCategories = count,
      error: (err) => console.error('Error counting categories:', err)
    });
  }

  countOrders() {
    this.orderService.countAllOrders().subscribe({
      next: (response: any) => {
        // Backend trả về BaseResponse, cần extract data
        this.totalOrders = typeof response === 'object' && response.data !== undefined ? response.data : response;
      },
      error: (err) => {
        console.error('Error counting orders:', err);
        this.totalOrders = 0; // Fallback if API not ready
      }
    });
  }

  countPendingOrders() {
    this.orderService.countOrdersByStatus(OrderStatus.PENDING).subscribe({
      next: (response: any) => {
        this.pendingOrders = typeof response === 'object' && response.data !== undefined ? response.data : response;
      },
      error: (err) => {
        console.error('Error counting pending orders:', err);
        this.pendingOrders = 0;
      }
    });
  }

  countCompletedOrders() {
    this.orderService.countOrdersByStatus(OrderStatus.DELIVERED).subscribe({
      next: (response: any) => {
        this.completedOrders = typeof response === 'object' && response.data !== undefined ? response.data : response;
      },
      error: (err) => {
        console.error('Error counting completed orders:', err);
        this.completedOrders = 0;
      }
    });
  }

  getTotalRevenue() {
    this.paymentService.getTotalRevenue().subscribe({
      next: (response: any) => {
        this.totalRevenue = typeof response === 'object' && response.data !== undefined ? response.data : response;
      },
      error: (err) => {
        console.error('Error getting total revenue:', err);
        this.totalRevenue = 0;
      }
    });
  }

  navigateToUsers() {
    this.router.navigate(['/admin/users']);
  }

  navigateToCategories() {
    this.router.navigate(['/admin/categories']);
  }

  navigateToProducts() {
    this.router.navigate(['/admin/products']);
  }

  navigateToOrders() {
    this.router.navigate(['/admin/orders']);
  }

  navigateToPayments() {
    this.router.navigate(['/admin/payments']);
  }
}
