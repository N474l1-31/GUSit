import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, AbstractControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';

import { VistasService } from '../../Service/Vistas.service';

@Component({
  selector: 'app-dialogRegistrarVista',
  templateUrl: './dialogRegistrarVista.component.html',
  styleUrls: ['./dialogRegistrarVista.component.css']
})
export class DialogRegistrarVistaComponent implements OnInit {
  altaVistaForm: FormGroup;

  constructor(
    private formVista: FormBuilder,
    private _vistasService: VistasService,
    public dialogRegistrarVista: MatDialogRef<DialogRegistrarVistaComponent>
  ) {}

  ngOnInit() {
    this.crearFormularioAltaVista();
  }

  crearFormularioAltaVista() {
    this.altaVistaForm = this.formVista.group({
      lstComponentes: ['', [Validators.required, this.validarVista]]
    });
  }

  crearVista(): void {
    if (this.altaVistaForm.valid) {
      const vista = this.altaVistaForm.value.lstComponentes.trim(); // Obtener el nombre de la vista sin espacios adicionales
      console.log('FORMULARIO ALTA VISTA enviado al Servidor:', vista);

      Swal.fire({
        title: '¿Desea Registrar un Nueva Vista?',
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#C82333",
      }).then((result) => {
        if (result.isConfirmed) {
          this._vistasService.addVista([vista]).subscribe(
            (respuesta) => {
              if (respuesta === 'ok') {
                console.log('Vista Registrada Correctamente:', respuesta);
                Swal.fire('Vista Registrada Exitosamente!', '', 'success');
                this.altaVistaForm.reset();
                this._vistasService.actualizarTablaVistas();
                this.dialogRegistrarVista.close();
              } else if (respuesta === "Vistas ya existente") {
                console.log('Error: Vista(s) ya existe:', respuesta);
                Swal.fire('Ya se encuentra una Vista registrada con ese nombre.', '', 'warning');
                this.dialogRegistrarVista.close();
              } else {
                console.error('Error desconocido en la solicitud:', respuesta);
                Swal.fire('Error desconocido en la solicitud: ' + respuesta, 'error');
                this.dialogRegistrarVista.close();
              }
            },
            (error) => {
              console.error('Error en la solicitud:', error);
              console.log('Respuesta del servidor:', error.error);
              Swal.fire('Error en la solicitud', 'error');
            }
          );
        }
      });
    }
  }


  convertirNombreVista() {
    const nombreVistaControl = this.altaVistaForm.get('lstComponentes');
    let nombreVista = this.altaVistaForm.value.lstComponentes.trim();
    // Convertir la primera letra de cada palabra a mayúscula y la letra después del '_' a mayúscula
    nombreVista = nombreVista.replace(/\b\w/g, firstChar => firstChar.toUpperCase()); // Primera letra de cada palabra a mayúscula
    nombreVista = nombreVista.replace(/_([a-z])/g, (_, letraDespuesUnderscore: string) => {
      return '_' + letraDespuesUnderscore.toUpperCase(); // Letra después de '_' a mayúscula
    });

    // Actualiza el valor en la vista, reflejando el cambio en el input
    nombreVistaControl.setValue(nombreVista, { emitEvent: false }); // Evitar loop infinito
  }

  validarVista(control: AbstractControl): { [key: string]: boolean } | null {
    const nombreVista = control.value;
    const formatoValido = /^([a-zA-Z0-9]+(?:_[a-zA-Z0-9]+)*)(?:, *([a-zA-Z0-9]+(?:_[a-zA-Z0-9]+)*))*$/.test(nombreVista);
    return formatoValido ? null : { formatoInvalido: true };
  }

  cerrarDialog(): void {
    this.dialogRegistrarVista.close();
  }
}
