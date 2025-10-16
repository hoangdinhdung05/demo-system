import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { ToastComponent } from './toast/toast.component';
import { FormsModule } from '@angular/forms';
import { ForbiddenComponent } from './pages/forbidden/forbidden.component';

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    SideBarComponent,
    ToastComponent,
    ForbiddenComponent,
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [ 
    HeaderComponent,
    FooterComponent,
    SideBarComponent,
    ToastComponent
  ]
})
export class SharedModule { }
