import { NavbarModule } from './components/navbar/navbar.module';
import { CarouselModule } from './components/carousel/carousel.module';
import { DropSelectorModule } from './drop-selector/drop-selector.module';
import { LoginModule } from './login/login.module';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { CarouselComponent } from './components/carousel/carousel.component';
import { ROUTES } from './app.routes';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    RouterModule.forRoot(ROUTES),
    BrowserModule,
    LoginModule,
    DropSelectorModule,
    NavbarModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
