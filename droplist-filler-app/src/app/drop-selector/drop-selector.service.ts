import { Observable } from 'rxjs/Observable';
import { PRODUCTS } from './drop-selector.mock';
import { Injectable } from '@angular/core';
import { Product } from './drop-selector.model';
import { Subject } from 'rxjs/Subject';
import { ReplaySubject } from 'rxjs/ReplaySubject';

@Injectable()
export class DropSelectorService {

  products$: ReplaySubject<Product[]>;

  constructor() {
    this.products$ = new ReplaySubject<Product[]>(1);
    this.products$.next(PRODUCTS);
  }

  getAllProducts(): Observable<Product[]> {
    return this.products$.asObservable();
  }

}
