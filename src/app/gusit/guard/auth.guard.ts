import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from 'src/app/login/login/Service/auth.service';


@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
)
    {
      // this.checkInternetConnection();
    }

    canActivate(
      next: ActivatedRouteSnapshot,
      state: RouterStateSnapshot
    ): boolean {
      if (this.authService.isLoggedIn()) {
        return true; // Si el usuario está autenticado, permite el acceso a la ruta
      } else {
        // Si el usuario no está autenticado, redirige al login y guarda la URL a la que intentaba acceder
        localStorage.setItem('previousUrl', state.url);
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false;
      }
    }

    // Método para guardar la URL anterior cuando la conexión a internet se pierde
  // private checkInternetConnection(): void {
  //   this._error500Service.onlineStatus$.subscribe(status => {
  //     if (!status) {
  //       const previousUrl = localStorage.getItem('previousUrl');
  //       console.log('URL antes de perder conexión:', previousUrl); // Verifica la URL anterior en la consola
  //       if (previousUrl) {
  //         localStorage.removeItem('previousUrl');
  //         this.router.navigateByUrl(previousUrl);
  //       } else {
  //         this.router.navigate(['/']);
  //       }
  //     }
  //   });
  // }
}
