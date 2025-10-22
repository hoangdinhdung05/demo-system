import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FilterOptions } from '../components/product-filter/product-filter.component';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit {
  currentFilters: FilterOptions | null = null;
  categoryName: string = '';

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.categoryName = params['category'] || '';
      // Pre-filter by category if specified
      if (this.categoryName) {
        this.currentFilters = {
          categories: [this.categoryName],
          priceRange: { min: 0, max: 1000 },
          sortBy: 'name',
          inStock: false
        };
      }
    });
  }

  onFilterChange(filters: FilterOptions): void {
    this.currentFilters = filters;
  }
}