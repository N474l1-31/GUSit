import { Component, OnInit,Inject, Injectable, ViewChild} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';

import { PerfilesService } from 'src/app/gusit/perfil/Service/Perfiles.service';
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
  selector: 'app-dialogDetallesSistemaPerfilVistaControles',
  templateUrl: './dialogDetallesSistemaPerfilVistaControles.component.html',
  styleUrls: ['./dialogDetallesSistemaPerfilVistaControles.component.css'],
  providers: [{ provide: MatPaginatorIntl, useClass: CustomMatPaginatorIntl }]
})
export class DialogDetallesSistemaPerfilVistaControlesComponent implements OnInit {
  @ViewChild('paginacionDetalles') paginacionDetalles: MatPaginator;

  displayedColumnsDetalles: string[] = ['Control', 'Status'];
  dataSourceDetalles: MatTableDataSource<any> = new MatTableDataSource <any> ();

  perfilesActivosVinculados: any [] = [];     // Se llena con los PerfilesActivos vinculados
  selectedPerfil: string;

  vistasActivasVinculadas: any [] = [];
  selectedVista: string;

  controles: any [] = [];
  sistemaSeleccionado: string = '';

  constructor(
    public _sistemasService: SistemasService,
    public _perfilService: PerfilesService,
    public dialogDetallesSistemaPVC: MatDialogRef <DialogDetallesSistemaPerfilVistaControlesComponent>,
    @Inject (MAT_DIALOG_DATA) public detallesSistemaPVC: any) { }

  ngOnInit() {
    this.sistemaSeleccionado = this.detallesSistemaPVC.nombre;      // Asumiendo que el nombre del sistema viene desde el modal.
    this.cargarPerfiles(this.sistemaSeleccionado);      // Cargar los perfiles vinculados a ese sistema

    if (this.selectedPerfil) {
      this.cargarVistas(this.sistemaSeleccionado, this.selectedPerfil);
    }
  }

  ngAfterViewInit() {
    this.dataSourceDetalles.paginator = this.paginacionDetalles;
  }

  cargarPerfiles(sistema: string): void {     // Cargar perfiles vinculados al sistema
  this._sistemasService.perfilesPorSistema(sistema).subscribe({
    next: (res) => {
      console.log('PerfilesVinculados:', res);
      if (res && res.listaDatos) {
        try {
          const perfiles = JSON.parse(res.listaDatos);
          this.perfilesActivosVinculados = perfiles.filter((perfil: any) => perfil.statuss?.toLowerCase() === 'activo');
          console.log('Perfiles Activos:', this.perfilesActivosVinculados);
        } catch (error) {
          console.error('Error al parsear listaDatos:', error);
          this.perfilesActivosVinculados = [];
        }
      } else {
        console.warn('Respuesta inválida o vacía');
        this.perfilesActivosVinculados = [];
      }
    },
    error: (err) => {
      console.error('Error al obtener los perfiles:', err);
    },
  });
  }

  cargarVistas(sistema: string, perfil: string): void {     // Cargar vistas vinculadas al seleccionar perfil
  console.log('Cargando vistas para:', { sistema, perfil });
  this._perfilService.obtenerVistasPorSistemaPerfiles(sistema, perfil).subscribe({
    next: (res) => {
      console.log('Respuesta de vistas:', res); // <-- Muestra toda la respuesta para verificar
      if (res && res.DtT) {
        // Asignar directamente si DtT es un arreglo
        this.vistasActivasVinculadas = res.DtT.filter((vista: any) => vista.statuss?.toLowerCase() === 'activo');
        console.log('Vistas activas vinculadas:', this.vistasActivasVinculadas);
      } else {
        console.warn('Respuesta inválida o vacía para vistas');
        this.vistasActivasVinculadas = [];
      }
    },
    error: (err) => {
      console.error('Error al obtener las vistas:', err);
    },
  });
  }

  cargarControles(sistema: string, perfil: string, vista: string): void {     // Cargar controles vinculados al seleccionar vista
  console.log('Sistema:', sistema); // Imprime el valor de sistema
  console.log('Perfil:', perfil);   // Imprime el valor de perfil
  console.log('Vista:', vista);     // Imprime el valor de vista

  this._sistemasService.obtenerControlesPorSistemaPerfilVista(sistema, perfil, vista).subscribe({
    next: (res) => {
      console.log('Respuesta del API:', res);

      if (res && res.DtT) {
        this.controles = res.DtT; // Asigna los datos de la respuesta
        this.dataSourceDetalles.data = this.controles; // Actualiza la tabla
      } else {
        console.warn('No se encontraron controles.');
        this.controles = [];
        this.dataSourceDetalles.data = [];
      }
    },
    error: (err) => {
      console.error('Error al cargar controles:', err);
    },
  });
  }

}
