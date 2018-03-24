import { CarouselComponent } from './carousel.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatIconModule
} from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
  ],
  declarations: [CarouselComponent],
  exports: [CarouselComponent]
})
export class CarouselModule { }
