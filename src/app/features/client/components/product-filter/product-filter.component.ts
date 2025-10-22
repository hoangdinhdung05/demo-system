import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CategoryService } from '../../../../core/services/categories/category.service';
import { CategoryResponse } from '../../../../core/models/response/Category/CategoryResponse';

export interface FilterOptions {
  categories: number[];
  priceRange: { min: number; max: number };
  sortBy: string;
  inStock: boolean;
}

interface CategoryWithCount extends CategoryResponse {
  count?: number;
}

@Component({
  selector: 'app-product-filter',
  templateUrl: './product-filter.component.html',
  styleUrls: ['./product-filter.component.css']
})
export class ProductFilterComponent implements OnInit {
  @Output() filterChange = new EventEmitter<FilterOptions>();

  categories: CategoryWithCount[] = [];
  isLoadingCategories = false;

  selectedCategories: number[] = [];
  priceRange = { min: 0, max: 10000 };
  sortBy = 'name';
  inStock = false;

  sortOptions = [
    { value: 'name', label: 'Tên A-Z' },
    { value: 'name-desc', label: 'Tên Z-A' },
    { value: 'price', label: 'Giá thấp đến cao' },
    { value: 'price-desc', label: 'Giá cao đến thấp' },
    { value: 'newest', label: 'Mới nhất' }
  ];

  constructor(private categoryService: CategoryService) { }

  ngOnInit(): void {
    this.loadCategories();
    this.emitFilterChange();
  }

  loadCategories(): void {
    this.isLoadingCategories = true;
    console.log('Loading categories for filter...');
    
    this.categoryService.getAllCategories(0, 100).subscribe({
      next: (response) => {
        console.log('Category service response:', response);
        if (response.success && response.data) {
          this.categories = response.data.content.map(category => ({
            ...category,
            count: 0 // You might want to add a separate API call to get product counts per category
          }));
          console.log('Categories loaded:', this.categories);
        } else {
          console.error('Category API response not successful or no data:', response);
        }
        this.isLoadingCategories = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.isLoadingCategories = false;
      }
    });
  }

  onCategoryChange(categoryId: number, isChecked: boolean): void {
    if (isChecked) {
      this.selectedCategories.push(categoryId);
    } else {
      const index = this.selectedCategories.indexOf(categoryId);
      if (index > -1) {
        this.selectedCategories.splice(index, 1);
      }
    }
    this.emitFilterChange();
  }

  toggleCategory(categoryId: number): void {
    const index = this.selectedCategories.indexOf(categoryId);
    if (index > -1) {
      this.selectedCategories.splice(index, 1);
    } else {
      this.selectedCategories.push(categoryId);
    }
    this.emitFilterChange();
  }

  onPriceRangeChange(): void {
    this.emitFilterChange();
  }

  onSortChange(): void {
    this.emitFilterChange();
  }

  onStockFilterChange(): void {
    this.emitFilterChange();
  }

  clearFilters(): void {
    this.selectedCategories = [];
    this.priceRange = { min: 0, max: 10000 };
    this.sortBy = 'name';
    this.inStock = false;
    this.emitFilterChange();
  }

  private emitFilterChange(): void {
    const filters: FilterOptions = {
      categories: this.selectedCategories,
      priceRange: this.priceRange,
      sortBy: this.sortBy,
      inStock: this.inStock
    };
    this.filterChange.emit(filters);
  }
}