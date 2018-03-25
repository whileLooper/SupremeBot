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

  constructor(private dragulaService: DragulaService) {
    dragulaService.setOptions('first-bag', {
      copy: function (el, source) {
        return source.id === 'choice-bag';
      },
      accepts: function(el, target, source, sibling) {
        return target.id !== 'choice-bag';
      },
      copySortSource: false,
    });
  }

  @Input() products$:Observable<Product>;

  ngOnInit() {
  }

}
