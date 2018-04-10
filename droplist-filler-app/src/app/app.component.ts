import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Supreme Droplist Filler';
  homeLink = '/'

  navigationList = [
    {
      name: 'Droplist',
      url: '/droplist/1'
    },
    {
      name: 'Previous Week',
      url: '/droplist/2'
    },
    {
      name: 'In Shop',
      url: '/droplist/0'
    },
    {
      name: 'Login',
      url: '/login'
    }
  ]
}
