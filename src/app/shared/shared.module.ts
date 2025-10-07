import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { ToastComponent } from './toast/toast.component';

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    SideBarComponent,
    ToastComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [ 
    HeaderComponent,
    FooterComponent,
    SideBarComponent,
    ToastComponent
  ]
})
export class SharedModule { }
