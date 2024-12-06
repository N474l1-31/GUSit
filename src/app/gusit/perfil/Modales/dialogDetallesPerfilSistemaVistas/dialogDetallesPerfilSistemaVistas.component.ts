import { Component, OnInit,Inject, Injectable, ViewChild} from '@angular/core';
import { MAT_DIALOG_DATA} from '@angular/material/dialog';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';

import { PerfilesService } from '../../Service/Perfiles.service';
import { SistemasService } from 'src/app/gusit/sistemas/Service/Sistemas.service';

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
  selector: 'app-dialogDetallesPerfilSistemaVistas',
  templateUrl: './dialogDetallesPerfilSistemaVistas.component.html',
  styleUrls: ['./dialogDetallesPerfilSistemaVistas.component.css'],
  providers: [{ provide: MatPaginatorIntl, useClass: CustomMatPaginatorIntl }]
})

export class DialogDetallesPerfilSistemaVistasComponent implements OnInit {
  @ViewChild('paginacionDetalles') paginacionDetalles: MatPaginator;

  displayedColumnsDetalles: string[] = ['Vista', 'Status'];
  dataSourceDetalles: MatTableDataSource<any> = new MatTableDataSource <any> ();     // Inicializa vistas como MatTableDataSource
  sistemasActivosVinculados: any [] = [];
  selectedSistema : string;

  constructor(
    public _sistemasService: SistemasService,
    public _perfilService: PerfilesService,
    @Inject (MAT_DIALOG_DATA) public detallesPerfilSistemaVistas: any) { }

  ngOnInit() {
    this.mostrarSistemasVinculados();
  }

  ngAfterViewInit() {
    this.dataSourceDetalles.paginator = this.paginacionDetalles;
  }

  mostrarSistemasVinculados (){
    this._perfilService.perfilSistemasVinculados(this.detallesPerfilSistemaVistas.perfil).subscribe(
    (data: any) => {
      if (data.DtT) {
        this.sistemasActivosVinculados = data.DtT;
        console.log('Detalles de todos los Sistemas con ese Perfil',this.sistemasActivosVinculados);
      } else {
        console.error('La propiedad DtT en la respuesta está vacía o indefinida.');
      }
    },
    (error) => {
      console.error('Error Obteniendo Sistemas:', error);
    }
  );
  }

  buscarVistas() {
    if (!this.selectedSistema) {      // Aquí puedes mostrar una alerta
      Swal.fire({ icon: "warning", title: "Debes seleccionar un Sistema para mostrar Resultados!",});
      return;
    }
    this.mostrarVistas(this.selectedSistema, this.detallesPerfilSistemaVistas.perfil);
  }

  mostrarVistas(sistema: string, perfil: string) {
    this._perfilService.obtenerVistasPorSistemaPerfiles(sistema, perfil).subscribe(
      (respuesta) => {
        this.dataSourceDetalles.data = []; // Limpiar datos anteriores
        if (respuesta.DtT.length > 0) {      // Si hay datos en DtT, llenar la tabla
          this.dataSourceDetalles.data = respuesta.DtT; // Aquí es donde actualizas los datos
          console.log('Vistas Vinculados', respuesta);
        } else {          // Si DtT está vacío, mostrar una alerta
          console.log(respuesta.mensaje); // Para ver el mensaje en la consola, opcional
          Swal.fire({
            // title: 'No se pueden VINCULAR Vistas a Sistemas OFF.',
            text: 'El Sistema Seleccionado NO cuenta con Vistas Vinculadas! ',
            icon: 'error',
            iconColor: '#E43F31',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: "#3085d6"
          });
        }
      },
      (error) => {
        console.error(error);
      }
    );
  }

}
