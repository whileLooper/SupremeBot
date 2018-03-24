import { Observable } from 'rxjs/Observable';
import { Component, OnInit, Input } from '@angular/core';
import { Product } from '../drop-selector.model';

@Component({
  selector: 'app-drop-choice',
  templateUrl: './drop-choice.component.html',
  styleUrls: ['./drop-choice.component.css']
})
export class DropChoiceComponent implements OnInit {

  constructor() { }

  @Input() products$:Observable<Product>;

  ngOnInit() {
  }

}
