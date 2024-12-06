import { NgModule} from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login/login.component';
import { PagesComponent } from './pages/pages.component';
import { Error_404Component } from './gusit/Error/Error_404/error_404/error_404.component';
import { AuthGuard } from './gusit/guard/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full'},

  { path: 'login', component: LoginComponent, pathMatch: "full" },

  { path: 'dashboard',
    component: PagesComponent,
    canActivate: [AuthGuard],
    children: [
    { path: 'gusit', loadChildren: () => import('./gusit/gusit.module').then(m => m.GusitModule) }
  ]
},
  { path: '404', component: Error_404Component},
  { path: '**', redirectTo: '/404'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
