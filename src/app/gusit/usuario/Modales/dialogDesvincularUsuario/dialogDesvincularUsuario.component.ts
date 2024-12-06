import { Component, OnInit, Inject, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';

import { SistemasService } from 'src/app/gusit/sistemas/Service/Sistemas.service';
import { UsuarioService } from '../../Service/Usuario.service';

@Component({
  selector: 'app-dialogDesvincularUsuario',
  templateUrl: './dialogDesvincularUsuario.component.html',
  styleUrls: ['./dialogDesvincularUsuario.component.css']
})
export class DialogDesvincularUsuarioComponent implements OnInit {
  actualizacionTabla: EventEmitter<void> = new EventEmitter<void>();
  desvincularUsuarioForm: FormGroup;

  constructor(
    private formDesvinculaUsuario: FormBuilder,
    public _sistemasService: SistemasService,
    public _usuariosService: UsuarioService,
    public dialogDesvincularUsuario: MatDialogRef<DialogDesvincularUsuarioComponent>,
    @Inject(MAT_DIALOG_DATA) public usuarioDesvincular: any) { }


  ngOnInit() {
    if (this.usuarioDesvincular && this.usuarioDesvincular.usuario) {
      console.log("Datos recibidos:", this.usuarioDesvincular);
      this.crearFormularioDesvincularUsuario();
      console.log("Formulario", this.desvincularUsuarioForm.value);
    } else {
      console.error("Los datos del usuario no están definidos o son inválidos.");
      this.dialogDesvincularUsuario.close();
    }
  }

  crearFormularioDesvincularUsuario(): void {
    this.desvincularUsuarioForm = this.formDesvinculaUsuario.group({
      usuario: [this.usuarioDesvincular.usuario, Validators.required],
      sistema: [this.usuarioDesvincular.Sistema, Validators.required],
      perfil: [this.usuarioDesvincular.perfil, Validators.required],
    });
  }

  desvincularUsuario() {
    if (this.desvincularUsuarioForm.valid) {
      const formDesvinculacion = this.desvincularUsuarioForm.value;
      Swal.fire({
        title: '¿Desea Realizar Desvinculación?',
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#C82333",
      }).then((result) => {
        if (result.isConfirmed) {
          switch (result.value) {
            case true:
              this._usuariosService.desvincularUsuarioSP(formDesvinculacion.usuario, formDesvinculacion.sistema, formDesvinculacion.perfil)
                .subscribe(
                  (respuesta) => {
                    switch (respuesta) {
                      case 'ok':
                        Swal.fire('El usuario se ha desvinculado exitosamente.', '¡EXITOSAMENTE¡', 'success');
                        this.actualizacionTabla.emit();
                        this.dialogDesvincularUsuario.close();
                        break;
                      case 'El Usuario ya esta desvinculado':
                        Swal.fire('El usuario ya se encuentra Desvinculado de Sistema-Perfil', '', 'warning');
                        this.actualizacionTabla.emit();
                        this.dialogDesvincularUsuario.close();
                        break;
                      default:
                        Swal.fire('RESPUESTA API G-USIT', respuesta, 'info');
                        this.actualizacionTabla.emit();
                        this.dialogDesvincularUsuario.close();
                    }
                  },
                  (error) => {
                    console.error('Error al obtener la respuesta de la API:', error);
                  }
                );
              break;
            default:
              break;
          }
        }
      });
    }
  }

  cerrarDialog(): void {
    this.dialogDesvincularUsuario.close();
  }
}
