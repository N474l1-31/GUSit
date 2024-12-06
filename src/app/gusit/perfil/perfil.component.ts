import { Component, OnInit, ViewChild, AfterViewInit, Injectable} from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';

import { AllPerfiles } from './Interface/allPerfiles';
import { PerfilesService } from './Service/Perfiles.service';
import { DialogRegistrarPerfilComponent } from './Modales/dialogRegistrarPerfil/dialogRegistrarPerfil.component';
import { DialogDetallesPerfilComponent } from './Modales/dialogDetallesPerfil/dialogDetallesPerfil.component';
import { DialogPerfilVincularSistemaComponent } from './Modales/dialogPerfilVincularSistema/dialogPerfilVincularSistema.component';
import { DialogPerfilDesvincularSistemaComponent } from './Modales/dialogPerfilDesvincularSistema/dialogPerfilDesvincularSistema.component';
import { DialogPerfilVinculaVistasComponent } from './Modales/dialogPerfilVinculaVistas/dialogPerfilVinculaVistas.component';
import { DialogPerfilDesvinculaVistasComponent } from './Modales/dialogPerfilDesvinculaVistas/dialogPerfilDesvinculaVistas.component';
import { DialogDetallesPerfilSistemaVistasComponent } from './Modales/dialogDetallesPerfilSistemaVistas/dialogDetallesPerfilSistemaVistas.component';

@Injectable()
export class CustomMatPaginatorIntl extends MatPaginatorIntl {     //Cambiar el idioma de las etiquetas
  constructor() {
    super();  // Cambiar el texto de "of" a "de"
          this.itemsPerPageLabel = 'Elementos por página';
          this.nextPageLabel = 'Siguiente página';
          this.previousPageLabel = 'Página anterior';
          this.firstPageLabel = 'Primera página';
          this.lastPageLabel = 'Última página';
    }

    override getRangeLabel = (page: number, pageSize: number, length: number): string => {    // Cambiar el formato del rango
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
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css'],
  providers: [{ provide: MatPaginatorIntl, useClass: CustomMatPaginatorIntl }]
})

export class PerfilComponent  implements AfterViewInit, OnInit{
  @ViewChild('paginacionPerfil') paginacionPerfil: MatPaginator;

  dataSourcePerfil = new MatTableDataSource <AllPerfiles> ([]);
  displayedColumnsPerfil: string[] = ['Perfil', 'Acciones'];   //  Nombre de las matColumnDef del Perfil
  filtroPerfil: string = '';
  perfil: any;
  perfilSubscription: Subscription;
  listaDatos: AllPerfiles[] = [];

  constructor (
    private _perfilesService: PerfilesService,
    private dialog: MatDialog
  ){}

  ngOnInit(): void {
    this.muestraPerfiles();
    this.autoPerfiles();
  }

  ngAfterViewInit() {
    this.dataSourcePerfil.paginator = this.paginacionPerfil;
    this.dataSourcePerfil.filterPredicate = this.customFilterPredicate();
  }

  autoPerfiles(){   // Observable - Subscribe (automaticamente carga los cambios)
  this._perfilesService.perfilActualizado$.subscribe(() => {
      this.muestraPerfiles();
      });
  }

  dialogAgregarPerfil(altaPerfil:any): void {    //Dialog AgregarSistema
    const modRegistrar = this.dialog.open (DialogRegistrarPerfilComponent, {
      width: '380px',
      data: altaPerfil,
      disableClose: true,
    });
    modRegistrar.afterClosed().subscribe((result) => {
      if (result === '') {
        this.muestraPerfiles();
      }
    });
  }

/********************************    METODOS PARA MENU (PERFIL - MIS PERFILES)  ********************************/
muestraPerfiles() {
  this._perfilesService.detallesTablaPerfiles().subscribe(
    (data: any) => {
      if (data.listaDatos) {
        this.listaDatos = JSON.parse(data.listaDatos);
        this.listaDatos.reverse();

        console.log('Lista de Perfiles', this.listaDatos);
        this.dataSourcePerfil.data = this.listaDatos;
      }
    },
    (error) => {
      console.error('Error obteniendo perfiles:', error);
    }
  );
}

  actualizarFiltro() {        // Filtra en toda la tabla sensible a MAY y MIN. *- LOWERCASE -- MINUSCULAS -*
    const filtroPerfilLowerCase = this.filtroPerfil.toLowerCase();
    this.dataSourcePerfil.filter = filtroPerfilLowerCase;
  }

  private customFilterPredicate() {     //Solo aplica al filtro a la columna de Perfil
    return (data: AllPerfiles, filter: string) => {
      const perfilLowerCase = data.perfil.toLowerCase();
        return perfilLowerCase.includes(filter);        // Aplica el filtro a la columna (Perfil)
    };
  }

/********************************    METODOS PARA MENU (ACCIONES - PERFIL)  ********************************/
  dialogDetallesPerfil(perfilDetalles: AllPerfiles): void {     //Dialog Detalles de Perfiles
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '500px';
    dialogConfig.maxHeight = '80vh';
    dialogConfig.data = perfilDetalles;
    dialogConfig.disableClose = false;

    const modDetalle = this.dialog.open(DialogDetallesPerfilComponent, dialogConfig);
    modDetalle.afterClosed().subscribe((result) => {
      if (result === '') {
        this.muestraPerfiles();
      }
    });
  }

  dialogVinculaPerfilSistema(perfilVPS:any): void {        //Dialog Vincular Perfil del Sistema
    const modVinculaPS = this.dialog.open(DialogPerfilVincularSistemaComponent, {
      data: perfilVPS,
      disableClose: true,
    });
    modVinculaPS.afterClosed().subscribe((result) => {
      if (result === '') {
        this.muestraPerfiles();
      }
    })
  }

  dialogDesvinculaPerfilSistema(perfilDPS:any): void {       //Dialog Desvincular Perfil del Sistema
    const modDesvinculaPS = this.dialog.open(DialogPerfilDesvincularSistemaComponent, {
      data: perfilDPS,
      disableClose: true,
    });
    modDesvinculaPS.afterClosed().subscribe((result) => {
      if (result === '') {
        this.muestraPerfiles();
      }
    })
  }

  dialogVinculaPerfilSistemaVistas(perfilVSV: any): void {        //Dialog Vincula Perfil a Sistema-Vistas
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '700px';
    dialogConfig.maxHeight = '80vh';
    dialogConfig.data = perfilVSV;
    dialogConfig.disableClose = true;

    const modVinculaPSV = this.dialog.open(DialogPerfilVinculaVistasComponent, dialogConfig);
    modVinculaPSV.afterClosed().subscribe((result) => {
      if (result === '') {
        this.muestraPerfiles();
      }
    })
  }

  dialogDesvinculaPerfilSistemaVistas(perfilDSV: any): void {       //Dialog Desvincula Perfil a Sistema-Vistas
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '700px';
    dialogConfig.maxHeight = '80vh';
    dialogConfig.data = perfilDSV;
    dialogConfig.disableClose = true;

    const modDesvinculaPSV = this.dialog.open(DialogPerfilDesvinculaVistasComponent, dialogConfig)
    modDesvinculaPSV.afterClosed().subscribe((result) => {
      if (result === '') {
        this.muestraPerfiles();
      }
    })
  }

  dialogDetallesPerfilSistemaVistas(perfilDP:any): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = perfilDP;
    dialogConfig.disableClose = false;

    const modDetallesPSV = this.dialog.open(DialogDetallesPerfilSistemaVistasComponent, dialogConfig)
    modDetallesPSV.afterClosed().subscribe((result) => {
      if (result === '') {
        this.muestraPerfiles();
      }
    })
  }
}
