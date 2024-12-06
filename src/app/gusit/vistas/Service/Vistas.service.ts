import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject} from 'rxjs';
import { AllVistas } from '../Interface/allVistas';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class VistasService {
  private apiUrl = 'https://tramitesenlinea.ircep.gob.mx/ws/generalLogin/api/sparkle/';
  private apiLocal = 'http://192.168.1.147:8080/api/sparkle/';

  private endpoints = {
    catalogoVistas: 'Muestra/Vistas',

    agregarVista: 'Vistas/Inserta',
    activaVista: 'VistaActivar',
    inactivaVista: 'VistaInactivar',
    vistasVinculadasSistemaPerfil: 'perfil/MuestraVistas',
    vistaVinculadaASistema: 'Muestra/VerSistemas/',
    vistasPorSistema: 'VerVistas/',
    vincularVistaSistema: 'Vistas/VinculaSistema',
    desvinculaVistaSistema: 'Vistas/DesvinculaSistema'

  };

  private actualizaTablaVistas = new BehaviorSubject <boolean> (false);
  vistaActualizado$ = this.actualizaTablaVistas.asObservable();

  private actualizarDetalles =  new BehaviorSubject <AllVistas | null> (null);
  vistaDetallesActualizado$ = this.actualizarDetalles.asObservable();

  updateTableEvent: EventEmitter<any> = new EventEmitter();

  constructor(private http:HttpClient) { }

  actualizarTablaVistas() {
    this.actualizaTablaVistas.next(true);
  }

  emitUpdateEvent() {
    this.updateTableEvent.emit();
  }

  detallesTablaVistas(): Observable<AllVistas[]> {
    return this.http.get<AllVistas[]>(this.apiUrl + this.endpoints.catalogoVistas);
  }

  detallesVistaSistemaPerfil(vista: string): Observable<any> {
    const url = this.apiUrl + this.endpoints.vistaVinculadaASistema + vista;
    return this.http.get<any>(url);
  }

  vistasSistema(sistema: string): Observable<any> {
    const url = this.apiUrl + this.endpoints.vistasPorSistema + sistema;
    return this.http.get<any>(url);
  }

  vistasSistemaPerfil(sistema: string, perfil: string): Observable<any> {
    const body = { sistema, perfil };
    return this.http.put(this.apiUrl + this.endpoints.vistasVinculadasSistemaPerfil, body);
  }

  addVista(lstComponentes: string[] | string): Observable<any> {
      const body = { lstComponentes };
      return this.http.put(this.apiUrl + this.endpoints.agregarVista, body);
    }

  activarVista(vista: string): Observable<any> {
    const url = `${this.apiLocal}${this.endpoints.activaVista}/${vista}`;
    return this.http.put(url, {}).pipe(
      tap(() => this.actualizarTablaVistas())
    );
  }

  desactivarVista(vista: string): Observable<any> {
    const url = `${this.apiLocal}${this.endpoints.inactivaVista}/${vista}`;
    return this.http.put(url, {}).pipe(
      tap(() => this.actualizarTablaVistas())
    );
  }













  vinculaVistaSistema(sistema: string, componentes: string[] | string): Observable<any> {
    const lstComponentes = Array.isArray(componentes) ? componentes : componentes.split(',');
    const body = { sistema, lstComponentes };
    return this.http.put(this.apiUrl + this.endpoints.vincularVistaSistema, body);
  }

  desvinculaVistaSistema(sistema: string, componentes: string[] | string): Observable<any> {
    const lstComponentes = Array.isArray(componentes) ? componentes : componentes.split(',');
    const body = { sistema, lstComponentes };
    return this.http.put(this.apiUrl + this.endpoints.desvinculaVistaSistema, body);
  }
}
