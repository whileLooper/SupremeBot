import { DropSelectorModule } from './drop-selector/drop-selector.module';
import { LoginModule } from './login/login.module';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    LoginModule,
    DropSelectorModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
