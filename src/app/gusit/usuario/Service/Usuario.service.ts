import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject} from 'rxjs';
import { AllUsuarios } from '../Interface/all-usuarios';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private apiUrl = 'https://tramitesenlinea.ircep.gob.mx/ws/generalLogin/api/sparkle/';

  private endpoints = {
    catalogoUsuarios: 'Muestra/VerUsuarios',
    catalogoAreas: 'Muestra/Areas',
    catalogoStatus: 'Muestra/Status',
    detallesUsuarios: 'MuestraUsuarios',
    validaAgregaUsuario: 'insertaUsuarioV',
    agregaUsuario: 'insertaUsuario',
    cambiaPassword: 'cambiaPasswd',
    validaActualizaUsuario: 'actualizaUsuarioV',
    actualizaUsuario: 'actualizaUsuario',
    activarUsuario: 'perfil/ActivarUsuario',
    inactivarUsuario: 'perfil/BajaUsuario/',
    vincularUsuarioSistemaPerfil: (sistema: string, perfil: string, usuario: string) => `SistemAgrePerfil/${sistema}/${perfil}/${usuario}`,
    usuariosSistemas: 'Busca/',
    desvincularUsuarioSistemaPerfil: 'perfil/DesvincularUsuario/',
    cambiarPerfil: 'perfil/CambiarPerfil'
  };

  private actualizaTablaUsuarios = new BehaviorSubject <boolean> (false); // Servicio compartido (intermediario) para Actualiza la tablaUsuarios
  usuarioActualizado$ = this.actualizaTablaUsuarios.asObservable();

  private actualizarDetalles = new BehaviorSubject <AllUsuarios | null> (null); /*  Inicialmente contiene null como valor predeterminado. Esto se debe a que no hay ningún usuario seleccionado al principio.*/
  usuarioDetallesActualizado$ = this.actualizarDetalles.asObservable(); /* observable que emite los cambios en los detalles del usuario. Se suscribirán a este observable los componentes que necesiten conocer los detalles actualizados del usuario.*/

  updateTableEvent: EventEmitter<any> = new EventEmitter();

  constructor(private http: HttpClient) {}

  actualizarTablaUsuarios() {
    this.actualizaTablaUsuarios.next(true);
  }

  actualizarDetallesUsuario(usuario: AllUsuarios) {
    this.actualizarDetalles.next(usuario);
  }

  emitUpdateEvent() {
    this.updateTableEvent.emit();
  }

  //-----
  catalogoUsuarios(): Observable<any> {
    return this.http.get(this.apiUrl + this.endpoints.catalogoUsuarios);
  }

  catalogoAreas(): Observable<any> {
    return this.http.get(this.apiUrl + this.endpoints.catalogoAreas);
  }

  catalogoStatus(): Observable<any> {
    return this.http.get(this.apiUrl + this.endpoints.catalogoStatus);
  }

  detallesTablaUsuarios(): Observable<AllUsuarios[]> {
    return this.http.get<AllUsuarios[]>(this.apiUrl + this.endpoints.detallesUsuarios);
  }

  validaAddUsuario(usuario: any): Observable<string> {
    return this.http.post(this.apiUrl + this.endpoints.validaAgregaUsuario, usuario, { responseType: 'text' });
  }

  addUsuario(usuario: any): Observable<string> {
    return this.http.post(this.apiUrl + this.endpoints.agregaUsuario, usuario, { responseType: 'text' });
  }

  resetPassword(usuario: string, passwd: string): Observable<any> {
    const body = { usuario, passwd };
    return this.http.put(this.apiUrl + this.endpoints.cambiaPassword, body);
  }
  
  validaUpdateUsuario(usuario: string): Observable<string> {
    return this.http.put(this.apiUrl + this.endpoints.validaActualizaUsuario, usuario, { responseType: 'text' });
  }

  updateUsuario(usuario: string): Observable<string> {
    return this.http.put(this.apiUrl + this.endpoints.actualizaUsuario, usuario, { responseType: 'text' });
  }

  activateUsuario(usuario: string): Observable<any> {
    const body = { usuario };
    return this.http.put(this.apiUrl + this.endpoints.activarUsuario, body).pipe(
      tap(() => this.actualizarTablaUsuarios()) // Emitir el evento después de activar el usuario
    );
  }

  inactivateUsuario(usuario: string): Observable<any> {
    const body = { usuario };
    return this.http.put(this.apiUrl + this.endpoints.inactivarUsuario, body);
  }

  vincularUsuarioSP(sistema: string, perfil: string, usuario: string): Observable<any> {
    const url = `${this.apiUrl}${this.endpoints.vincularUsuarioSistemaPerfil(sistema, perfil, usuario)}`;
    return this.http.post<any>(url, {});
  }

  allUsuariosSistemas(analista: string): Observable<any> {
    const url = this.apiUrl + this.endpoints.usuariosSistemas + analista;
    return this.http.get<any>(url);
  }

  cambiarPerfil(usuario: string, sistema: string, perfil: string): Observable<any> {
    const url = `${this.apiUrl}${this.endpoints.cambiarPerfil}`;
    const body = { usuario, sistema, perfil };
    return this.http.put(url, body);
  }

  desvincularUsuarioSP(usuario: string, Sistema: string, perfil: string): Observable<any> {
    const body = { usuario, Sistema, perfil };
    return this.http.put <any> (this.apiUrl + this.endpoints.desvincularUsuarioSistemaPerfil, body);
  }
}
