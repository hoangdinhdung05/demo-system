import { Component, OnInit } from '@angular/core';
import { CategoryService } from 'src/app/core/services/categories/category.service';
import { ProductService } from 'src/app/core/services/products/product.service';
import { UserService } from 'src/app/core/services/users/user.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  totalUsers = 0;
  totalProducts = 0;
  totalCategories = 0;

  constructor(private userService: UserService, 
    private productService: ProductService, 
    private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.countUsers();
    this.countProducts();
    this.countCategories();
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
}
