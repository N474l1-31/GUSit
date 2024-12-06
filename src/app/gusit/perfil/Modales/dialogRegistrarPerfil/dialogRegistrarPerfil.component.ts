import { Component, OnInit} from '@angular/core';
import { FormBuilder, Validators, FormGroup, AbstractControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import  Swal  from 'sweetalert2';

import { PerfilesService } from '../../Service/Perfiles.service';

@Component({
  selector: 'app-dialogRegistrarPerfil',
  templateUrl: './dialogRegistrarPerfil.component.html',
  styleUrls: ['./dialogRegistrarPerfil.component.css']
})
export class DialogRegistrarPerfilComponent implements OnInit {
  perfilForm: FormGroup;

  constructor(
    private formPerfil: FormBuilder,
    private _perfilService: PerfilesService,
    public dialogRegistrarPerfil: MatDialogRef <DialogRegistrarPerfilComponent>) { }

  ngOnInit() {
    this.crearFormularioAltaPerfil();
  }

  crearFormularioAltaPerfil(){          //Formulario Dinamico
    this.perfilForm = this.formPerfil.group ({
      perfil: this.formPerfil.control ('', [Validators.required, this.validarPerfil]),
    });
  }

  crearPerfil(){
  if (this.perfilForm.valid) {
    const altaPerfil = this.perfilForm.value;
    console.log('FORMULARIO ALTA PERFIL enviado al Servidor::', altaPerfil);

    Swal.fire({
      title: '¿Desea Registrar un Nuevo Perfil?',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#C82333",
    }).then((result) => {
      if (result.isConfirmed) {
        this._perfilService.addPerfil(altaPerfil).subscribe(
          (respuesta: string ) => {
            switch (respuesta) {
              case 'ok':
                console.log('Perfil Registrado Correctamente:', respuesta);
                Swal.fire('Perfil Registrado Exitosamente!', '', 'success');
                this.perfilForm.reset(); // Restablecer solo después de una operación exitosa
                this._perfilService.actualizarTablaPerfiles();
                this.dialogRegistrarPerfil.close();
                break;

              default:
                if (respuesta.startsWith("El perfil ya existente")) {  //Si la respuesta comienza con 'No se insertó el sistema', muestra un mensaje de error específico indicando que el sistema ya existe.
                  console.log('Error: El perfil ya existe:', respuesta);
                  Swal.fire('El Perfil ya existe', '','error');
                } else {
                  console.error('Error desconocido en la solicitud:', respuesta);
                  Swal.fire('Error desconocido en la solicitud: ' + respuesta, 'error');
                }
                this._perfilService.actualizarTablaPerfiles();
                this.dialogRegistrarPerfil.close();
                break;
            }
          }
        );
      }
    });
  }
}

  validarPerfil(control: AbstractControl): { [key: string]: boolean } | null {
    let nombrePerfil = control.value;
    if (!nombrePerfil || nombrePerfil.trim() === '') {        // Si el perfil está vacío, retornar null (indicando que es válido)
      return null;
    }
    nombrePerfil = nombrePerfil.charAt(0).toUpperCase() + nombrePerfil.slice(1).toLowerCase();      // Convertir la primera letra a mayúscula y el resto a minúscula
    const formatoCorrecto = /^[a-zA-ZÁÉÍÓÚÑáéíóúñ\s]*$/.test(nombrePerfil);
    if (!formatoCorrecto) {
      return { 'nombrePerfilInvalido': true };
    }
    if (nombrePerfil !== control.value) {     // Si el perfil fue modificado, actualizar el valor del control
      control.setValue(nombrePerfil);
    }
    return null;
  }

  cerrarDialog(): void {
    this.dialogRegistrarPerfil.close();
  }
}
