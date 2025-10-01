import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from './button/button.component';
import { FormInputComponent } from './form-input/form-input.component';



@NgModule({
  declarations: [
    ButtonComponent,
    FormInputComponent
  ],
  imports: [
    CommonModule
  ]
})
export class SharedModule { }
