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
      url: '/droplist'
    },
    {
      name: 'Login',
      url: '/login'
    }
  ]
}
