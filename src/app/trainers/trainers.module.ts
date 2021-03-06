import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MaterialModule } from '../material/material/material.module';
import { FormsModule } from '@angular/forms';
import { TrainersComponent } from './trainers.component';
import { TrainersRoutingModule } from './trainers-routing.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [TrainersComponent],
  imports: [
    CommonModule,
    TrainersRoutingModule,
    HttpClientModule,
    MaterialModule,
    FormsModule,
    TranslateModule.forChild({
      loader : {
        provide : TranslateLoader,
        useFactory : HttpLoaderFactory,
        deps: [ HttpClient ]
      }
    }),
  ]
})
export class TrainersModule { }
