import { Component, OnInit,Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import  Swal  from 'sweetalert2';

import { PerfilesService } from '../../Service/Perfiles.service';
import { SistemasService } from 'src/app/gusit/sistemas/Service/Sistemas.service';
import { AllSistemas } from 'src/app/gusit/sistemas/Interface/allSistemas';

@Component({
  selector: 'app-dialogPerfilVincularSistema',
  templateUrl: './dialogPerfilVincularSistema.component.html',
  styleUrls: ['./dialogPerfilVincularSistema.component.css']
})
export class DialogPerfilVincularSistemaComponent implements OnInit {
  vinculaPerfilForm: FormGroup;
  DtT: AllSistemas[] = [];  //DtT es la V. donde regresa los resultados de la API
  sistemasActivosVinculados: AllSistemas [] = [];
  selectedSistema: string = '';

  constructor(
    public _sistemasService: SistemasService,
    public _perfilService: PerfilesService,
    private formPerfilVincula: FormBuilder,
    public dialogVincularPerfil: MatDialogRef <DialogPerfilVincularSistemaComponent>,
    @Inject (MAT_DIALOG_DATA) public perfilVinculado:any) { }

  ngOnInit() {
    this.creaFormularioVinculaPerfil();
    this.mostrarSistemasActivos();
  }

  creaFormularioVinculaPerfil(){
    this.vinculaPerfilForm = this.formPerfilVincula.group({
      perfil: [this.perfilVinculado.perfil, [Validators.required]],
      sistema: ['', [Validators.required]],
    })
  }

  vincularPerfil() {
    if (this.vinculaPerfilForm.valid) {
      const formVinculacion = this.vinculaPerfilForm.value;
      console.log('FORMULARIO VINCULA PERFIL A SISTEMA', formVinculacion);
      Swal.fire({
        title: ' ¿Desea Realizar Vinculación?',
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#C82333",
      }).then((result) => {
        if (result.isConfirmed) {
          this._perfilService.vinculaPerfilesSistema(formVinculacion.sistema, formVinculacion.perfil)
            .subscribe(
              (respuesta) => {
                console.log(respuesta)
                if (respuesta === 'ok') {
                  console.log('Vinculación Exitosa:', respuesta);
                  Swal.fire('Vinculación Exitosa', '', 'success');
                  this._perfilService.actualizarTablaPerfiles();
                  this.dialogVincularPerfil.close();
                } else if (respuesta === 'Perfiles re-vinculados') {
                  console.log('El Perfil ya se encuentra vinculado con el Sistema:', respuesta);
                  Swal.fire('Perfil Re-Vinculado', '', 'warning');
                  this._perfilService.actualizarTablaPerfiles();
                  this.dialogVincularPerfil.close();
                }
              },
              (error) => {
                console.error('Error en la solicitud:', error);
              }
            );
        }
      });
    }
  }

  mostrarSistemasActivos() {    /* Muestra los sistemas que puede seleccionar para realizar la vinculacion */
    this._sistemasService.detallesTablaSistemas().subscribe(    //La respuesta de la Api ya esta en formato JSON, no se necesita una hacer un JSON.parse().
      (data: any) => {
        if (data.DtT) {
          this.DtT = data.DtT;
          this.sistemasActivosVinculados = this.DtT.filter((sistema) => sistema.status === 'Activo' || sistema.status === 'Proceso')
          console.log(this.sistemasActivosVinculados);
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
    this.dialogVincularPerfil.close();
  }
}
