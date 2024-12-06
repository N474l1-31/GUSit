import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { AuthModule } from './login/auth.module';
import { PagesModule } from './pages/pages.module';
import { ErrorInterceptor } from './error.interceptor';
import { AuthGuard } from './gusit/guard/auth.guard';

registerLocaleData(localeEs);     // Registro de los datos de localización

@NgModule({
  declarations: [
    AppComponent

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AuthModule,
    PagesModule,

    ToastrModule.forRoot()
  ],
  providers: [
    CookieService,
    AuthGuard,
    { provide: LOCALE_ID,   useValue: 'es' },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },

  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
