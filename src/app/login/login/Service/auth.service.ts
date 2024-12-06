import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError} from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})

export class AuthService {
  private apiLogin = 'https://tramitesenlinea.ircep.gob.mx/ws/generalLogin/api/sparkle/initSesion/'
  private particlesEnabled = true;

  constructor(private http: HttpClient) {}

  login(usuario: string, passwd: string): Observable<any> {
    const solicitud = {
      usuario,
      passwd,
      verssion: 'Produccion 1.0',
      sistema: 'G-USit'
    };

    return this.http.post<any>(this.apiLogin, solicitud).pipe(
      map(response => {
        if (response && response.usuario) {
          const userData = {
            perfil: response.perfil,
            nombreCompleto: response.nombreCompleto,
            usuario: response.usuario
          };
          localStorage.setItem('userData', JSON.stringify(userData));
          console.log('Datos de sesión guardados exitosamente:', userData);
        }
        return response;
      }),
      catchError(error => {
        console.error('Error al iniciar sesión:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('userData');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('userData');
  }

  getUserData(): any {
    return JSON.parse(localStorage.getItem('userData'));
  }


  enableParticles() {
    this.particlesEnabled = true;
  }

  disableParticles() {
    this.particlesEnabled = false;
  }

  areParticlesEnabled(): boolean {
    return this.particlesEnabled;
  }
}
