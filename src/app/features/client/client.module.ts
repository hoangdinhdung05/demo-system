import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { ClientRoutingModule } from './client-routing.module';
import { HomeComponent } from './home/home.component';
import { CategoryComponent } from './category/category.component';
import { ClientHeaderComponent } from './components/client-header/client-header.component';
import { ClientFooterComponent } from './components/client-footer/client-footer.component';
import { ProductFilterComponent } from './components/product-filter/product-filter.component';
import { ProductListComponent } from './components/product-list/product-list.component';

@NgModule({
  declarations: [
    HomeComponent,
    CategoryComponent,
    ClientHeaderComponent,
    ClientFooterComponent,
    ProductFilterComponent,
    ProductListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    ClientRoutingModule
  ]
})
export class ClientModule { }
