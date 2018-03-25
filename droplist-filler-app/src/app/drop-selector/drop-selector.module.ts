import { CarouselModule } from './../components/carousel/carousel.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropListComponent } from './drop-list/drop-list.component';
import { DropChoiceComponent } from './drop-choice/drop-choice.component';
import { DropSelectorComponent } from './drop-selector.component';
import {FlexLayoutModule} from '@angular/flex-layout';
import { ProductItemComponent } from './drop-choice/product-item/product-item.component';
import { DropSelectorService } from './drop-selector.service';
import { MatCardModule } from '@angular/material';
import { RatingBarModule } from '../components/rating-bar/rating-bar.module';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    CarouselModule,
    MatCardModule,
    RatingBarModule
  ],
  declarations: [DropListComponent, DropChoiceComponent, DropSelectorComponent, ProductItemComponent],
  exports: [DropSelectorComponent],
  providers: [DropSelectorService]
})
export class DropSelectorModule { }
