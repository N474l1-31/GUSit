import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatCheckboxChange } from '@angular/material/checkbox';
import  Swal  from 'sweetalert2';

import { PerfilesService } from 'src/app/gusit/perfil/Service/Perfiles.service';
import { SistemasService } from '../../Service/Sistemas.service';

@Component({
  selector: 'app-dialogSistemaVinculaPerfiles',
  templateUrl: './dialogSistemaVinculaPerfiles.component.html',
  styleUrls: ['./dialogSistemaVinculaPerfiles.component.css']
})
export class DialogSistemaVinculaPerfilesComponent implements OnInit {
  vincularSistemaPerfilesForm: FormGroup;
  noPerfiles: any [] = [];

  constructor(
    private formSistemaPVincula: FormBuilder,
    public _sistemasService: SistemasService,
    public _perfilService: PerfilesService,
    public dialogVincularPerfil: MatDialogRef <DialogSistemaVinculaPerfilesComponent>,
    @Inject (MAT_DIALOG_DATA) public sistemaPerfilesVinculado: any) { }

  ngOnInit() {
    this.crearFormularioVinculaSistemaPerfiles();
      console.log(this.vincularSistemaPerfilesForm)
    this.mostrarPerfilesNoVinculados(this.sistemaPerfilesVinculado.nombre)
  }

  crearFormularioVinculaSistemaPerfiles() {
    this.vincularSistemaPerfilesForm = this.formSistemaPVincula.group ({
      sistema: [this.sistemaPerfilesVinculado, [Validators.required]],
      lstComponentes: this.formSistemaPVincula.array ([])
    })
  }

  vinculaSistemaPerfiles() {
    if (this.vincularSistemaPerfilesForm.valid) {
      const formVinculacion = {
        sistema: this.vincularSistemaPerfilesForm.value.sistema.nombre,
        lstComponentes: this.vincularSistemaPerfilesForm.value.lstComponentes
      };
      console.log('FORMULARIO VINCULA SISTEMA PERFILES', formVinculacion);
      Swal.fire({
        title: '¿Desea Realizar Vinculación?',
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#C82333",
      }).then((result) => {
        if (result.isConfirmed) {
          this._perfilService.vinculaPerfilesSistema(formVinculacion.sistema, formVinculacion.lstComponentes)
            .subscribe(
              (respuesta) => {
                switch (respuesta) {
                  case 'ok':
                    console.log('Vinculación Exitosa:', respuesta);
                    Swal.fire('Vinculación Exitosa', '', 'success');
                    break;
                  case 'Perfiles ya vinculados':
                    console.log('Los Perfiles ya se encuentran vinculada con el Sistema:', respuesta);
                    Swal.fire('Los Perfiles ya se encuentran vinculada con el Sistema', '', 'warning');
                    break;
                  case 'Perfiles actualizados':
                    console.log('Perfiles actualizados:', respuesta);
                    Swal.fire('Vinculación Exitosa', '', 'success');
                    break;
                  case 'Perfiles re-vinculados':
                    console.log('Perfiles re-vinculados:', respuesta);
                    Swal.fire('Vinculación Exitosa', '', 'success');
                    break;
                  default:
                    console.error('Error desconocido en la solicitud:', respuesta);
                    Swal.fire('Error desconocido en la solicitud: ' + respuesta, '', 'error');
                    break;
                }
                this._sistemasService.actualizarTablaSistemas();
                this.dialogVincularPerfil.close();
              }
            );
        }
      });
    }
  }

  mostrarPerfilesNoVinculados(sistema:string){
    this._sistemasService.noPerfilesPorSistema(sistema).subscribe(respuesta => {
      if (respuesta.listaDatos === null) {
        Swal.fire('Sin Perfiles', 'No hay Perfiles activos para Vincular', 'info');
        this.dialogVincularPerfil.close();
      } else {
        this.noPerfiles = JSON.parse(respuesta.listaDatos);
        console.log('Perfiles Que no pertenecen al Sistema:', this.noPerfiles);
      }
    });
  }

  updateSelectedPerfiles (event: MatCheckboxChange, perfilSeleccionado: string) {
    const selectedPerfiles = this.vincularSistemaPerfilesForm.get('lstComponentes') as FormArray;
    if (event.checked) {
      selectedPerfiles.push(new FormControl(perfilSeleccionado)); // Agregar nuevo FormControl al FormArray
    } else {
      const index = selectedPerfiles.controls.findIndex(control => control.value === perfilSeleccionado);
      if (index >= 0) {
        selectedPerfiles.removeAt(index); // Eliminar el FormControl del FormArray
      }
    }
  }

  cerrarDialog(): void {
    this.dialogVincularPerfil.close();
  }

}
