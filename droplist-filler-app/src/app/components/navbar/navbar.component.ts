import { NavigationItem } from './navbar.model';
import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(private router:Router) { }

  @Input() title:string;
  @Input() navigationList:NavigationItem[];
  @Input() homeLink:string;

  ngOnInit() {
  }

}
