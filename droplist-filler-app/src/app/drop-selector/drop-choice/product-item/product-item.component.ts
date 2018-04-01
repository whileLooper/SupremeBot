import { ImageSliderModalComponent } from './../../../components/image-slider-modal/image-slider-modal.component';
import { DropSelectorService } from './../../drop-selector.service';
import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { Product } from '../../drop-selector.model';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-product-item',
  templateUrl: './product-item.component.html',
  styleUrls: ['./product-item.component.css']
})
export class ProductItemComponent implements OnInit, OnChanges {

  constructor(private dropSelectorService: DropSelectorService, private dialog: MatDialog) { }

  @Input() editable: boolean;
  @Input() product: Product;
  @Output() onchange: EventEmitter<Product> = new EventEmitter<Product>();
  images: string[];
  sizeOptions: string[] = ['Small', 'Medium', 'Large', 'XLarge'];
  styleOptions: string[] = ['Red', 'Blue', 'Royal']

  ngOnChanges(changes) {
    this.images = [this.product.imageUrl];
  }

  ngOnInit() {
    this.images = [this.product.imageUrl];
  }

  loadImages(callback = () => { }) {
    this.dropSelectorService.getImages(this.product.id, (images => {
      if (images && images.length > 0)
        this.images = images;
      callback();
    }));
  }

  changeStyles(newStyles: string[]) {
    this.product.styles = newStyles;
    this.onchange.emit(this.product);
  }

  changeSizes(newSizes: string[]) {
    this.product.sizes = newSizes;
    this.onchange.emit(this.product);
  }

  openImageSlider(): void {
    this.loadImages((() => {
      let dialogRef = this.dialog.open(ImageSliderModalComponent, {
        width: '70%',
        height: '70%',
        data: this.images
      });
    }));
  }

}
