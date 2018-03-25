import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RatingBarComponent } from './rating-bar.component';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule
  ],
  declarations: [RatingBarComponent],
  exports: [RatingBarComponent]
})
export class RatingBarModule { }
