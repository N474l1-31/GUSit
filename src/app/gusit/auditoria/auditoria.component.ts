import { Component, OnInit, ViewChild, AfterViewInit, Injectable } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import  Swal  from 'sweetalert2';

import { BitacorasService } from './Service/Bitacoras.service';
import { Bitacora } from './Interface/bitacora';




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
  selector: 'app-auditoria',
  templateUrl: './auditoria.component.html',
  styleUrls: ['./auditoria.component.css'],
  providers: [{ provide: MatPaginatorIntl, useClass: CustomMatPaginatorIntl }]
})
export class AuditoriaComponent {

  displayedColumnsAuditoria: string[] = ['Usuario','Sistema','Vista','Fecha']; //  Nombre de las matColumnDef del Usuario
  DtT: Bitacora[] = []; //BuscarAnalista es la Interfaz que contiene los datos que devuelve la Api
  usuarioBitacora: string = '';
  dataSourceAuditoria = new MatTableDataSource<Bitacora>([]);
  usuarioSubscription: Subscription;
  busquedaSubcription: Subscription;








}
