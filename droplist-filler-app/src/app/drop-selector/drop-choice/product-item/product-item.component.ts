import { DropSelectorService } from './../../drop-selector.service';
import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Product } from '../../drop-selector.model';

@Component({
  selector: 'app-product-item',
  templateUrl: './product-item.component.html',
  styleUrls: ['./product-item.component.css']
})
export class ProductItemComponent implements OnInit, OnChanges {

  constructor(private dropSelectorService: DropSelectorService) { }

  @Input() product: Product;
  images: string[];

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

}
