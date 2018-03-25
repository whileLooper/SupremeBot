import { DropSelectorComponent } from './drop-selector/drop-selector.component';
import {Routes} from "@angular/router";
import { LoginComponent } from './login/login-component/login.component';

export const ROUTES: Routes = [
  {path: 'droplist', component: DropSelectorComponent},
  {path: 'login', component: LoginComponent},
  {path: '**', redirectTo: '/droplist'}
];