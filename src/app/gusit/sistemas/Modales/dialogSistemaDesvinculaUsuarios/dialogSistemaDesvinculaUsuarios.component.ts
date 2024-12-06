import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatCheckboxChange } from '@angular/material/checkbox';
import  Swal  from 'sweetalert2';

import { PerfilesService } from 'src/app/gusit/perfil/Service/Perfiles.service';
import { SistemasService } from '../../Service/Sistemas.service';

@Component({
  selector: 'app-dialogSistemaDesvinculaUsuarios',
  templateUrl: './dialogSistemaDesvinculaUsuarios.component.html',
  styleUrls: ['./dialogSistemaDesvinculaUsuarios.component.css']
})
export class DialogSistemaDesvinculaUsuariosComponent implements OnInit {
  desvinculaSistemaPUForm: FormGroup;
  usuariosActivosVinculados: any [] = [];
  selectedPerfil: string = '';
  perfilesActivosVinculados: any [] = [];

  constructor(
    private formSistemaDesvinculaPU: FormBuilder,
    public _sistemasService: SistemasService,
    public _perfilService: PerfilesService,
    public dialogDesvinculaSPU: MatDialogRef <DialogSistemaDesvinculaUsuariosComponent>,
    @Inject (MAT_DIALOG_DATA) public sistemaPUDesvinculada: any)  { }

  ngOnInit() {
    this.creaFormularioDesvincularSistemaPU();
    console.log("Formulario", this.desvinculaSistemaPUForm);
    this.mostrarPerfilesVinculados(this.sistemaPUDesvinculada.nombre); // Usar data en lugar de this.sistemaPUDesvinculada
  }

  creaFormularioDesvincularSistemaPU() {
    this.desvinculaSistemaPUForm = this.formSistemaDesvinculaPU.group({
      sistema: [this.sistemaPUDesvinculada, [Validators.required]],
      perfil: [this.sistemaPUDesvinculada.perfil, [Validators.required]], // Establecer perfil seleccionado aquí
      lstComponentes: this.formSistemaDesvinculaPU.array([])
    })
  }

  desvinculaSistemaDePerfilUsuario() {
    if (this.desvinculaSistemaPUForm.valid){
      const formVinculacion = {
        sistema: this.desvinculaSistemaPUForm.value.sistema.nombre,
        perfil: this.desvinculaSistemaPUForm.value.perfil,
        lstComponentes: this.desvinculaSistemaPUForm.value.lstComponentes
      };
      console.log('FORMULARIO VINCULA SISTEMA PERFIL-USUARIOS', formVinculacion);
      Swal.fire({
        title: '¿Desea Realizar Vinculación?',
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#C82333",
      }).then((result) => {
        if(result.isConfirmed){
          this._sistemasService.desvinculaSistemaPerfilUsuarios(formVinculacion.sistema, formVinculacion.perfil, formVinculacion.lstComponentes)
          .subscribe(
            (respuesta) => {
              if(respuesta === 'ok'){
                console.log('ok:', respuesta);
                Swal.fire('Desvinculación Exitosa', '', 'success');
                this._sistemasService.actualizarTablaSistemas();
                this.dialogDesvinculaSPU.close();
              } else if (respuesta === 'Sistema dado de baja'){
                console.log('Sistema dado de baja:', respuesta);
                Swal.fire('Sistema dado de baja', '', 'warning');
                this._sistemasService.actualizarTablaSistemas();
                this.dialogDesvinculaSPU.close();
              }else if (respuesta === 'Usuarios re-vinculados'){
                console.log('Usuarios re-vinculados:', respuesta);
                Swal.fire('Usuarios re-vinculados', '', 'warning');
                this._sistemasService.actualizarTablaSistemas();
                this.dialogDesvinculaSPU.close();
              }
            },
              (error) => {
                console.error('Error al obtener la respuesta de la API:', error);
                console.log('Respuesta de error de la API:', error.error);    //Imprime la respuesta de la api
              }
          )
        }
      })
    }
  }

  mostrarPerfilesVinculados(sistema: string) {
    if (sistema) {
      this._sistemasService.perfilesPorSistemas(sistema).subscribe(
        (data: any) => {
          if (data && data.DtT) {
            this.perfilesActivosVinculados = data.DtT.map((perfil: any) => perfil.perfil);
            console.log('PerfilesVinculados al Sistema', this.perfilesActivosVinculados);
          } else {
            console.error('La respuesta del servicio no contiene datos válidos.');
          }
        },
        (error) => {
          console.error('Error obteniendo perfiles:', error);
        }
      );
    } else {
      console.error('El nombre del sistema es undefined o null.');
    }
  }

  onSelectPerfil(perfil: string, sistema: string) {
    this.selectedPerfil = perfil; // Asigna el perfil seleccionado a la variable selectedPerfil
    if (perfil && perfil.trim() !== '') {
      this.mostrarUsuariosVinculados(sistema, perfil);
    } else {
      console.error('El perfil seleccionado está indefinido o vacío.');
    }
  }

  mostrarUsuariosVinculados(sistema: string, perfil: string) {
    console.log('Sistema y Perfil Seleccionados:', sistema, perfil);
    this._sistemasService.usuariosPorSistemaPerfil(sistema, perfil).subscribe(
      (respuesta) => {
        if (respuesta && respuesta.DtT) {
          if (respuesta.DtT.length === 0) {
            console.warn('El sistema no cuenta con usuarios.');
            Swal.fire({
              icon: "warning",
              title: "Oops...",
              text: "El Sistema no cuenta con Usuarios!",
            });
                this.usuariosActivosVinculados = []; // Limpiar la lista de usuarios
          } else {
            this.usuariosActivosVinculados = respuesta.DtT.filter((usuario: any) => usuario.statuss === 'Activo'); // Filtrar usuarios activos
            console.log('Usuarios vinculados al Sistema y Perfil con estado "Activo":', this.usuariosActivosVinculados);
          }
        } else {
          console.error('La respuesta del servicio no contiene datos válidos.');
          alert('La respuesta del servicio no contiene datos válidos.');
        }
      },
      (error) => {
        console.error('Error al obtener usuarios vinculados:', error);
        alert('Error al obtener usuarios vinculados.');
      }
    );
  }

  updateSelectedUsuarios(event: MatCheckboxChange, usuarioSeleccionado: string) {
    const selectedUsuario = this.desvinculaSistemaPUForm.get('lstComponentes') as FormArray;
    if (event.checked) {
      selectedUsuario.push(new FormControl(usuarioSeleccionado)); // Agregar nuevo FormControl al FormArray
    } else {
      const index = selectedUsuario.controls.findIndex(control => control.value === usuarioSeleccionado);
      if (index >= 0) {
        selectedUsuario.removeAt(index); // Eliminar el FormControl del FormArray
      }
    }
  }

  cerrarDialog(): void {
    this.dialogDesvinculaSPU.close();
  }
}
