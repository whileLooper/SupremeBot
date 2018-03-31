import { DropSelectorService } from './../drop-selector.service';
import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Product } from '../drop-selector.model';
import { DragulaService } from 'ng2-dragula';

@Component({
  selector: 'app-drop-list',
  templateUrl: './drop-list.component.html',
  styleUrls: ['./drop-list.component.css']
})
export class DropListComponent implements OnInit {

  @Input() droplist$: Observable<Product[]>;
  @Input() tileWidth: string;
  droplist: Product[] = [];

  constructor(private dropSelectorService: DropSelectorService, private dragulaService: DragulaService) {
    dragulaService.dragend.subscribe((value) => {
      this.onDroplistChange(this.droplist);
    });
  }

  ngOnInit() {
    this.droplist$.subscribe (droplist => this.droplist = droplist);
  }

  onDroplistChange(droplist) {
    console.log(droplist);
    this.dropSelectorService.postDroplist(droplist);
  }

}
