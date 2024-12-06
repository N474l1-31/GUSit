import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Validators, FormBuilder, FormGroup, } from '@angular/forms';
import Swal from 'sweetalert2';

import { AllSistemas } from 'src/app/gusit/sistemas/Interface/allSistemas';
import { UsuarioService } from '../../Service/Usuario.service';
import { SistemasService } from 'src/app/gusit/sistemas/Service/Sistemas.service';

@Component({
  selector: 'app-dialogCambiarPerfil',
  templateUrl: './dialogCambiarPerfil.component.html',
  styleUrls: ['./dialogCambiarPerfil.component.css']
})
export class DialogCambiarPerfilComponent implements OnInit {
  cambiarPerfilForm: FormGroup;
  DtT: AllSistemas[] = [];
  sistemasActivos: any[];
  selectedPerfil: string = '';
  perfilesActivosVinculados: any[] = [];

  constructor(
    private formCambiarPerfil: FormBuilder,
    public _usuarioService: UsuarioService,
    public _sistemasService: SistemasService,
    public dialogCambiarPerfil: MatDialogRef<DialogCambiarPerfilComponent>,
    @Inject(MAT_DIALOG_DATA) public cambiarPerfilUsuario: any) {}

  ngOnInit() {
    this.crearFormularioCambiarPerfil();
    this.mostrarPerfilesPorSistema(this.cambiarPerfilUsuario.Sistema);
  }

  crearFormularioCambiarPerfil() {
    this.cambiarPerfilForm = this.formCambiarPerfil.group({
      sistema: [this.cambiarPerfilUsuario.Sistema],
      usuario: [this.cambiarPerfilUsuario.usuario],
      perfil: [this.cambiarPerfilUsuario.perfil, [Validators.required]],
    });
  }

  mostrarPerfilesPorSistema(nombreSistema: string) {
    this._sistemasService.perfilesPorSistemas(nombreSistema).subscribe(
      (data: any) => {
        if (data.DtT) {
          this.perfilesActivosVinculados = data.DtT.map((perfil: any) => perfil.perfil);
          console.log ('PerfilesVinculados al Sistema', this.perfilesActivosVinculados)
        } else {
          console.error(
            'La propiedad DtT en la respuesta está vacía o indefinida.'
          );
        }
      },
    );
  }

  cambiarPerfil() {
    if (this.cambiarPerfilForm.invalid) {
      return;
    }
    const { usuario, sistema, perfil } = this.cambiarPerfilForm.value;
    console.log('Cambios Realizados', {usuario, sistema, perfil});

    this._usuarioService.cambiarPerfil(usuario, sistema, perfil).subscribe(
      (respuesta) => {
        if (respuesta === 'ok') {
          console.log('Perfil cambiado exitosamente:', respuesta);
          Swal.fire('Usuario Actualizado', '¡EXITOSAMENTE!', 'success');
          this._usuarioService.actualizarTablaUsuarios();
          this.dialogCambiarPerfil.close();

        } else if (respuesta === 'Sin Datos.') {
          console.log('Sin Datos:', respuesta);
          Swal.fire('Error en la respuesta de la Api', '', 'error');
        }
      },
      (error) => {
        console.error('Error al cambiar el perfil:', error);
      }
    );
  }

  cerrarDialog(): void {
    this.dialogCambiarPerfil.close();
  }
}
