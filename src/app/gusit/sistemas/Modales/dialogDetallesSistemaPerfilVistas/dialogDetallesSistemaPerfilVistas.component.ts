import { Component, OnInit,Inject, Injectable, ViewChild, AfterViewInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
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
  selector: 'app-dialogDetallesSistemaPerfilVistas',
  templateUrl: './dialogDetallesSistemaPerfilVistas.component.html',
  styleUrls: ['./dialogDetallesSistemaPerfilVistas.component.css'],
  providers: [{ provide: MatPaginatorIntl, useClass: CustomMatPaginatorIntl }]
})


export class DialogDetallesSistemaPerfilVistasComponent implements OnInit, AfterViewInit {
  @ViewChild('paginacionDetalles') paginacionDetalles: MatPaginator;


  displayedColumnsDetalles: string[] = ['Vista', 'Status'];
  dataSourceDetalles: MatTableDataSource<any> = new MatTableDataSource <any> ();      // Inicializa vistas como MatTableDataSource
  perfilesActivosVinculados: any [] = [];
  selectedPerfil: string;

  constructor (
    public _sistemasService: SistemasService,
    public dialogDetallesSistemaPerfilVistas: MatDialogRef <DialogDetallesSistemaPerfilVistasComponent>,
    @Inject (MAT_DIALOG_DATA) public detallesVistaSistemaPerfiles: any) { }

  ngOnInit() {
    // const nombreVista = this.dialogDetallesSistemaPerfilVistas.vista;
    // this.mostrarPerfilesVinculados(nombreVista);
    // console.log ('Vista Seleccionada', nombreVista)
  }

  ngAfterViewInit() {
    this.dataSourceDetalles.paginator = this.paginacionDetalles;
  }

  mostrarPerfilesVinculados(nombreSistema) {
    // this._sistemasService.perfilesPorSistemas(nombreSistema).subscribe(
    //   (data: any) => {
    //     if (data.DtT){
    //       this.perfiles = data.DtT.map ((perfil:any) => perfil.perfil);
    //     } else {
    //       console.error('La propiedad DtT en la respuesta está vacía o indefinida.');
    //     }
    //   },
    //   (error) => {
    //     console.error('Error Obteniendo Perfiles:', error);
    //   }
    // )
  }

  buscarVistas() {

  }

  mostrarVistas() {

  }
}
