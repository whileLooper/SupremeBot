import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-image-slider-modal',
  templateUrl: './image-slider-modal.component.html',
  styleUrls: ['./image-slider-modal.component.css']
})
export class ImageSliderModalComponent {

  constructor(
    public dialogRef: MatDialogRef<ImageSliderModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string[]) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
