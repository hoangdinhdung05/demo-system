import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsersComponent } from './users/users.component';
import { CategoryComponent } from './category/category.component';
import { ProductComponent } from './product/product.component';

const routes: Routes = [
  {path: '', component: DashboardComponent},
  {path: 'users', component: UsersComponent},
  {path: 'categories', component: CategoryComponent},
  {path: 'products', component: ProductComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
 