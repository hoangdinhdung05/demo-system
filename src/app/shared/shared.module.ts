import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from './button/button.component';
import { FormInputComponent } from './form-input/form-input.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { ToastComponent } from './toast/toast.component';

@NgModule({
  declarations: [
    ButtonComponent,
    FormInputComponent,
    HeaderComponent,
    FooterComponent,
    SideBarComponent,
    ToastComponent
  ],
  imports: [
    CommonModule,
  ],
  exports: [ 
    ButtonComponent,
    FormInputComponent,
    HeaderComponent,
    FooterComponent,
    SideBarComponent,
    ToastComponent
  ]
})
export class SharedModule { }
