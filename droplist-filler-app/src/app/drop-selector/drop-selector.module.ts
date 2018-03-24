import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropListComponent } from './drop-list/drop-list.component';
import { DropChoiceComponent } from './drop-choice/drop-choice.component';
import { DropSelectorComponent } from './drop-selector.component';
import {FlexLayoutModule} from '@angular/flex-layout';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
  ],
  declarations: [DropListComponent, DropChoiceComponent, DropSelectorComponent],
  exports: [DropSelectorComponent]
})
export class DropSelectorModule { }
