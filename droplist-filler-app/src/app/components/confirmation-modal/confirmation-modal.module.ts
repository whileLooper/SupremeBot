import { FlexLayoutModule } from '@angular/flex-layout';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationModalComponent } from './confirmation-modal.component';
import { MatButtonModule, MatDialogModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    FlexLayoutModule
  ],
  declarations: [ConfirmationModalComponent],
  exports: [ConfirmationModalComponent],
  entryComponents: [ConfirmationModalComponent]
})
export class ConfirmationModalModule { }
