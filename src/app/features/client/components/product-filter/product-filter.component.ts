import { Component, OnInit, Output, EventEmitter } from '@angular/core';

export interface FilterOptions {
  categories: string[];
  priceRange: { min: number; max: number };
  sortBy: string;
  inStock: boolean;
}

@Component({
  selector: 'app-product-filter',
  templateUrl: './product-filter.component.html',
  styleUrls: ['./product-filter.component.css']
})
export class ProductFilterComponent implements OnInit {
  @Output() filterChange = new EventEmitter<FilterOptions>();

  categories = [
    { id: 1, name: 'Electronics', count: 45 },
    { id: 2, name: 'Clothing', count: 32 },
    { id: 3, name: 'Books', count: 28 },
    { id: 4, name: 'Home & Garden', count: 19 },
    { id: 5, name: 'Sports', count: 15 }
  ];

  selectedCategories: string[] = [];
  priceRange = { min: 0, max: 1000 };
  sortBy = 'name';
  inStock = false;

  sortOptions = [
    { value: 'name', label: 'Tên A-Z' },
    { value: 'name-desc', label: 'Tên Z-A' },
    { value: 'price', label: 'Giá thấp đến cao' },
    { value: 'price-desc', label: 'Giá cao đến thấp' },
    { value: 'newest', label: 'Mới nhất' }
  ];

  constructor() { }

  ngOnInit(): void {
    this.emitFilterChange();
  }

  onCategoryChange(categoryName: string, isChecked: boolean): void {
    if (isChecked) {
      this.selectedCategories.push(categoryName);
    } else {
      const index = this.selectedCategories.indexOf(categoryName);
      if (index > -1) {
        this.selectedCategories.splice(index, 1);
      }
    }
    this.emitFilterChange();
  }

  toggleCategory(categoryName: string): void {
    const index = this.selectedCategories.indexOf(categoryName);
    if (index > -1) {
      this.selectedCategories.splice(index, 1);
    } else {
      this.selectedCategories.push(categoryName);
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
    this.priceRange = { min: 0, max: 1000 };
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