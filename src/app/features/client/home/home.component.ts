import { Component } from '@angular/core';
import { FilterOptions } from '../components/product-filter/product-filter.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  currentFilters: FilterOptions | null = null;

  onFilterChange(filters: FilterOptions): void {
    this.currentFilters = filters;
  }
}
