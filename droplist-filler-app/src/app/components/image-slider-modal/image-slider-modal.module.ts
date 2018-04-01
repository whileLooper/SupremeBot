import { CarouselModule } from './../carousel/carousel.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageSliderModalComponent } from './image-slider-modal.component';

@NgModule({
  imports: [
    CommonModule,
    CarouselModule
  ],
  declarations: [ImageSliderModalComponent],
  exports: [ImageSliderModalComponent],
  entryComponents: [ImageSliderModalComponent]
})
export class ImageSliderModalModule { }
