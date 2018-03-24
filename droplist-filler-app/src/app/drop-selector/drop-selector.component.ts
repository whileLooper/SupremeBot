import { DropSelectorService } from './drop-selector.service';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Product } from './drop-selector.model';

@Component({
  selector: 'app-drop-selector',
  templateUrl: './drop-selector.component.html',
  styleUrls: ['./drop-selector.component.css']
})
export class DropSelectorComponent implements OnInit {

  constructor(private dropSelectorService: DropSelectorService) { }

  products$: Observable<Product[]>

  ngOnInit() {
    this.products$ = this.dropSelectorService.getAllProducts ();
  }

}
