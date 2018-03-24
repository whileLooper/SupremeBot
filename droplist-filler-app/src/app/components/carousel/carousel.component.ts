import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent implements OnInit {

  constructor() { }

  @Input() images: string[];

  currentImageIndex: number;

  ngOnInit() {
    this.currentImageIndex = 0;
  }

  displayedImage() {
    if (this.images.length > this.currentImageIndex) {
      return this.images[this.currentImageIndex];
    } else {
      return "xxx";
    }
  }

  nextImage() {
    this.currentImageIndex = this.currentImageIndex + 1 < this.images.length ? this.currentImageIndex + 1 : 0;
  }

  previousImage() {
    this.currentImageIndex = this.currentImageIndex - 1 >= 0 ? this.currentImageIndex - 1 : this.images.length-1;
  }

}
