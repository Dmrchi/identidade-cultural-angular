import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HttpClientModule } from '@angular/common/http';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FontAwesomeModule,
    HttpClientModule,

  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class BazarModule { }
