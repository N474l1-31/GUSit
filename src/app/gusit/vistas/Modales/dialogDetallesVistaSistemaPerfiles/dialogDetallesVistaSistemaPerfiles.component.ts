import { Component, OnInit,Inject, Injectable, ViewChild, AfterViewInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';

import { PerfilesService } from 'src/app/gusit/perfil/Service/Perfiles.service';
import { SistemasService } from 'src/app/gusit/sistemas/Service/Sistemas.service';
import { VistasService } from '../../Service/Vistas.service';


@Injectable()
export class CustomMatPaginatorIntl extends MatPaginatorIntl {    //Cambiar el idioma de las etiquetas
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
  selector: 'app-dialogDetallesVistaSistemaPerfiles',
  templateUrl: './dialogDetallesVistaSistemaPerfiles.component.html',
  styleUrls: ['./dialogDetallesVistaSistemaPerfiles.component.css'],
  providers: [{ provide: MatPaginatorIntl, useClass: CustomMatPaginatorIntl }]
})

export class DialogDetallesVistaSistemaPerfilesComponent implements OnInit, AfterViewInit {
  @ViewChild('paginacionDetalles') paginacionDetalles: MatPaginator;

  displayedColumnsDetalles: string[] = ['Perfil', 'Status'];
  dataSourceDetalles: MatTableDataSource<any> = new MatTableDataSource <any> ();      // Inicializa vistas como MatTableDataSource
  sistemasActivosVinculados: any [] = [];
  selectedSistema: string;


  constructor(
    public _sistemasService: SistemasService,
    public _perfilService: PerfilesService,
    public _vistaService: VistasService,
    public dialogDetallesVistaSistemaPerfil: MatDialogRef <DialogDetallesVistaSistemaPerfilesComponent>,
    @Inject (MAT_DIALOG_DATA) public detallesVistaSistemaPerfiles: any) { }

  ngOnInit() {
    const nombreVista = this.detallesVistaSistemaPerfiles.vista;
    this.mostrarSistemasVinculados(nombreVista);
    console.log ('Vista Seleccionada', nombreVista)
  }


  ngAfterViewInit() {
    this.dataSourceDetalles.paginator = this.paginacionDetalles;
  }

  mostrarSistemasVinculados(vistaSeleccionada: string) {
    this._vistaService.detallesVistaSistemaPerfil(vistaSeleccionada).subscribe(
      (response: any) => {
        if (response.listaDatos !== null) {
          const data = JSON.parse(response.listaDatos);
          if (data.length > 0) {
            const sistemasActivos = data.filter((sistema: any) => sistema.statuss === 'Activo');
            if (sistemasActivos.length > 0) {
              console.log('Sistemas Activos:', sistemasActivos);
              this.sistemasActivosVinculados = sistemasActivos; // Asignar los sistemas activos a la variable
            }
          }
        } else {
          console.log('La respuesta no contiene datos.');
          Swal.fire({
            icon: 'warning',
            title: 'Advertencia!',
            text: 'La Vista no tiene Sistemas Vinculados.'
          })
        }
      },
      (error) => {
        console.error('Error al obtener sistemas vinculados:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un error al obtener los sistemas vinculados.'
        });
      }
    );
  }

  buscarPerfiles(){
    if (!this.selectedSistema) {      // Aquí puedes mostrar una alerta o mensaje indicando que se debe seleccionar un sistema
      Swal.fire({ icon: "warning", title: "Debes seleccionar un Sistema para mostrar Resultados!",});
      return;
    }
    this.mostrarPerfiles(this.selectedSistema, this.detallesVistaSistemaPerfiles.vista);
  }

  mostrarPerfiles(sistema: string, vista: string){
    this._perfilService.obtenerPerfilPorSistemaVistas(sistema, vista).subscribe(
      (data) => {
        this.dataSourceDetalles.data = [];
        if (data.DtT.length > 0) {      // Si hay datos en DtT, llenar la tabla
          this.dataSourceDetalles.data = data.DtT;
          console.log('Perfiles Vinculados', data);
        } else {          // Si DtT está vacío, mostrar una alerta
          console.log(data.mensaje); // Para ver el mensaje en la consola, opcional
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "El Sistema Seleccionado no cuenta con Perfiles Vinculados!",
          });
        }
  }, (error) => {
        console.error(error);
      }
    );
  }
}
