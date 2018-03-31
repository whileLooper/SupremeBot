import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { takeUntil } from 'rxjs/operators';
import { imageMovement } from './carousel.model';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent implements OnInit, OnChanges {

  constructor() { }

  onDestroy$: Observable<boolean>;

  @Input() images: string[];

  @Output() loadImages: EventEmitter<void> = new EventEmitter<void>();

  displayedImage:string;

  currentImageIndex: number = 0;
  lastMovement:imageMovement = imageMovement.stay;

  ngOnInit() {
  }

  ngOnChanges () {
    this.setImage (this.lastMovement);
  }

  changeImage (movement:imageMovement) {
    if (this.images.length > 1) {
      this.setImage(movement);
      this.lastMovement = imageMovement.stay;
    } else {
      this.loadImages.emit();
      this.lastMovement = movement;
    }
  }

  setImage(movement) {
    if (movement == imageMovement.previous)
      this.currentImageIndex = this.currentImageIndex - 1 >= 0 ? this.currentImageIndex - 1 : this.images.length - 1;
    else if (movement == imageMovement.next)
      this.currentImageIndex = this.currentImageIndex + 1 < this.images.length ? this.currentImageIndex + 1 : 0;
    this.displayedImage = this.images[this.currentImageIndex];
  }
}
