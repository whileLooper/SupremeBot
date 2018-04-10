import { DropSelectorService } from './drop-selector.service';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Product } from './drop-selector.model';
import { ActivatedRoute, Router, NavigationStart, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-drop-selector',
  templateUrl: './drop-selector.component.html',
  styleUrls: ['./drop-selector.component.css']
})
export class DropSelectorComponent implements OnInit {

  constructor(private dropSelectorService: DropSelectorService, private route: ActivatedRoute, private router: Router) {
    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.loadProducts();
      }
    });
  }

  products$: Observable<Product[]>
  droplist$: Observable<Product[]>

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    const week = parseInt(this.route.snapshot.paramMap.get('week'));
    this.products$ = this.dropSelectorService.getAllProducts(week);
    this.droplist$ = this.dropSelectorService.getDroplist();
  }

}
