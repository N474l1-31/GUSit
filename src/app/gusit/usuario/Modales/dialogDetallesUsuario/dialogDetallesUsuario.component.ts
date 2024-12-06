import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { AllUsuarios } from 'src/app/gusit/usuario/Interface/all-usuarios';
import { UsuarioService } from '../../Service/Usuario.service';

@Component({
  selector: 'app-dialogDetallesUsuario',
  templateUrl: './dialogDetallesUsuario.component.html',
  styleUrls: ['./dialogDetallesUsuario.component.css']
})

export class DialogDetallesUsuarioComponent implements OnInit, OnDestroy {
  usuarioDetallesSubscription:  Subscription;     // Definir una variable para la suscripción
  usuariosDetalles: AllUsuarios; // Variable para almacenar los detalles actualizados del usuario

  constructor(
    public _usuarioService: UsuarioService,
    @Inject (MAT_DIALOG_DATA) public usuarioDetalles: AllUsuarios) { }  //usuario: V. que regresa los datos de la Interfaz y es llamada en el HTML

  ngOnInit() {
    this.usuarioDetallesSubscription = this._usuarioService.usuarioDetallesActualizado$.subscribe(
      detalles  => {    // Almacenar los nuevos detalles del usuario
        this.usuariosDetalles = detalles;
        })
  }

  ngOnDestroy(): void {
    if (this.usuarioDetallesSubscription) {    // Desuscribirse del observable aquí si la suscripción existe y es válida
      this.usuarioDetallesSubscription.unsubscribe()
    }
  }
}
