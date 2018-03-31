import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';

@Component({
  selector: 'app-chip-list',
  templateUrl: './chip-list.component.html',
  styleUrls: ['./chip-list.component.css']
})
export class ChipListComponent implements OnInit, OnChanges {

  @Input() options: string[];
  filteredOptions: string[];
  @Input() placeholder: string;
  @Input() items: any[] = [];
  @Output() onchange: EventEmitter<string[]> = new EventEmitter<string[]>();

  selected: string;

  constructor() { }

  ngOnInit() {
    this.filterOptions();
  }

  ngOnChanges () {
    this.filterOptions();
  }

  filterOptions() {
    this.filteredOptions = this.options.filter ( option => !this.items || !this.items.includes(option))
  }

  addItem(event) {
    console.log(this.selected);
    const item = event.value;
    this.items = this.items ? this.items : [];
    this.items.push(item);
    setTimeout(() =>this.selected = null, 0);
    this.onchange.emit(this.items);
    console.log(this.selected);
    this.filterOptions();
  }

  remove(item) {
    let index = this.items.indexOf(item);

    if (index >= 0) {
      this.items.splice(index, 1);
    }

    if (this.items.length === 0)
      this.items = null;

    this.onchange.emit(this.items);
    this.filterOptions();
  }

}
