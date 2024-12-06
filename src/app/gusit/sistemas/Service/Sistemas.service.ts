import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject} from 'rxjs';
import { AllSistemas } from '../Interface/allSistemas';

@Injectable({
  providedIn: 'root'
})
export class SistemasService {
  private apiUrl = 'https://tramitesenlinea.ircep.gob.mx/ws/generalLogin/api/sparkle/';
  private apiLocal = 'http://192.168.1.147:8080/api/sparkle/';


  private endpoints = {
    detallesSistema: 'Sistemas/',
    agregaSistema: 'SistemAlta',
    actualizaSistema: 'SistemModifica',
    cambiaResponsable: 'SistemAgreResponsable',
    perfilesDelSistema: (nombre: string) => `SistemCatalogoPerfil/${nombre}`, // Dinámica
    apagarSistema: 'SistemaBaja',
    encenderSistema: 'SistemaReactiva',
    activaSistema: 'SistemaActiva',
    usuariosDelSistemaPerfil: 'perfil/MuestraUsuarios',
    vincularSistemaPerfilUsuarios: 'Vincula/VinculaUsuarios',
    desvincularSistemaPerfilUsuarios: 'Vincula/DesvinculaUsuarios',
    usuariosPorSistema: 'MuestraSistema/VerLosUsuarios/',
    perfilesPorSistema: 'MuestraSistema/VerLosPerfiles/',
    noUsuariosPorSistema: 'Muestra/VerNoUsuarios/',
    noPerfilesPorSistema: 'Muestra/VerNoPerfiles/',
    noVistasPorSistema: 'Muestra/VerNoVistass/',

    muestraControlesVistaPerfilSistema: 'PerfilDeVistaSistema'



  };

  private actualizaTablaSistemas = new BehaviorSubject <boolean> (false); // Servicio compartido (intermediario) para Actualiza la tablaUsuarios
  sistemaActualizado$ = this.actualizaTablaSistemas.asObservable();

  private actualizarDetalles = new BehaviorSubject <AllSistemas | null> (null); /*  Inicialmente contiene null como valor predeterminado. Esto se debe a que no hay ningún usuario seleccionado al principio.*/
  sistemaDetallesActualizado$ = this.actualizarDetalles.asObservable(); /* observable que emite los cambios en los detalles del usuario. Se suscribirán a este observable los componentes que necesiten conocer los detalles actualizados del usuario.*/

  updateTableEvent: EventEmitter<any> = new EventEmitter();

  constructor(private http: HttpClient) {}

  actualizarTablaSistemas() {
    this.actualizaTablaSistemas.next(true);
  }

  actualizarDetallesSistema(sistema: AllSistemas) {
    this.actualizarDetalles.next(sistema);
  }

  emitUpdateEvent() {
    this.updateTableEvent.emit();
  }

  detallesTablaSistemas(): Observable<AllSistemas[]> {
    return this.http.get<AllSistemas[]>(this.apiUrl + this.endpoints.detallesSistema);
  }

  addSistema (sistemaData: any): Observable <string> {
    return this.http.put <string> (this.apiUrl + this.endpoints.agregaSistema, sistemaData);
  }

  updateSistema(sistema: any): Observable<string> {
    return this.http.put<string>(this.apiUrl + this.endpoints.actualizaSistema, sistema);
  }

  cambiarResponsable(sistema: string, usuario: string): Observable<any> {
    const url = `${this.apiUrl}${this.endpoints.cambiaResponsable}/${sistema}/${usuario}`;
    return this.http.patch(url, null);
  }

  apagarSistema(version: string, nombre: string ): Observable <any> {
    const body = { version, nombre}
    // console.log ('Datos enviados a la API',body)
    return this.http.put <any> (this.apiUrl + this.endpoints.apagarSistema, body);
  }

  encenderSistema(version: string, nombre: string ): Observable <any> {
    const body = { version, nombre}
    // console.log ('Datos enviados a la API',body)
    return this.http.put <any> (this.apiUrl + this.endpoints.encenderSistema, body);
  }

  activarSistema(version: string, nombre: string ): Observable <any> {
    const body = { version, nombre}
    console.log ('Datos enviados a la API',body)
    return this.http.put <any> (this.apiUrl + this.endpoints.activaSistema, body);
  }

  perfilesPorSistemas(sistema: string): Observable<any> {       //Vincular Perfil -- solo regresa los perfiles activos
    const url = this.apiUrl + this.endpoints.perfilesDelSistema(sistema);
    return this.http.get<any>(url);
  }

  usuariosPorSistemaPerfil (sistema:string, perfil:string): Observable <any> {
    const body = { sistema, perfil };
    return this.http.put<any>(this.apiUrl + this.endpoints.usuariosDelSistemaPerfil, body);
  }

  vinculaSistemaPerfilUsuarios(sistema: string, perfil: string, componentes: string[] | string): Observable<any> {
    const lstComponentes = Array.isArray(componentes) ? componentes : componentes.split(',');
    const body = { sistema, perfil, lstComponentes };
    return this.http.post(this.apiUrl + this.endpoints.vincularSistemaPerfilUsuarios, body);
  }

  desvinculaSistemaPerfilUsuarios(sistema: string, perfil: string, componentes: string[] | string): Observable<any> {
    const lstComponentes = Array.isArray(componentes) ? componentes : componentes.split(',');
    const body = { sistema, perfil, lstComponentes };
    return this.http.post(this.apiUrl + this.endpoints.desvincularSistemaPerfilUsuarios, body);
  }

  usuariosPorSistema(sistema: string): Observable<any> {
    const url = this.apiUrl + this.endpoints.usuariosPorSistema + sistema;
    return this.http.get<any>(url);
  }

  perfilesPorSistema(sistema: string): Observable<any> {
    const url = this.apiUrl + this.endpoints.perfilesPorSistema + sistema;
    return this.http.get<any>(url);
  }

  perfilesPorSistemaa(sistema: string): Observable<any> {
    const url = `${this.apiUrl}${this.endpoints.perfilesPorSistema}/${sistema}`;
    return this.http.get<any>(url);
  }






  noUsuariosPorSistema(sistema: string): Observable<any> {
    const url = this.apiUrl + this.endpoints.noUsuariosPorSistema + sistema;
    return this.http.get<any>(url);
  }

  noPerfilesPorSistema(sistema: string): Observable<any> {
    const url = this.apiUrl + this.endpoints.noPerfilesPorSistema + sistema;
    return this.http.get<any>(url);
  }


  noVistasPorSistema(sistema: string): Observable<any> {
    const url = this.apiUrl + this.endpoints.noVistasPorSistema + sistema;
    return this.http.get<any>(url);
  }

  obtenerControlesPorSistemaPerfilVistas(sistema: string, perfil: string, vista: string): Observable<any> {
    const url = `${this.apiLocal}${this.endpoints.muestraControlesVistaPerfilSistema}/${sistema}/${perfil}/${vista}`;
    return this.http.get<any>(url);
  }


  obtenerControlesPorSistemaPerfilVista(sistema: string, perfil: string, vista: string): Observable<any> {
    const url = `${this.apiLocal}${this.endpoints.muestraControlesVistaPerfilSistema}/${vista}/${sistema}/${perfil}`;
    return this.http.get<any>(url);
  }
}
