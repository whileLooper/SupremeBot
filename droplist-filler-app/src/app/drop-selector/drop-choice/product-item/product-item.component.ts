import { DropSelectorService } from './../../drop-selector.service';
import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { Product } from '../../drop-selector.model';

@Component({
  selector: 'app-product-item',
  templateUrl: './product-item.component.html',
  styleUrls: ['./product-item.component.css']
})
export class ProductItemComponent implements OnInit, OnChanges {

  constructor(private dropSelectorService: DropSelectorService) { }

  @Input() editable: boolean;
  @Input() product: Product;
  @Output() onchange: EventEmitter<Product> = new EventEmitter<Product>();
  images: string[];
  sizeOptions:string [] = ['Small','Medium','Large','XLarge'];
  styleOptions:string[] = ['Red', 'Blue','Royal']

  ngOnChanges(changes) {
    this.images = [this.product.imageUrl];
  }

  ngOnInit() {
    this.images = [this.product.imageUrl];
  }

  loadImages() {
    this.dropSelectorService.getImages(this.product.id, (images => {
      if (images && images.length > 0)
        this.images = images;
    }));
  }

  changeStyles(newStyles: string[]) {
    this.product.styles = newStyles;
    this.onchange.emit(this.product);
  }

  changeSizes (newSizes: string[]) {
    this.product.sizes = newSizes;
    this.onchange.emit(this.product);
  }

}
