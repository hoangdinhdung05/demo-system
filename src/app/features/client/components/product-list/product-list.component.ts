import { Component, OnInit, Input } from '@angular/core';
import { FilterOptions } from '../product-filter/product-filter.component';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  category: string;
  inStock: boolean;
  rating: number;
  reviewCount: number;
  isOnSale?: boolean;
  salePercentage?: number;
}

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  @Input() filters: FilterOptions | null = null;

  allProducts: Product[] = [
    {
      id: 1,
      name: 'iPhone 15 Pro Max',
      description: 'Latest iPhone with A17 Pro chip and titanium design',
      price: 1199,
      originalPrice: 1299,
      imageUrl: 'https://via.placeholder.com/300x300/007bff/ffffff?text=iPhone',
      category: 'Electronics',
      inStock: true,
      rating: 4.8,
      reviewCount: 324,
      isOnSale: true,
      salePercentage: 8
    },
    {
      id: 2,
      name: 'Nike Air Max 270',
      description: 'Comfortable running shoes with great cushioning',
      price: 89,
      imageUrl: 'https://via.placeholder.com/300x300/28a745/ffffff?text=Nike',
      category: 'Sports',
      inStock: true,
      rating: 4.5,
      reviewCount: 156
    },
    {
      id: 3,
      name: 'The Great Gatsby',
      description: 'Classic American novel by F. Scott Fitzgerald',
      price: 12,
      imageUrl: 'https://via.placeholder.com/300x300/ffc107/000000?text=Book',
      category: 'Books',
      inStock: true,
      rating: 4.7,
      reviewCount: 892
    },
    {
      id: 4,
      name: 'Samsung 4K Smart TV',
      description: '55-inch 4K UHD Smart TV with HDR',
      price: 599,
      originalPrice: 799,
      imageUrl: 'https://via.placeholder.com/300x300/6f42c1/ffffff?text=TV',
      category: 'Electronics',
      inStock: false,
      rating: 4.4,
      reviewCount: 78,
      isOnSale: true,
      salePercentage: 25
    },
    {
      id: 5,
      name: 'Cotton T-Shirt',
      description: 'Comfortable 100% cotton t-shirt in various colors',
      price: 19,
      imageUrl: 'https://via.placeholder.com/300x300/dc3545/ffffff?text=T-Shirt',
      category: 'Clothing',
      inStock: true,
      rating: 4.2,
      reviewCount: 245
    },
    {
      id: 6,
      name: 'Garden Tools Set',
      description: 'Complete set of essential garden tools',
      price: 45,
      imageUrl: 'https://via.placeholder.com/300x300/198754/ffffff?text=Tools',
      category: 'Home & Garden',
      inStock: true,
      rating: 4.6,
      reviewCount: 67
    }
  ];

  filteredProducts: Product[] = [];
  viewMode: 'grid' | 'list' = 'grid';

  constructor() { }

  ngOnInit(): void {
    this.filteredProducts = [...this.allProducts];
  }

  ngOnChanges(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    if (!this.filters) {
      this.filteredProducts = [...this.allProducts];
      return;
    }

    let filtered = [...this.allProducts];

    // Filter by categories
    if (this.filters.categories.length > 0) {
      filtered = filtered.filter(product => 
        this.filters!.categories.includes(product.category)
      );
    }

    // Filter by price range
    filtered = filtered.filter(product => 
      product.price >= this.filters!.priceRange.min && 
      product.price <= this.filters!.priceRange.max
    );

    // Filter by stock
    if (this.filters.inStock) {
      filtered = filtered.filter(product => product.inStock);
    }

    // Sort products
    filtered = this.sortProducts(filtered, this.filters.sortBy);

    this.filteredProducts = filtered;
  }

  private sortProducts(products: Product[], sortBy: string): Product[] {
    switch (sortBy) {
      case 'name':
        return products.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return products.sort((a, b) => b.name.localeCompare(a.name));
      case 'price':
        return products.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return products.sort((a, b) => b.price - a.price);
      case 'newest':
        return products.sort((a, b) => b.id - a.id);
      default:
        return products;
    }
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  addToCart(product: Product): void {
    // TODO: Implement add to cart functionality
    console.log('Added to cart:', product);
  }

  viewProductDetails(product: Product): void {
    // TODO: Navigate to product details page
    console.log('View details:', product);
  }

  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.floor(rating) ? 1 : 0);
  }
}