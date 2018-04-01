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

    this.droplist$ = new ReplaySubject<Product[]>(1);
  }

  loadProducts() {
    this.httpClient.get<Product[]>('api/products')
      .subscribe(products => {
        console.log(products);
        this.products$.next(products)
      });
  }

  loadDroplist() {
    this.httpClient.get<Product[]>('api/droplist')
      .subscribe(products => {
        console.log(products);
        this.droplist$.next(products)
      });
  }

  getAllProducts(): Observable<Product[]> {
    this.loadProducts();
    return this.products$.asObservable();
  }

  getDroplist(): Observable<Product[]> {
    this.loadDroplist();
    return this.droplist$.asObservable();
  }

  getImages(id: string, callback): void {
    this.httpClient.get<Product[]>('api/images?id=' + id)
      .subscribe(images => {
        callback(images);
      });
  }

  postDroplist(droplist: Product[]): void {
    this.httpClient.post<Product[]>('api/droplist', droplist).subscribe(answer => console.log(answer));
  }

}

interface ProductResponse {
  data: Product[];
}
