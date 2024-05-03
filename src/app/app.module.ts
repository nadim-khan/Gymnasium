import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCarouselModule } from '@ngmodule/material-carousel';
import { JwtHelperService, JWT_OPTIONS  } from '@auth0/angular-jwt';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent , LoginDialogComponent, RegisterDialogComponent,
   BroadcastDialogComponent, ShowNotificationComponent} from './app.component';
import { MaterialModule } from './material/material/material.module';
import { HomeComponent } from './home/home.component';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';
import { TrainersModule } from './trainers/trainers.module';
import { ContactComponent } from './contact/contact.component';
import { FeeStructureComponent, AddFeeDialogComponent } from './fee-structure/fee-structure.component';
import { GymViewComponent } from './gym-view/gym-view.component';
import { LoaderComponent } from './loader/loader.component';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
    declarations: [
        AppComponent,
        LoginDialogComponent,
        RegisterDialogComponent,
        HomeComponent,
        ContactComponent,
        FeeStructureComponent,
        BroadcastDialogComponent,
        AddFeeDialogComponent,
        ShowNotificationComponent,
        GymViewComponent,
        LoaderComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        HttpClientModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
        FormsModule,
        MaterialModule,
        ProductsModule,
        UsersModule,
        TrainersModule,
        MatCarouselModule.forRoot(),
    ],
    providers: [{ provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
        JwtHelperService],
    bootstrap: [AppComponent]
})
export class AppModule { }
