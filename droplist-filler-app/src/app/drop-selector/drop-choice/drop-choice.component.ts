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
  products:Product[];

  constructor(private dragulaService: DragulaService) {
    const bag: any = this.dragulaService.find('first-bag');
    if (bag !== undefined ) this.dragulaService.destroy('first-bag');
    dragulaService.setOptions('first-bag', {
      copy: function (el, source) {
        return source.id === 'choice-bag';
      },
      accepts: function(el, target, source, sibling) {
        return target.id !== 'choice-bag';
      },
      removeOnSpill: true,
      copySortSource: false,
    });
  }

  ngOnInit() {
    this.products$.subscribe (products => this.products = products);
  }

}
