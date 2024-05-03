import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';


const routes: Routes = [
  {path: 'home', pathMatch: 'full', component: HomeComponent},
  {path: 'products', loadChildren: () => import('./products/products.module').then(m => m.ProductsModule)},
  {path: 'users', loadChildren: () => import('./users/users.module').then(m => m.UsersModule)},
  {path: 'trainers', loadChildren: () => import('./trainers/trainers.module').then(m => m.TrainersModule)},
  {path: '**', redirectTo: '/home'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
