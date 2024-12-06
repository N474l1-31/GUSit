import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import  Swal  from 'sweetalert2';

import { PerfilesService } from '../../Service/Perfiles.service';
import { SistemasService } from 'src/app/gusit/sistemas/Service/Sistemas.service';
import { AllSistemas } from 'src/app/gusit/sistemas/Interface/allSistemas';

@Component({
  selector: 'app-dialogPerfilDesvincularSistema',
  templateUrl: './dialogPerfilDesvincularSistema.component.html',
  styleUrls: ['./dialogPerfilDesvincularSistema.component.css']
})
export class DialogPerfilDesvincularSistemaComponent implements OnInit {

  desvinculaPerfilForm:FormGroup;
  DtT: AllSistemas[] = [];  //DtT es la V. donde regresa los resultados de la API
  sistemasActivos: AllSistemas [] = [];
  sistemasActivosVinculados: any [] = [];

  constructor(
    private formPerfilDesvincula: FormBuilder,
    public _sistemasService: SistemasService,
    public _perfilService: PerfilesService,
    public dialogDesvincular: MatDialogRef <DialogPerfilDesvincularSistemaComponent>,
    @Inject (MAT_DIALOG_DATA) public perfilDesvinculado: any) { }

  ngOnInit() {
    this.crearFormularioDesvinculaPerfil();
    this.mostrarSistemasVinculados();
  }

  crearFormularioDesvinculaPerfil() {
    this.desvinculaPerfilForm = this.formPerfilDesvincula.group({
      perfil: [this.perfilDesvinculado.perfil, [Validators.required]],
      sistema: ['', [Validators.required]]
    })
  }

  desvincularPerfil() {
    if (this.desvinculaPerfilForm.valid) {
      const formVinculacion = this.desvinculaPerfilForm.value;
      console.log('FORMULARIO DESVINCULA PERFIL A SISTEMA', formVinculacion);

      Swal.fire({
        title: '¿Desea Realizar Desvinculación?',
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#C82333",
      }).then((result) => {
        if (result.isConfirmed) {
          this._perfilService.desvinculaPerfilesSistema(formVinculacion.sistema, formVinculacion.perfil)
            .subscribe(
              (respuesta) => {
                switch (respuesta) {
                  case 'ok':
                    console.log('Desvinculación Exitosa:', respuesta);
                    Swal.fire('Desvinculación Exitosa', '', 'success');
                    break;
                  case 'Perfil ya estaba desvinculado':
                    console.log('Ya se había realizado Desvinculación:', respuesta);
                    Swal.fire('Ya se había realizado Desvinculación', '', 'info');
                    break;
                  case 'Perfil inexistente':
                    console.log('No existe el Perfil', respuesta);
                    Swal.fire('No existe el Perfil', '', 'warning');
                    break;
                  case 'Sistema inexistente':
                    console.log('No existe el Sistema', respuesta);
                    Swal.fire('No existe el Sistema', '', 'warning');
                    break;
                  default:
                    console.error('Respuesta desconocida del servidor:', respuesta);
                    Swal.fire('Error desconocido', 'Hubo un problema desconocido en la respuesta del servidor', 'error');
                }
                this._perfilService.actualizarTablaPerfiles();
                this.dialogDesvincular.close();
              },
            );
        }
      });
    }
  }

  mostrarSistemasVinculados (){
    this._perfilService.perfilSistemasVinculados(this.perfilDesvinculado.perfil).subscribe(
      (respuesta: any) => {
        if (respuesta.DtT) {
          this.sistemasActivosVinculados = respuesta.DtT.filter(sistema => sistema.statuss === 'Activo');

          if (this.sistemasActivosVinculados.length === 0) {
            Swal.fire({
              title: 'No se puede DESVINCULAR',
              text: 'Este Perfil no tiene Sistemas Vinculados.',
              icon: 'warning',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: "#3085d6"
            });
          this.dialogDesvincular.close();
          } else {
            console.log(this.sistemasActivos);
          }
        } else {
          console.error('La propiedad DtT en la respuesta está vacía o indefinida.');
        }
      },
      (error) => {
        console.error('Error Obteniendo Sistemas:', error);
      }
    );
  }

  cerrarDialog(): void {
    this.dialogDesvincular.close();
  }
}
