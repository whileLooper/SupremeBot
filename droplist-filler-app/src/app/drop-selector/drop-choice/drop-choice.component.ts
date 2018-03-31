import { Observable } from 'rxjs/Observable';
import { Component, OnInit, Input } from '@angular/core';
import { Product } from '../drop-selector.model';
import { DragulaService } from 'ng2-dragula';

@Component({
  selector: 'app-drop-choice',
  templateUrl: './drop-choice.component.html',
  styleUrls: ['./drop-choice.component.css']
})
export class DropChoiceComponent implements OnInit {

  @Input() products$:Observable<Product[]>;
  @Input() tileWidth:string;
  products:Product[];

  constructor() {
  }

  ngOnInit() {
    this.products$.subscribe (products => this.products = products);
  }

}
