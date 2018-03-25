import { Observable } from 'rxjs/Observable';
import { PRODUCTS, DROPLIST } from './drop-selector.mock';
import { Injectable } from '@angular/core';
import { Product } from './drop-selector.model';
import { Subject } from 'rxjs/Subject';
import { ReplaySubject } from 'rxjs/ReplaySubject';

@Injectable()
export class DropSelectorService {

  products$: ReplaySubject<Product[]>;
  droplist$: ReplaySubject<Product[]>;

  constructor() {
    this.products$ = new ReplaySubject<Product[]>(1);
    this.products$.next(PRODUCTS);

    this.droplist$ = new ReplaySubject<Product[]>(1);
    this.droplist$.next(DROPLIST);
  }

  getAllProducts(): Observable<Product[]> {
    return this.products$.asObservable();
  }

  getDroplist(): Observable<Product[]> {
    return this.droplist$.asObservable();
  }

}
