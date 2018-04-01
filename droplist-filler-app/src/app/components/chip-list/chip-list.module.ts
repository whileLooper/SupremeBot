import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChipListComponent } from './chip-list.component';
import { MatChipsModule, MatIconModule, MatFormFieldModule, MatOptionModule, MatSelectModule, MatInputModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    MatChipsModule,
    MatIconModule,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    MatInputModule
  ],
  declarations: [ChipListComponent],
  exports:[ChipListComponent]
})
export class ChipListModule { }
