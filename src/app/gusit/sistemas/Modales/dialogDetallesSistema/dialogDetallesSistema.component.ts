import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { AllSistemas } from '../../Interface/allSistemas';
import { SistemasService } from '../../Service/Sistemas.service';

@Component({
  selector: 'app-dialogDetallesSistema',
  templateUrl: './dialogDetallesSistema.component.html',
  styleUrls: ['./dialogDetallesSistema.component.css']
})
export class DialogDetallesSistemaComponent implements OnInit, OnDestroy {
  sistemaDetallesSubscription:  Subscription;     // Definir una variable para la suscripción
  sistemasDetalles: AllSistemas; // Variable para almacenar los detalles actualizados del sistema

  constructor(
    public _sistemaService: SistemasService,
    @Inject (MAT_DIALOG_DATA) public sistemaDetalles: AllSistemas) { }    //sistema: V. que regresa los datos de la Interfaz y es llamada en el HTML

    ngOnInit() {
      this.sistemaDetallesSubscription = this._sistemaService.sistemaDetallesActualizado$.subscribe(
        detalles  => {    // Almacenar los nuevos detalles
          this.sistemasDetalles = detalles;
          })
    }

    ngOnDestroy(): void {
      if (this.sistemaDetallesSubscription) {    // Desuscribirse del observable aquí si la suscripción existe y es válida
        this.sistemaDetallesSubscription.unsubscribe()
      }
    }
  }



