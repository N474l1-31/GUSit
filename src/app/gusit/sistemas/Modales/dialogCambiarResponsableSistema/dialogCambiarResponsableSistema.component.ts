import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';

import { SistemasService } from '../../Service/Sistemas.service';
import { UsuarioService } from 'src/app/gusit/usuario/Service/Usuario.service';

@Component({
  selector: 'app-dialogCambiarResponsableSistema',
  templateUrl: './dialogCambiarResponsableSistema.component.html',
  styleUrls: ['./dialogCambiarResponsableSistema.component.css']
})
export class DialogCambiarResponsableSistemaComponent implements OnInit {
  cambiarResponsableForm: FormGroup;
  usuariosData: any[] = [];

  constructor(
    private formCambiarResponsable: FormBuilder,
    public _sistemasService: SistemasService,
    public _usuariosService: UsuarioService,
    public dialogCambiarResponsable: MatDialogRef<DialogCambiarResponsableSistemaComponent>,
    @Inject(MAT_DIALOG_DATA) public responsable: any
  ) { }

  ngOnInit() {
    this.crearFormularioCambiarResponsable();
    this.mostrarUsuarios();
    this.cambiarResponsableForm.patchValue({
      sistema: this.responsable.nombre // Asignar directamente el valor del sistema
    });
  }

  crearFormularioCambiarResponsable() {
    this.cambiarResponsableForm = this.formCambiarResponsable.group({
      sistema: [''],
      usuario: ['', Validators.required]
    });
  }

  mostrarUsuarios() {
    this._usuariosService.catalogoUsuarios().subscribe(data => {
      this.usuariosData = JSON.parse(data.listaDatos);
      console.log('Usuarios recuperados:', this.usuariosData); // Agregar esta línea
    });
  }

  cambiaResponsable() {
    if (this.cambiarResponsableForm.valid) {
        const formResponsable = {
            sistema: this.cambiarResponsableForm.value.sistema,
            usuario: this.cambiarResponsableForm.value.usuario.usuario
        };
        console.log('Cambios Realizados', formResponsable);
        this._sistemasService.cambiarResponsable(formResponsable.sistema, formResponsable.usuario).subscribe(
            (respuesta) => {
                switch (respuesta) {
                    case 'ok':
                        console.log('Cambio de Responsable Exitoso:', respuesta);
                        Swal.fire('Cambio de Responsable', '¡EXITOSO!', 'success');
                        this._sistemasService.actualizarTablaSistemas();
                        this.dialogCambiarResponsable.close();
                        break;

                    case 'El usuario no inexiste en los catalogos':
                        console.log('El usuario no existe o estatus inactivo :', respuesta);
                        Swal.fire('El Usuario no existe o se encuentra inactivo', '', 'error');
                        this._sistemasService.actualizarTablaSistemas();
                        this.dialogCambiarResponsable.close();
                        break;

                    case 'El sistema no existe en los catalogos':
                        console.log('El sistema no existe o estatus inactivo :', respuesta);
                        Swal.fire('El Sistema no existe o se encuentra Inactivo o Eliminado', '', 'error');
                        this._sistemasService.actualizarTablaSistemas();
                        this.dialogCambiarResponsable.close();
                        break;

                    case 'Sistema o perfil inexistente en los catalogos':
                        console.log('Sistema o perfil inexistente en los catalogos :', respuesta);
                        Swal.fire('Sistema o perfil inexistente en los catalogos', '', 'error');
                        this._sistemasService.actualizarTablaSistemas();
                        this.dialogCambiarResponsable.close();
                        break;

                    default:
                        console.log('Respuesta no reconocida:', respuesta);
                        Swal.fire('Error desconocido', '', 'error');
                        this._sistemasService.actualizarTablaSistemas();
                        this.dialogCambiarResponsable.close();
                        break;
                }
            },
            (error) => {
                console.error('Error al cambiar el perfil:', error);
            }
        );
    }
}

  cerrarDialog(): void {
    this.dialogCambiarResponsable.close();
  }
}
