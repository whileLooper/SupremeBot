import { ChipListModule } from './../components/chip-list/chip-list.module';
import { HttpClientModule } from '@angular/common/http';
import { DragulaModule } from 'ng2-dragula';
import { CarouselModule } from './../components/carousel/carousel.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropListComponent } from './drop-list/drop-list.component';
import { DropChoiceComponent } from './drop-choice/drop-choice.component';
import { DropSelectorComponent } from './drop-selector.component';
import {FlexLayoutModule} from '@angular/flex-layout';
import { ProductItemComponent } from './drop-choice/product-item/product-item.component';
import { DropSelectorService } from './drop-selector.service';
import { MatCardModule, MatDividerModule, MatIconModule, MatButtonModule, MatDialogModule } from '@angular/material';
import { RatingBarModule } from '../components/rating-bar/rating-bar.module';
import {DndModule} from 'ng2-dnd';
import { ImageSliderModalModule } from '../components/image-slider-modal/image-slider-modal.module';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    CarouselModule,
    MatCardModule,
    RatingBarModule,
    DragulaModule,
    HttpClientModule,
    ChipListModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    ImageSliderModalModule
  ],
  declarations: [DropListComponent, DropChoiceComponent, DropSelectorComponent, ProductItemComponent],
  exports: [DropSelectorComponent],
  providers: [DropSelectorService]
})
export class DropSelectorModule { }
