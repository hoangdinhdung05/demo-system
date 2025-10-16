import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { ForbiddenComponent } from './shared/pages/forbidden/forbidden.component';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule),
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule),
    canMatch: [AuthGuard, RoleGuard],
    data: { role: 'ROLE_ADMIN' },
  },
  {
    path: '',
    loadChildren: () => import('./features/client/client.module').then(m => m.ClientModule),
    },
  { path: 'forbidden', component: ForbiddenComponent },
  { path: '**', redirectTo: 'auth/login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
