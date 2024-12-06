import { Component, OnInit,Inject, Injectable, ViewChild, AfterViewInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';

import { VistasService } from 'src/app/gusit/vistas/Service/Vistas.service';

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
  selector: 'app-dialogDetallesSistemaVistas',
  templateUrl: './dialogDetallesSistemaVistas.component.html',
  styleUrls: ['./dialogDetallesSistemaVistas.component.css'],
  providers: [{ provide: MatPaginatorIntl, useClass: CustomMatPaginatorIntl }]
})

export class DialogDetallesSistemaVistasComponent implements OnInit, AfterViewInit {
  @ViewChild('paginacionDetalles') paginacionDetalles: MatPaginator;
  displayedColumnsDetalles: string[] = ['Vistas', 'Status'];
  dataSourceDetalles: MatTableDataSource<any> = new MatTableDataSource <any> ();      // Inicializa vistas como MatTableDataSource

  constructor(
    public _vistasService: VistasService,
    private dialogdetallesSistema: MatDialogRef<DialogDetallesSistemaVistasComponent>,
    @Inject (MAT_DIALOG_DATA) public detallesSistemaVistas: any) { }

  ngOnInit() {
    this.mostrarVistas();
  }

  ngAfterViewInit() {
    this.dataSourceDetalles.paginator = this.paginacionDetalles;
  }

  mostrarVistas() {
    const sistema = this.detallesSistemaVistas.nombre;
    console.log('Obteniendo vistas para el sistema:', sistema);
    this._vistasService.vistasSistema(sistema).subscribe(
      (respuesta: any) => {
        console.log('Respuesta del servicio:', respuesta);
        if (respuesta && respuesta.listaDatos === null) {
          console.log('Atención. La consulta no arrojó datos');
          Swal.fire({
            icon: 'warning',
            title: 'Sistema sin Vistas',
            text: 'El sistema seleccionado no cuenta con Vistas.'
          });
          this.dialogdetallesSistema.close();
        } else if (respuesta && respuesta.listaDatos !== null && respuesta.listaDatos !== undefined) {
          const listaDatos = JSON.parse(respuesta.listaDatos);
          console.log('listaDatos:', listaDatos);

          if (listaDatos.length > 0) {
            this.dataSourceDetalles.data = listaDatos;
            console.log('todasLasVistas:', this.dataSourceDetalles.data);
          } else {
            console.error('La propiedad lista Datos en la respuesta está vacía.');
            Swal.fire({icon: 'warning', title: 'Sin Vistas', text: 'El sistema seleccionado no cuenta con vistas.'});
          }
        }
      },
      (error) => {
        console.error('Error Obteniendo Vistas:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ha ocurrido un error al obtener las vistas del sistema.'
        });
      }
    );
  }

  cerrarDialog(): void {
    this.dialogdetallesSistema.close();
  }
}
