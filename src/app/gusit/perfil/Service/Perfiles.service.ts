import { Injectable , EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { AllPerfiles } from './../Interface/allPerfiles';

@Injectable({
  providedIn: 'root'
})

export class PerfilesService {
  private apiUrl = 'https://tramitesenlinea.ircep.gob.mx/ws/generalLogin/api/sparkle/';

  private endpoints = {
    catalogoPerfiles : 'Muestra/Perfiles',
    detallesPerfiles: 'Muestra/DetallesPerfiles',
    agregaPerfil: 'perfil/AltaPerfil',
    perfilVinculadoASistemas: 'perfil/MuestraSistemas',
    perfilesVinculadosASistemaVistas: 'MuestraPerfil',
    desvincularPerfilSistema: 'perfil/DesvincularPerfil',
    vincularPerfilASistemaVistas: 'Vistas/VinculaPerfilSistema',
    desvincularPerfilASistemaVistas: 'Vistas/DesvinculaPerfilSistema',
    muestraVistasPerfilSistema: 'perfil/MuestraVistas',
    vincularPerfilesSistema: 'Vincula/VinculaPerfiles',        //LISTA DE PERFILES
    desvinculaPerfilesSistema: 'Vincula/DesvinculaPerfiles'
  };

  private actualizaTablaPerfiles = new BehaviorSubject <boolean> (false);
  perfilActualizado$ = this.actualizaTablaPerfiles.asObservable();

  private actualizarDetalles =  new BehaviorSubject <AllPerfiles | null> (null);
  perfilDetallesActualizado$ = this.actualizarDetalles.asObservable();

  updateTableEvent: EventEmitter<any> = new EventEmitter();

  constructor(private http:HttpClient) { }

  actualizarTablaPerfiles(){    // Actualiza automaticamente la tabla
    this.actualizaTablaPerfiles.next(true);
  }

  actualizarDetallesPerfil(perfil: AllPerfiles){
    this.actualizarDetalles.next(perfil)
  }

  emitUpdateEvent() {     // Método para emitir el evento de actualización
    this.updateTableEvent.emit();
  }

//-----
  detallesTablaPerfiles(): Observable<AllPerfiles[]> {
    return this.http.get<AllPerfiles[]>(this.apiUrl + this.endpoints.detallesPerfiles);
  }

  addPerfil(perfil: any): Observable<string> {
    return this.http.put<string>(this.apiUrl + this.endpoints.agregaPerfil, perfil);
  }

  vinculaPerfilesSistema(sistema: string, compon: string[] | string): Observable<any> {
    const url = `${this.apiUrl}${this.endpoints.vincularPerfilesSistema}`;
    const lstComponentes = Array.isArray(compon) ? compon : (compon ? compon.split(',') : ['default']);
    const body = { sistema, lstComponentes };
      return this.http.post(url, body);
  }

  desvinculaPerfilesSistema(sistema: string, compon: string[] | string): Observable<any> {
    const url = `${this.apiUrl}${this.endpoints.desvinculaPerfilesSistema}`;
    const lstComponentes = Array.isArray(compon) ? compon : (compon ? compon.split(',') : ['default']);
    const body = { sistema, lstComponentes };
      return this.http.post(url, body);
  }

  perfilSistemasVinculados(perfil: string) {
    return this.http.put(this.apiUrl + this.endpoints.perfilVinculadoASistemas, { perfil });
  }

  vinculaPerfilSistemaVistas(perfil: string, sistema: string, compon: string[] | string): Observable<any> {
    const url = `${this.apiUrl}${this.endpoints.vincularPerfilASistemaVistas}`;
    const lstComponentes = Array.isArray(compon) ? compon : (compon ? compon.split(',') : ['default']);
    const body = { perfil, sistema, lstComponentes };
    return this.http.put(url, body);
  }

  desvinculaPerfilSistemaVistas(perfil: string, sistema: string, compon: string[] | string): Observable<any> {
    const url = `${this.apiUrl}${this.endpoints.desvincularPerfilASistemaVistas}`;
    const lstComponentes = Array.isArray(compon) ? compon : (compon ? compon.split(',') : ['default']);
    const body = { perfil, sistema, lstComponentes };
    return this.http.put(url, body);
  }

  obtenerVistasPorSistemaPerfiles(sistema: string, perfil: string): Observable<any> {
    return this.http.put<any>(this.apiUrl + this.endpoints.muestraVistasPerfilSistema, { sistema, perfil });
  }

  obtenerPerfilPorSistemaVistas(sistema: string, vista: string): Observable<any> {
    const url = `${this.apiUrl}${this.endpoints.perfilesVinculadosASistemaVistas}?sistema=${sistema}&vista=${vista}`;
    return this.http.get(url);
  }

}
