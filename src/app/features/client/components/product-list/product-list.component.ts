import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../../core/services/products/product.service';
import { ProductResponse } from '../../../../core/models/response/Product/ProductResponse';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  // Remove filter-related @Input and @OnChanges
  allProducts: ProductResponse[] = [];
  displayedProducts: ProductResponse[] = []; // Changed from filteredProducts
  viewMode: 'grid' | 'list' = 'grid';
  isLoading = false;
  
  // Pagination
  currentPage = 0;
  pageSize = 12;
  totalElements = 0;
  totalPages = 0;

  isSearching = false;
  searchQuery = '';


  constructor(
    private productService: ProductService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Listen to query params changes
    this.route.queryParams.subscribe(params => {
      const searchQuery = params['search'];
      if (searchQuery) {
        this.searchProducts(searchQuery);
      } else {
        this.loadProducts();
      }
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    console.log('Loading products, page:', this.currentPage, 'pageSize:', this.pageSize);
    
    this.productService.getAllProducts(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        console.log('Product service response:', response);
        if (response.success && response.data) {
          console.log('Products loaded:', response.data.content);
          this.allProducts = response.data.content;
          this.displayedProducts = [...this.allProducts]; // Simply copy all products
          this.totalElements = response.data.totalElements;
          this.totalPages = response.data.totalPages;
          
          // Debug: Log detailed product structure
          if (this.allProducts.length > 0) {
            console.log('First product structure:', JSON.stringify(this.allProducts[0], null, 2));
            console.log('Product category:', this.allProducts[0].category);
            console.log('Product price:', this.allProducts[0].price, typeof this.allProducts[0].price);
          }

          console.log("List of all products:", this.allProducts);
          console.log('Total elements:', this.totalElements, 'Total pages:', this.totalPages);
        } else {
          console.error('API response not successful or no data:', response);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.isLoading = false;
      }
    });
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  addToCart(product: ProductResponse): void {
    // TODO: Implement add to cart functionality
    console.log('Added to cart:', product);
  }

  viewProductDetails(product: ProductResponse): void {
    // TODO: Navigate to product details page
    console.log('View details:', product);
  }

  getProductImageUrl(product: ProductResponse): string {
    if (!product.productImageUrl) {
      return 'https://via.placeholder.com/300x300/007bff/ffffff?text=No+Image';
    }
    
    // Use the same approach as admin page
    return `${environment.assetBase}${product.productImageUrl.startsWith('/') ? '' : '/'}${product.productImageUrl}`;
  }

  isProductInStock(product: ProductResponse): boolean {
    return product.quantity > 0;
  }

  getStarArray(rating: number = 4.5): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.floor(rating) ? 1 : 0);
  }

  searchProducts(name: string): void {
    if (!name.trim()) {
      // Nếu rỗng → load lại toàn bộ danh sách mặc định
      this.isSearching = false;
      this.loadProducts();
      return;
    }

    this.isLoading = true;
    this.isSearching = true;
    this.searchQuery = name;

    this.productService.searchByName(name).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.displayedProducts = res.data;
          this.totalElements = res.data.length;
          this.totalPages = 1;
        } else {
          this.displayedProducts = [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Search error:', err);
        this.displayedProducts = [];
        this.isLoading = false;
      }
    });
  }
}