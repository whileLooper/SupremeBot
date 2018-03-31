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

  constructor(private dropSelectorService: DropSelectorService, private dragulaService:DragulaService) {
    const bag: any = this.dragulaService.find('first-bag');
    if (bag !== undefined ) this.dragulaService.destroy('first-bag');
    dragulaService.setOptions('first-bag', {
      copy: function (el, source) {
        return source.id === 'choice-bag';
      },
      accepts: (el, target, source, sibling) => {
        return target.id !== 'choice-bag' && !this.droplist.some ( product => product.id === el.dataset.id);
      },
      removeOnSpill: true,
      copySortSource: false,
    });
    dragulaService.dropModel.subscribe(value => {
      this.onDroplistChange(this.droplist);
    });
    dragulaService.removeModel.subscribe(value => {
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
