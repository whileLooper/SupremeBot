import { CarouselModule } from './../components/carousel/carousel.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropListComponent } from './drop-list/drop-list.component';
import { DropChoiceComponent } from './drop-choice/drop-choice.component';
import { DropSelectorComponent } from './drop-selector.component';
import {FlexLayoutModule} from '@angular/flex-layout';
import { ProductItemComponent } from './drop-choice/product-item/product-item.component';
import { DropSelectorService } from './drop-selector.service';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    CarouselModule
  ],
  declarations: [DropListComponent, DropChoiceComponent, DropSelectorComponent, ProductItemComponent],
  exports: [DropSelectorComponent],
  providers: [DropSelectorService]
})
export class DropSelectorModule { }
