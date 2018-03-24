import { Component, OnInit, Input } from '@angular/core';
import { Product } from '../../drop-selector.model';

@Component({
  selector: 'app-product-item',
  templateUrl: './product-item.component.html',
  styleUrls: ['./product-item.component.css']
})
export class ProductItemComponent implements OnInit {

  constructor() { }

  @Input () product:Product;

  ngOnInit() {
  }

}
