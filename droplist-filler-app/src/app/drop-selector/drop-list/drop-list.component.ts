import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Product } from '../drop-selector.model';

@Component({
  selector: 'app-drop-list',
  templateUrl: './drop-list.component.html',
  styleUrls: ['./drop-list.component.css']
})
export class DropListComponent implements OnInit {

  constructor() { }

  @Input() droplist$:Observable<Product>;

  ngOnInit() {
  }

}
