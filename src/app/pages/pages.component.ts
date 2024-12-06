import { Component, ChangeDetectorRef, ViewChild, OnInit } from '@angular/core';
import { Router} from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import { BreakpointObserver  } from '@angular/cdk/layout';
import { DatePipe } from '@angular/common';
import { DatosLoginService } from './Service/datosLogin.service';   // SERVICIO INTERMEDIARIO QUE GUARDA PERFIL Y NOMBRE COMPLETO ...
import { AuthService } from '../login/login/Service/auth.service';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.css'],
  providers: [DatePipe]
})
export class PagesComponent implements OnInit{

  fechaActual: string;
  manualPDF: string ='assets/pdf/triptico.pdf';

  showUserDetails = false;
  modulos = [
    { nombre: 'Usuario', icono: 'person', ruta: 'gusit/usuario' },
    { nombre: 'Perfil', icono: 'account_circle', ruta: 'gusit/perfil' },
    { nombre: 'Sistema', icono: 'computer', ruta: 'gusit/sistemas' },
    { nombre: 'Vista', icono: 'visibility', ruta: 'gusit/vistas' },
    // { nombre: 'Control', icono: 'settings', ruta: 'gusit/control' },
    { nombre: 'Auditoria', icono: 'assignment', ruta: 'gusit/auditoria' },
  ];

  @ViewChild (MatSidenav)
  sidenav!: MatSidenav;

  constructor(
    private observer: BreakpointObserver,
    private cd: ChangeDetectorRef,
    private router: Router,
    private datosLoginService: DatosLoginService,
    private _authService: AuthService,
    private fechaHora: DatePipe
    ) {
        this.datosLoginService.loadUserData();
      }

  ngOnInit(): void {
    this.actualizarFechaHora();
      setInterval(() => {
      this.actualizarFechaHora();
      }, 1000); // Actualizar cada segundo
  }

  ngAfterViewInit() {
    this.observer.observe(['(max-width: 1000px)']).subscribe((resp: any) => {
      if (resp.matches) {
        this.sidenav.mode = 'over';
        this.sidenav.close();
      } else {
          this.sidenav.mode = 'side';
          this.sidenav.open();
        }
      });
      this.cd.detectChanges();
  }

  actualizarFechaHora(): void {
    const dateTime = new Date();
    this.fechaActual = this.fechaHora.transform(dateTime, 'EEEE, d MMMM y, h:mm:ss a', undefined, 'es-ES');
  }

  cerrarSesion(): void {
    this._authService.enableParticles();
    this.router.navigate(['/login']); // Ajusta la ruta según tu configuración
  }

  get perfil(): string {
    return this.datosLoginService.perfil; // Accede a los datos almacenados en el servicio datosLogin (Perfil)
  }

  get nombreCompleto(): string {
    return this.datosLoginService.nombreCompleto; // Accede a los datos almacenados en el servicio datosLogin (NombreCompleto)
  }

  get usuario(): string {
    return this.datosLoginService.usuario; // Obtener el usuario del servicio
  }

  manualUsuarioPDF() {
    window.open(this.manualPDF, '_blank');
  }

    // Método para alternar la visualización de los detalles
    toggleUserDetails(): void {
      this.showUserDetails = !this.showUserDetails;
    }

}
