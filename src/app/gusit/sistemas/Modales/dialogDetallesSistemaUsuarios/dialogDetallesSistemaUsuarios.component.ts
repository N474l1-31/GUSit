import { Component, OnInit,Inject, Injectable, ViewChild, AfterViewInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';

import { SistemasService } from '../../Service/Sistemas.service';

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
  selector: 'app-dialogDetallesSistemaUsuarios',
  templateUrl: './dialogDetallesSistemaUsuarios.component.html',
  styleUrls: ['./dialogDetallesSistemaUsuarios.component.css'],
  providers: [{ provide: MatPaginatorIntl, useClass: CustomMatPaginatorIntl }]
})
export class DialogDetallesSistemaUsuariosComponent implements OnInit, AfterViewInit {
  @ViewChild('paginacionDetalles') paginacionDetalles: MatPaginator;
  displayedColumnsDetalles: string[] = ['Usuarios', 'Perfil', 'Status'];
  dataSourceDetalles: MatTableDataSource<any> = new MatTableDataSource <any> ();

  constructor(
    public _sistemasService: SistemasService,
    private dialogdetallesSistema: MatDialogRef<DialogDetallesSistemaUsuariosComponent>,
    @Inject (MAT_DIALOG_DATA) public detallesSistemaUsuarios: any) {}

  ngOnInit() {
    this.mostrarUsuarios();
  }

  ngAfterViewInit() {
    this.dataSourceDetalles.paginator = this.paginacionDetalles;
  }

  mostrarUsuarios() {
    const sistema = this.detallesSistemaUsuarios.nombre;
    console.log('Obteniendo Usuarios para el sistema:', sistema);
    this._sistemasService.usuariosPorSistema(sistema).subscribe(
      (respuesta: any) => {
        console.log('Respuesta del servicio:', respuesta);
        if (respuesta && respuesta.listaDatos === null) {
          console.log('Atención. La consulta no arrojó datos');
          Swal.fire({
            icon: 'warning',
            title: 'Sistema sin Usuarios',
            text: 'El sistema seleccionado no cuenta con Usuarios.'
          });
          this.dialogdetallesSistema.close();
        } else if (respuesta && respuesta.listaDatos !== null && respuesta.listaDatos !== undefined) {
          const listaDatos = JSON.parse(respuesta.listaDatos);
          console.log('listaDatos:', listaDatos);

          if (listaDatos.length > 0) {
            this.dataSourceDetalles.data = listaDatos;
            console.log('todosLosUsuarios:', this.dataSourceDetalles.data);
          } else {
            console.error('La propiedad lista Datos en la respuesta está vacía.');
            Swal.fire({icon: 'warning', title: 'Sin Usuarios', text: 'El sistema seleccionado no cuenta con Usuarios.'});
          }
        }
      },
      (error) => {
        console.error('Error Obteniendo Usuarios:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ha ocurrido un error al obtener los Usuarios del sistema.'
        });
      }
    );
  }

  cerrarDialog(): void {
    this.dialogdetallesSistema.close();
  }
}
