import { Component, OnInit, ViewChild, AfterViewInit, Injectable } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import  Swal  from 'sweetalert2';

import { AllVistas } from './Interface/allVistas';
import { VistasService } from './Service/Vistas.service';
import { DialogRegistrarVistaComponent } from './Modales/dialogRegistrarVista/dialogRegistrarVista.component';
import { DialogVistaVincularSistemaComponent } from './Modales/dialogVistaVincularSistema/dialogVistaVincularSistema.component';
import { DialogVistaDesvincularSistemaComponent } from './Modales/dialogVistaDesvincularSistema/dialogVistaDesvincularSistema.component';
import { DialogVistaVincularSistemaPerfilComponent } from './Modales/dialogVistaVincularSistemaPerfil/dialogVistaVincularSistemaPerfil.component';
import { DialogVistaDesvincularSistemaPerfilComponent } from './Modales/dialogVistaDesvincularSistemaPerfil/dialogVistaDesvincularSistemaPerfil.component';
import { DialogDetallesVistaSistemaPerfilesComponent } from './Modales/dialogDetallesVistaSistemaPerfiles/dialogDetallesVistaSistemaPerfiles.component';


@Injectable()
export class CustomMatPaginatorIntl extends MatPaginatorIntl {    //Cambiar el idioma de las etiquetas
  constructor() {
    super();
    // Cambiar el texto de "of" a "de"
    this.itemsPerPageLabel = 'Elementos por página';
    this.nextPageLabel = 'Siguiente página';
    this.previousPageLabel = 'Página anterior';
    this.firstPageLabel = 'Primera página';
    this.lastPageLabel = 'Última página';
  }

  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) {
      return `0 de ${length}`;
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
    return `${startIndex + 1} – ${endIndex} de ${length}`;
  };
}


@Component({
  selector: 'app-vistas',
  templateUrl: './vistas.component.html',
  styleUrls: ['./vistas.component.css'],
  providers: [{ provide: MatPaginatorIntl, useClass: CustomMatPaginatorIntl }]
})
export class VistasComponent implements AfterViewInit, OnInit{
  @ViewChild('paginacionVistas') paginacionVistas: MatPaginator;      //Intancia para la paginaciónVistas
  @ViewChild('paginacionVistasConfiguracionVistas') paginacionVistasConfiguracionVistas: MatPaginator;      //Intancia para la paginaciónVistas


/********************************    VARIABLES DECLARADAS PARA VISTA * MIS VISTAS  ********************************/
  dataSourceVistas = new MatTableDataSource <AllVistas> ([]);
  displayedColumnsVista: string[] = ['Vista', 'Acciones'];   //  Nombre de las matColumnDef del Usuario
  filtroVista: string = '';
  vista: any;
  vistaSubscription: Subscription;
  listaDatos: AllVistas[] = [];

/********************************    VARIABLES DECLARADAS PARA SISTEMA * CONFIGURACION SISTEMA  ********************************/
  dataSourceConfiguracionVistas = new MatTableDataSource <AllVistas> ([]);
  displayedColumnsConfiguracionVista: string[] = ['Vista', 'Acciones'];

constructor (
  private _vistasService: VistasService,
  private dialog: MatDialog){}

/********************************    CICLOS DE VIDA  ********************************/
ngOnInit(): void {
  this.muestraVistas();
  this.autoVistas();
}

ngAfterViewInit() {     //Se ejecuta después de que Angular ha inicializado las vistas del componente y sus vistas secundarias.
  this.dataSourceVistas.paginator = this.paginacionVistas;
  this.dataSourceVistas.filterPredicate = this.filtroPersonalizado();

  this.dataSourceConfiguracionVistas.paginator = this.paginacionVistasConfiguracionVistas;
  this.dataSourceConfiguracionVistas.filterPredicate = this.filtroPersonalizado();
}

autoVistas() {    // Observable - Subscribe (automaticamente carga los cambios)
this._vistasService.vistaActualizado$.subscribe(() =>{
    this.muestraVistas();
  })
}

/********************************    METODOS PARA MENU (VISTA - VISTAS)  ********************************/
dialogAgregarVista( data:any): void {    //Dialogo AgregarSistema
  const modRegistrar = this.dialog.open (DialogRegistrarVistaComponent, {
    width: '380px',
    data: data,
    disableClose: true,
  });
  modRegistrar.afterClosed().subscribe((result) => {
    if (result === '') {
      this.muestraVistas();
    }
  });
}

/********************************    METODOS PARA MENU (SISTEMA - MIS SISTEMA)  ********************************/
muestraVistas() {
  this._vistasService.detallesTablaVistas().subscribe(
    (data: any) => {
      if(data.listaDatos){
        this.listaDatos = JSON.parse(data.listaDatos);
        this.listaDatos.reverse();

        console.log ('Lista de Vistas', this.listaDatos)
        this.dataSourceVistas.data = this.listaDatos;
        this.dataSourceConfiguracionVistas.data = this.listaDatos;

      }
  })
}

changeFiltroVista() {
  this.filtroVista = '';
  this.dataSourceVistas.filter = '';                // Limpia el filtro de la primera tabla
  this.dataSourceConfiguracionVistas.filter = '';   // Limpia el filtro de la segunda tabla
}

filtroMisVistas() {
  const filtroVistaLowerCase = this.filtroVista.toLowerCase();
  const filterValue = JSON.stringify({ vista: filtroVistaLowerCase });

  this.dataSourceVistas.filter = filterValue;               // Aplica el filtro a la primera tabla
  this.dataSourceConfiguracionVistas.filter = filterValue;  // Aplica el filtro a la segunda tabla
}

private filtroPersonalizado() {
  return (data: AllVistas, filter: string) => {
    const { vista } = JSON.parse(filter);
    const vistaLowerCase = data.vista.toLowerCase();

    // Coincidencia solo con el campo "nombre"
    const matchVistas = vistaLowerCase.includes(vista);
      return matchVistas;
  };
}

dialogActivarVista(vistaActivada: string): void {       //Dialogo Activar Vista
  console.log ('Vista Seleccionada:', vistaActivada);
  const vistaActiva = this.listaDatos.find(u => u.vista === vistaActivada && u.statuss === 'Activo');     // Verificar si el usuario está activo
  if (vistaActiva) {
    Swal.fire({
      title: 'Oops!!!',
      text: '¡Vista ACTIVA!',
      icon: 'info',
      iconColor: '#32a652',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: "#3085d6"
  });
  } else {
    Swal.fire({
      title: '¿Desea Activar la Vista?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#C82333",
    }).then((result) => {      // Verificar si se confirmó la activación del usuario
      if (result.isConfirmed) {
        this._vistasService.activarVista(vistaActivada).subscribe(
          (respuesta) => {
            if ( respuesta === 'Los datos fueron actualizados correctamente'){

            }
            console.log('Vista activada exitosamente.', respuesta);
            Swal.fire(
              'Vista Activada',
              '¡EXITOSAMENTE!',
              'success'
          );
            this.muestraVistas();
          },
          (error) => {
            console.error('Error al activar vista:', error);
          }
        );
      }
    });
  }
}

dialogDesactivarVista(vistaDesactivada: string): void {       //Dialogo Inactivar Vista
  console.log ('Vista Seleccionada:', vistaDesactivada);
  const vistaInactiva = this.listaDatos.find(u => u.vista === vistaDesactivada && u.statuss === 'Inactivo');     // Verificar si el usuario está activo
  if (vistaInactiva) {
    Swal.fire({
      title: 'Oops!!!',
      text: '¡Vista INACTIVA!',
      icon: 'info',
      iconColor: '#E43F31',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: "#3085d6"
  });
  } else {
    Swal.fire({
      title: '¿Desea Inactivar la Vista?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#C82333",
    }).then((result) => {      // Verificar si se confirmó la activación del usuario
      if (result.isConfirmed) {
        this._vistasService.desactivarVista(vistaDesactivada).subscribe(
          (respuesta) => {
            if ( respuesta === 'Los datos fueron actualizados correctamente'){

            }
            console.log('Vista desactivada exitosamente.', respuesta);
            Swal.fire(
              'Vista Desactivada',
              '¡EXITOSAMENTE!',
              'success'
          );
            this.muestraVistas();
          },
          (error) => {
            console.error('Error al desactivar vista:', error);
          }
        );
      }
    });
  }
}

dialogDetallesVistaSistemaPerfiles(vistaDSP:any): void {
  const dialogConfig = new MatDialogConfig();
  dialogConfig.width = '500px';
  dialogConfig.maxHeight = '80vh';
  dialogConfig.data = vistaDSP;
  dialogConfig.disableClose = false;


  const modDetallesVSP = this.dialog.open(DialogDetallesVistaSistemaPerfilesComponent, dialogConfig)
  modDetallesVSP.afterClosed().subscribe((result) => {
    if (result === '') {
      this.muestraVistas();
    }
  })
}






/********************************    METODOS PARA MENU (ACCIONES - VISTAS)  ********************************/
  dialogVinculaVistaSistema(vistasVS:any): void {
    const modVinculaVS = this.dialog.open(DialogVistaVincularSistemaComponent, {
      width: '400px',
      height: '300px',
      data: vistasVS,
      disableClose: true,
    });
    modVinculaVS.afterClosed().subscribe((result) => {
      if (result === '') {
        this.muestraVistas();
      }
    })
  }

  dialogDesvinculaVistaSistema(vistasDS:any): void {
    const modDesvinculaVS = this.dialog.open(DialogVistaDesvincularSistemaComponent,{
      width: '400px',
      height: '300px',
      data: vistasDS,
      disableClose: true,
    });
    modDesvinculaVS.afterClosed().subscribe((result) => {
      if (result === '') {
        this.muestraVistas();
      }
    })
  }

  dialogVinculaVistaSistemaPerfiles(vistasVSP:any): void {
    const modVinculaVSP = this.dialog.open(DialogVistaVincularSistemaPerfilComponent,{
      width: '450px',
      height: '380px',
      data: vistasVSP,
      disableClose: true,
    });
    modVinculaVSP.afterClosed().subscribe((result) => {
      if (result === '') {
        this.muestraVistas();
      }
    })
  }

  dialogDesvinculaVistaSistemaPerfiles(vistasDSP:any): void {
    const modVinculaVSP = this.dialog.open(DialogVistaDesvincularSistemaPerfilComponent,{
      width: '450px',
      height: '380px',
      data: vistasDSP,
      disableClose: true,
    });
    modVinculaVSP.afterClosed().subscribe((result) => {
      if (result === '') {
        this.muestraVistas();
      }
    })
  }


}


