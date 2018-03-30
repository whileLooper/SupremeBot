import { Observable } from 'rxjs/Observable';
import { PRODUCTS, DROPLIST } from './drop-selector.mock';
import { Injectable } from '@angular/core';
import { Product } from './drop-selector.model';
import { Subject } from 'rxjs/Subject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { HttpClient } from '@angular/common/http';
import { map } from "rxjs/operators";

@Injectable()
export class DropSelectorService {

  products$: ReplaySubject<Product[]>;
  droplist$: ReplaySubject<Product[]>;

  constructor(private httpClient: HttpClient) {
    this.products$ = new ReplaySubject<Product[]>(1);
    this.loadProducts ();

    this.droplist$ = new ReplaySubject<Product[]>(1);
    this.loadDroplist ();
  }

  loadProducts() {
    this.httpClient.get<Product[]>('api/products')
      .subscribe(products => {
        console.log(products);
        this.products$.next(products)});
  }

  loadDroplist() {
    this.httpClient.get<Product[]>('api/droplist')
      .subscribe(products => {
        console.log(products);
        this.droplist$.next(products)});
  }

  getAllProducts(): Observable<Product[]> {
    return this.products$.asObservable();
  }

  getDroplist(): Observable<Product[]> {
    return this.droplist$.asObservable();
  }

  postDroplist(droplist:Product []):void {
    this.httpClient.post<Product[]>('api/droplist', droplist).subscribe ( answer => console.log(answer));
  }

}

interface ProductResponse {
  data: Product[];
}

