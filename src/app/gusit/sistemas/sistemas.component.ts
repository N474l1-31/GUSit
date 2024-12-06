import { Component, OnInit, ViewChild, AfterViewInit, Injectable } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatDialog, MatDialogRef, MatDialogConfig  } from '@angular/material/dialog';
import  Swal  from 'sweetalert2';

import { SistemasService } from './Service/Sistemas.service';
import { AllSistemas } from './Interface/allSistemas';



import { DialogRegistrarSistemaComponent } from './Modales/dialogRegistrarSistema/dialogRegistrarSistema.component';
import { DialogDetallesSistemaComponent } from './Modales/dialogDetallesSistema/dialogDetallesSistema.component';
import { DialogEditarSistemaComponent } from './Modales/dialogEditarSistema/dialogEditarSistema.component';
import { DialogCambiarResponsableSistemaComponent } from './Modales/dialogCambiarResponsableSistema/dialogCambiarResponsableSistema.component';
import { DialogSistemaEncenderComponent } from './Modales/dialogSistemaEncender/dialogSistemaEncender.component';
import { DialogSistemaApagarComponent } from './Modales/dialogSistemaApagar/dialogSistemaApagar.component';
import { DialogSistemaActivarComponent} from './Modales/dialogSistemaActivar/dialogSistemaActivar.component';
import { DialogSistemaVinculaPerfilesComponent } from './Modales/dialogSistemaVinculaPerfiles/dialogSistemaVinculaPerfiles.component';
import { DialogSistemaDesvinculaPerfilesComponent } from './Modales/dialogSistemaDesvinculaPerfiles/dialogSistemaDesvinculaPerfiles.component';
import { DialogSistemaVinculaUsuariosComponent } from './Modales/dialogSistemaVinculaUsuarios/dialogSistemaVinculaUsuarios.component';
import { DialogSistemaDesvinculaUsuariosComponent } from './Modales/dialogSistemaDesvinculaUsuarios/dialogSistemaDesvinculaUsuarios.component';
import { DialogSistemaVinculaVistasComponent } from './Modales/dialogSistemaVinculaVistas/dialogSistemaVinculaVistas.component';
import { DialogSistemaDesvinculaVistasComponent } from './Modales/dialogSistemaDesvinculaVistas/dialogSistemaDesvinculaVistas.component';
import { DialogDetallesSistemaPerfilesComponent } from './Modales/dialogDetallesSistemaPerfiles/dialogDetallesSistemaPerfiles.component';
import { DialogDetallesSistemaUsuariosComponent } from './Modales/dialogDetallesSistemaUsuarios/dialogDetallesSistemaUsuarios.component';
import { DialogDetallesSistemaVistasComponent } from './Modales/dialogDetallesSistemaVistas/dialogDetallesSistemaVistas.component';
import { DialogDetallesSistemaPerfilVistasComponent } from './Modales/dialogDetallesSistemaPerfilVistas/dialogDetallesSistemaPerfilVistas.component';
import { DialogDetallesSistemaPerfilVistaControlesComponent } from './Modales/dialogDetallesSistemaPerfilVistaControles/dialogDetallesSistemaPerfilVistaControles.component';



@Injectable()
export class CustomMatPaginatorIntl extends MatPaginatorIntl {     //Cambiar el idioma de las etiquetas
  constructor() {
    super();
    // Cambiar el texto de "of" a "de"
    this.itemsPerPageLabel = 'Elementos por página';
    this.nextPageLabel = 'Siguiente página';
    this.previousPageLabel = 'Página anterior';
    this.firstPageLabel = 'Primera página';
    this.lastPageLabel = 'Última página';
  }

  override getRangeLabel = (page: number, pageSize: number, length: number): string => {      // Cambiar el formato del rango
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
  selector: 'app-sistemas',
  templateUrl: './sistemas.component.html',
  styleUrls: ['./sistemas.component.css'],
  providers: [{ provide: MatPaginatorIntl, useClass: CustomMatPaginatorIntl }]
})

export class SistemasComponent implements OnInit, AfterViewInit {
  @ViewChild('paginacionSistemas') paginacionSistemas: MatPaginator;
  @ViewChild('paginacionSistemasConfiguracionSistemas') paginacionSistemasConfiguracionSistemas: MatPaginator;
  @ViewChild('paginacionSistemasDetallesUsuarios') paginacionSistemasDetallesUsuarios: MatPaginator;

/********************************    VARIABLES DECLARADAS PARA SISTEMA * MIS SISTEMAS  ********************************/
  DtT: AllSistemas[] = [];  //DtT es la V. donde regresa los resultados de la API
  dataSourceSistemas = new MatTableDataSource <AllSistemas> ();
  displayedColumns: string[] = ['Sistema', 'Responsable', 'Acciones'];
  dataLenght: number = 0;
  filtroSistema: string = '';
  sistema: any;
  sistemasCargados: boolean = false;

/********************************    VARIABLES DECLARADAS PARA SISTEMA * CONFIGURACION SISTEMA  ********************************/
  dataSourceConfiguracionSistemas = new MatTableDataSource <AllSistemas> ();
  displayedColumnsConfiguracionSistemas: string[] = ['Sistema','Responsable', 'Acciones'];

/********************************    VARIABLES DECLARADAS PARA SISTEMA * DETALLES SISTEMA ********************************/
  dataSourceDetallesSistemas = new MatTableDataSource <AllSistemas> ();
  displayedColumnsDetallesSistema: string[] = ['Sistema','Responsable', 'Acciones'];

  constructor (
    private _sistemasService: SistemasService,
    private dialog: MatDialog){}

  ngOnInit() {
    this.muestraSistemas();
    this.autoSistemas();
  }

  ngAfterViewInit() {
    this.dataSourceSistemas.paginator = this.paginacionSistemas;
    this.dataSourceSistemas.filterPredicate = this.filtroPersonalizado();

    this.dataSourceConfiguracionSistemas.paginator = this.paginacionSistemasConfiguracionSistemas;
    this.dataSourceConfiguracionSistemas.filterPredicate = this.filtroPersonalizado();

    this.dataSourceDetallesSistemas.paginator = this.paginacionSistemasDetallesUsuarios;
    this.dataSourceDetallesSistemas.filterPredicate = this.filtroPersonalizado();
  }

  autoSistemas(){   // Observable - Subscribe (automaticamente carga los cambios)
      this._sistemasService.sistemaActualizado$.subscribe(() => {// Suscribe al servicio para detectar cambios en la tablaSistemas
        this.muestraSistemas();
      });
  }

/********************************    METODOS PARA MENU (AGREGAR - SISTEMAS)  ********************************/
  dialogRegistrarSistema(data:any): void {    //Dialogo AgregarSistema
    const modRegistrar = this.dialog.open (DialogRegistrarSistemaComponent, {
      width: '600px',
      height: '530px',
      data: data,
      disableClose: true,
    });
    modRegistrar.afterClosed().subscribe((result) => {
      if (result === '') {
        this.muestraSistemas();
      }
    });
  }

/********************************    METODOS PARA MENU (SISTEMA - MIS SISTEMA)  ********************************/
  muestraSistemas() {
      this._sistemasService.detallesTablaSistemas().subscribe(    //La respuesta de la Api ya esta en formato JSON, no se necesita una hacer un JSON.parse().
        (data: any) => {
          if (data.DtT) {
            this.DtT = data.DtT;
            this.dataSourceSistemas.data = this.DtT;
            this.dataSourceConfiguracionSistemas.data = this.DtT;
            this.dataSourceDetallesSistemas.data = this.DtT;      //Llena la 3ra. tablaDetallesUsuariosVinculados
            this.dataLenght = this.DtT.length;
            console.log('Sistemas devueltos por Api:',this.DtT);
          } else {
            console.error('La propiedad DtT en la respuesta está vacía o indefinida.');
          }
        },
        (error) => {
          console.error('Error Obteniendo Sistemas:', error);
        }
      );
    }

  changeFiltroSistema() {
    this.filtroSistema = '';
    this.dataSourceSistemas.filter = '';                // Limpia el filtro de la primera tabla
    this.dataSourceConfiguracionSistemas.filter = '';   // Limpia el filtro de la segunda tabla
    this.dataSourceDetallesSistemas.filter = '';        // Limpia el filtro de la tercera tabla
  }

  filtroMisSistemas() {
    const filtroSistemaLowerCase = this.filtroSistema.toLowerCase();
    const filterValue = JSON.stringify({ sistema: filtroSistemaLowerCase });

    this.dataSourceSistemas.filter = filterValue;               // Aplica el filtro a la primera tabla
    this.dataSourceConfiguracionSistemas.filter = filterValue;  // Aplica el filtro a la segunda tabla
    this.dataSourceDetallesSistemas.filter = filterValue;       // Aplica el filtro a la tercera tabla
  }

  private filtroPersonalizado() {
    return (data: AllSistemas, filter: string) => {
      const { sistema } = JSON.parse(filter);
      const sistemaLowerCase = data.nombre.toLowerCase();

      // Coincidencia solo con el campo "nombre"
      const matchSistema = sistemaLowerCase.includes(sistema);
        return matchSistema;
    };
  }

/********************************    METODOS PARA MENU (ACCIONES - SISTEMAS)  ********************************/
  dialogDetallesSistema(sistemaDetalles: AllSistemas): void { //Dialogo Detalles de Usuario
    const dialogConfig = new MatDialogConfig();
      dialogConfig.width = '500px';
      dialogConfig.maxHeight = '80vh';
      dialogConfig.data = sistemaDetalles;
      dialogConfig.disableClose = false;

    const modDetalle = this.dialog.open (DialogDetallesSistemaComponent, dialogConfig );
      modDetalle.afterClosed().subscribe((result) => {
        if (result === '') {
          this.muestraSistemas();
        }
    });
  }

  dialogEditarSistema(sistemaEditar: any): void {
    if (sistemaEditar.status.toLowerCase() !== 'activo') {
      Swal.fire({
        title: '¡No se puede Editar el Sistema!',
        text: '¡Debe estar en Status ACTIVO!',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: "#3085D6"
      });
      } else {
          const dialogRef: MatDialogRef<DialogEditarSistemaComponent> = this.dialog.open(DialogEditarSistemaComponent, {
            width: '500px',
            height: '370px',
            data: sistemaEditar,
            disableClose: true,
        });

      dialogRef.afterClosed().subscribe(result => {
        this.muestraSistemas();
      });
    }
  }

  dialogCambiarResponsableSistema(cambiarResponsable: any): void {
    if (cambiarResponsable.status.toLowerCase() === 'apagado') {
      Swal.fire({
        title: '¡No se puede Editar el Sistema!',
        text: '¡Sistema Apagado!',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: "#3085D6"
      });
      } else {
          const dialogRef: MatDialogRef<DialogCambiarResponsableSistemaComponent> = this.dialog.open(DialogCambiarResponsableSistemaComponent, {
            width: '330px',
            height: '370px',
            data: cambiarResponsable,
            disableClose: true,
        });

      dialogRef.afterClosed().subscribe(result => {
        this.muestraSistemas();
      });
    }
  }

  dialogEncenderSistema (sistemaEncender: any): void {     //Dialogo Encender Sistema
    console.log ('Qué Sistema se Encenderá:', sistemaEncender.nombre);
    if (sistemaEncender.status.toLowerCase() !== 'apagado'){
      console.log('El Sistema ya está "Activo" o se encuentra en "Proceso"');
      Swal.fire({
        title: '¡No se puede Encender el Sistema!',
        text: '¡Sistema Activo o en Proceso!',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: "#3085D6"
      });

    } else {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = '600px';
      dialogConfig.maxHeight = '80vh';
      dialogConfig.data = sistemaEncender;
      dialogConfig.disableClose = true;

    const dialogRef = this.dialog.open(DialogSistemaEncenderComponent, dialogConfig);
      dialogRef.afterClosed().subscribe((result) => {
        if (result === '') {
          this.muestraSistemas();
        }
    });
    }
  }

  dialogApagarSistema (sistemaApagar: any): void {     //Dialogo Apagar Sistema
    console.log ('Qué Sistema se Apagará:', sistemaApagar.nombre);
    if (sistemaApagar.status.toLowerCase() !== 'activo'){
      console.log('El Sistema ya está "Apagado" o se encuentra en "Proceso"');
      Swal.fire({
        title: '¡Opss!',
        text: '¡Sistema Apagado o en Proceso!',
        icon: 'info',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: "#3085D6"
      });
    } else {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = '600px';
      dialogConfig.maxHeight = '80vh';
      dialogConfig.data = sistemaApagar;
      dialogConfig.disableClose = true;

    const dialogRef = this.dialog.open(DialogSistemaApagarComponent, dialogConfig);
      dialogRef.afterClosed().subscribe((result) => {
        if (result === '') {
          this.muestraSistemas();
        }
    });
    }
  }

  dialogActivarSistema (sistemaActivar: any): void {     //Dialogo Apagar Sistema
    console.log ('Qué Sistema se Activara:', sistemaActivar.nombre);
    if (sistemaActivar.status.toLowerCase() !== 'proceso'){
      console.log('Solo se puede "Activar" un Sistema en "Proceso" .');
      Swal.fire({
        title: 'Oops!!!',
        text: 'Solo se puede "Activar" un Sistema en "Proceso".',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: "#3085d6"
    });
    } else {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = '600px';
      dialogConfig.maxHeight = '80vh';
      dialogConfig.data = sistemaActivar;
      dialogConfig.disableClose = true;

    const dialogRef = this.dialog.open(DialogSistemaActivarComponent, dialogConfig);
      dialogRef.afterClosed().subscribe((result) => {
        if (result === '') {
          this.muestraSistemas();
        }
    });
    }
  }

  dialogVinculaSistemaPerfiles (sistemaVP: any): void {     //Dialogo Vincular Sistema a Perfiles
    if (sistemaVP.status.toLowerCase() === 'apagado') {
      Swal.fire({
        title: '¡No se puede Vincular Perfiles!',
        text: 'El Sistema no se encuentra ACTIVO.',
        icon: 'info',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: "#3085D6"
      });
      } else {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = '800px';
        dialogConfig.maxHeight = '80vh';
        dialogConfig.data = sistemaVP;
        dialogConfig.disableClose = true;

          const dialogRef: MatDialogRef<DialogSistemaVinculaPerfilesComponent> = this.dialog.open(DialogSistemaVinculaPerfilesComponent, dialogConfig );
      dialogRef.afterClosed().subscribe((result) => {
        if (result === '') {
          this.muestraSistemas();
        }
      });
    }
  }

  dialogDesvinculaSistemaPerfiles (sistemaDP: any): void {     //Dialogo Desvincular Sistema a Perfiles
    if (sistemaDP.status.toLowerCase() === 'apagado') {
      Swal.fire({
        title: '¡No se puede Desvincular Perfiles!',
        text: 'El Sistema no se encuentra ACTIVO.',
        icon: 'info',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: "#3085D6"
      });
      } else {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = '800px';
        dialogConfig.maxHeight = '80vh';
        dialogConfig.data = sistemaDP;
        dialogConfig.disableClose = true;

      const dialogRef: MatDialogRef<DialogSistemaDesvinculaPerfilesComponent> = this.dialog.open(DialogSistemaDesvinculaPerfilesComponent, dialogConfig );
      dialogRef.afterClosed().subscribe((result) => {
        if (result === '') {
          this.muestraSistemas();
        }
      });
    }
  }

  dialogVinculaSistemaUsuarios (sistemaVPU: any): void {     //Dialogo Vincular Sistema a Perfil-Usuarios
    if (sistemaVPU.status.toLowerCase() === 'apagado') {
      Swal.fire(
        '¡No se puede Vincular Usuarios!',
        ' El Sistema no se encuentra en Status Activo.',
        'warning'
      );
      } else {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = '700px';
        dialogConfig.maxHeight = '80vh';
        dialogConfig.data = sistemaVPU;
        dialogConfig.disableClose = true;

      const dialogRef: MatDialogRef<DialogSistemaVinculaUsuariosComponent> = this.dialog.open(DialogSistemaVinculaUsuariosComponent, dialogConfig );
      dialogRef.afterClosed().subscribe((result) => {
        if (result === '') {
          this.muestraSistemas();
        }
      });
    }
  }

  dialogDesvinculaSistemaUsuarios (sistemaDPU: any): void {     //Dialogo Vincular Sistema a Perfil-Usuarios
    if (sistemaDPU.status.toLowerCase() === 'apagado') {
      Swal.fire(
        '¡No se puede Desvincular Usuarios!',
        ' El Sistema no se encuentra en Status Activo.',
        'warning'
      );
      } else {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = '700px';
        dialogConfig.maxHeight = '80vh';
        dialogConfig.data = sistemaDPU;
        dialogConfig.disableClose = true;

      const dialogRef: MatDialogRef<DialogSistemaDesvinculaUsuariosComponent> = this.dialog.open(DialogSistemaDesvinculaUsuariosComponent, dialogConfig );
      dialogRef.afterClosed().subscribe((result) => {
        if (result === '') {
          this.muestraSistemas();
        }
      });
    }
  }

  dialogVinculaSistemaVistas (sistemaVV: any): void {     //Dialogo Vincular Sistema a Vistas
    if (sistemaVV.status.toLowerCase() === 'apagado') {
      Swal.fire(
        '¡No se puede Vincular Vistas!',
        ' El Sistema no se encuentra en Status Activo.',
        'warning'
      );
      } else {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = '800px';
        dialogConfig.maxHeight = '80vh';
        dialogConfig.data = sistemaVV;
        dialogConfig.disableClose = true;

      const dialogRef: MatDialogRef<DialogSistemaVinculaVistasComponent> = this.dialog.open(DialogSistemaVinculaVistasComponent, dialogConfig );
      dialogRef.afterClosed().subscribe((result) => {
        if (result === '') {
          this.muestraSistemas();
        }
      });
    }
  }

  dialogDesvinculaSistemaVistas (sistemaDV: any): void {     //Dialogo Desvincular Sistema a Vistas
    if (sistemaDV.status.toLowerCase() === 'apagado') {
      Swal.fire(
        '¡No se puede Desvincular Vistas!',
        ' El Sistema no se encuentra en Status Activo.',
        'warning'
      );
      } else {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = '700px';
        dialogConfig.maxHeight = '80vh';
        dialogConfig.data = sistemaDV;
        dialogConfig.disableClose = true;

      const dialogRef: MatDialogRef<DialogSistemaDesvinculaVistasComponent> = this.dialog.open(DialogSistemaDesvinculaVistasComponent, dialogConfig );
      dialogRef.afterClosed().subscribe((result) => {
        if (result === '') {
          this.muestraSistemas();
        }
      });
    }
  }

  dialogDetallesSistemaUsuarios(sistemasDetallesUsuarios: any): void { //Dialogo Detalles de Usuarios
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = sistemasDetallesUsuarios;
      dialogConfig.disableClose = false;

      const modDetalleUsuarios = this.dialog.open(DialogDetallesSistemaUsuariosComponent, dialogConfig);
      modDetalleUsuarios.afterClosed().subscribe((result) => {
        if (result === '') {
          this.muestraSistemas();
        }
      });
  }

  dialogDetallesSistemaPerfiles(sistemasDetallesPerfiles: any): void { //Dialogo Detalles de Perfiles
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = sistemasDetallesPerfiles;
      dialogConfig.disableClose = false;

      const modDetallePerfiles = this.dialog.open(DialogDetallesSistemaPerfilesComponent, dialogConfig);
      modDetallePerfiles.afterClosed().subscribe((result) => {
        if (result === '') {
          this.muestraSistemas();
        }
      });
  }

  dialogDetallesSistemaVistas(sistemasDetallesVistas: any): void { //Dialogo Detalles de Vistas
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = sistemasDetallesVistas;
      dialogConfig.disableClose = false;

      const modDetalleVistas = this.dialog.open(DialogDetallesSistemaVistasComponent, dialogConfig);
      modDetalleVistas.afterClosed().subscribe((result) => {
        if (result === '') {
          this.muestraSistemas();
        }
      });
  }

  dialogDetallesSistemaPerfilVistas(sistemasDetallesSPV: any): void { //Dialogo Detalles de SistemaPerfilVistas
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = sistemasDetallesSPV;
    dialogConfig.disableClose = false;

    const modDetallesSPV = this.dialog.open(DialogDetallesSistemaPerfilVistasComponent, dialogConfig);
    modDetallesSPV.afterClosed().subscribe((result) => {
      if (result === '') {
        this.muestraSistemas();
      }
    });
  }

  dialogDetallesSistemaPerfilVistaControles(sistemasDetallesSPVC: any): void { //Dialogo Detalles de SistemaPerfilVistas
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = sistemasDetallesSPVC;
    dialogConfig.disableClose = false;

    const modDetallesSPVC = this.dialog.open(DialogDetallesSistemaPerfilVistaControlesComponent, dialogConfig);
    modDetallesSPVC.afterClosed().subscribe((result) => {
      if (result === '') {
        this.muestraSistemas();
      }
    });
  }





}
