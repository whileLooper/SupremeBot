import { ConfirmationModalComponent } from './../../components/confirmation-modal/confirmation-modal.component';
import { DropSelectorService } from './../drop-selector.service';
import { Component, OnInit, Input, OnChanges, ViewChild, AfterViewInit, AfterViewChecked } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Product } from '../drop-selector.model';
import { DragulaService } from 'ng2-dragula';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-drop-list',
  templateUrl: './drop-list.component.html',
  styleUrls: ['./drop-list.component.css']
})
export class DropListComponent implements OnInit {

  @Input() droplist$: Observable<Product[]>;
  @Input() tileWidth: string;
  droplist: Product[] = [];
  isFadeOut: boolean = false;

  @ViewChild('scrollList') scrollList; 

  constructor(private dropSelectorService: DropSelectorService, private dragulaService: DragulaService, public dialog: MatDialog) {
    const bag: any = this.dragulaService.find('first-bag');
    if (bag !== undefined) this.dragulaService.destroy('first-bag');
    dragulaService.setOptions('first-bag', {
      copy: function (el, source) {
        return source.id === 'choice-bag';
      },
      accepts: (el, target, source, sibling) => {
        return target.id !== 'choice-bag' && !this.droplist.some(product => product.id === el.dataset.id);
      },
      removeOnSpill: true,
      copySortSource: false,
    });
    dragulaService.dropModel.subscribe(value => {
      this.onDroplistChange();
    });
    dragulaService.removeModel.subscribe(value => {
      this.onDroplistChange();
    });
  }

  ngOnInit() {
    this.droplist$.subscribe(droplist => this.droplist = droplist);
    setTimeout (()=> this.onScroll (this.scrollList.nativeElement), 0);
  }

  isScrollBarVisible () {
    if (!this.scrollList)
      return false;
    const scrollHeight = this.scrollList.nativeElement.scrollHeight;
    const elemHeight = this.scrollList.nativeElement.clientHeight;
    console.log(scrollHeight, elemHeight);
    return scrollHeight - elemHeight > 0;
  }

  onScroll(elem) {
    const scrollHeight = elem.scrollHeight;
    console.log(scrollHeight);
    const height = elem.clientHeight;
    const scrollTop = elem.scrollTop;
    const treshold = 30;
    this.isFadeOut = scrollHeight - height - scrollTop > treshold ? true : false;
  }

  onDroplistChange() {
    this.dropSelectorService.postDroplist(this.droplist);
    setTimeout (()=> this.onScroll (this.scrollList.nativeElement), 0);
  }

  openConfirmationDialog(): void {
    let dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: 'auto',
      height: 'auto',
      data: {
        question: "Do you want to clear the droplist?",
        cancel: "Cancel",
        ok: "Ok"
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.clearDroplist ();
      }
    });
  }

  clearDroplist() {
    this.droplist = [];
    this.dropSelectorService.postDroplist(this.droplist);
  }

}
