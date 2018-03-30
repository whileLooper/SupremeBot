import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent implements OnInit {

  constructor() { }

  onDestroy$: Observable<boolean>;

  @Input() images: string[];

  @Output() loadImages: EventEmitter<void> = new EventEmitter<void>();

  displayedImage:string;

  currentImageIndex: number;

  ngOnInit() {
    this.displayedImage;
  }

  nextImage() {
    if (this.images.length > 1) {
      this.setNextImage();
    } else {
      this.loadImages.emit();
    }
  }

  previousImage() {
    if (this.images.length > 1) {
      this.setPreviousImage();
    } else {
      this.loadImages.emit();
    }
  }

  setPreviousImage() {
    this.currentImageIndex = this.currentImageIndex - 1 >= 0 ? this.currentImageIndex - 1 : this.images.length - 1;
  }

  setNextImage() {
    this.currentImageIndex = this.currentImageIndex + 1 < this.images.length ? this.currentImageIndex + 1 : 0;
  }

}
