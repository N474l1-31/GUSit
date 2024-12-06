import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatCheckboxChange } from '@angular/material/checkbox';
import  Swal  from 'sweetalert2';

import { SistemasService } from '../../Service/Sistemas.service';
import { PerfilesService } from 'src/app/gusit/perfil/Service/Perfiles.service';
import { UsuarioService } from 'src/app/gusit/usuario/Service/Usuario.service';

@Component({
  selector: 'app-dialogSistemaVinculaUsuarios',
  templateUrl: './dialogSistemaVinculaUsuarios.component.html',
  styleUrls: ['./dialogSistemaVinculaUsuarios.component.css']
})
export class DialogSistemaVinculaUsuariosComponent implements OnInit {

  vincularSistemaPUForm: FormGroup;
  usuariosActivos: any[] = [];
  noUsuarios: any [] = [];
  selectedPerfil: string = '';
  perfilesActivosVinculados: any [] = [];

  constructor(
    private formSistemaVinculaSU: FormBuilder,
    public _sistemasService: SistemasService,
    public _perfilesService: PerfilesService,
    public _usuariosService: UsuarioService,
    public dialogVincularSPU: MatDialogRef <DialogSistemaVinculaUsuariosComponent>,
    @Inject (MAT_DIALOG_DATA) public sistemaPUVinculada: any) { }

  ngOnInit() {
    this.crearFormularioVinculaSistemaPU();
      console.log("Formulario", this.vincularSistemaPUForm);
    this.mostrarPerfilesVinculados(this.sistemaPUVinculada.nombre);
    this.mostrarUsuariosNoVinculados(this.sistemaPUVinculada.nombre);
  }

  crearFormularioVinculaSistemaPU(){
    this.vincularSistemaPUForm = this.formSistemaVinculaSU.group ({
      sistema: [this.sistemaPUVinculada, [Validators.required]],
      perfil: [this.sistemaPUVinculada.perfil, [Validators.required]],
      lstComponentes: this.formSistemaVinculaSU.array ([])
    })
  }

  vincularSistemaAPerfilUsuarios(){
    if (this.vincularSistemaPUForm.valid){
      const formVinculacion = {
        sistema: this.vincularSistemaPUForm.value.sistema.nombre,
        perfil: this.vincularSistemaPUForm.value.perfil,
        lstComponentes: this.vincularSistemaPUForm.value.lstComponentes
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
          this._sistemasService.vinculaSistemaPerfilUsuarios(formVinculacion.sistema, formVinculacion.perfil, formVinculacion.lstComponentes)
          .subscribe(
            (respuesta) => {
              if(respuesta === 'ok'){
                console.log('ok:', respuesta);
                Swal.fire('Vinculación Exitosa', '', 'success');
                this._sistemasService.actualizarTablaSistemas();
                this.dialogVincularSPU.close();
              } else if (respuesta === 'Sistema dado de baja'){
                console.log('Sistema dado de baja:', respuesta);
                Swal.fire('Sistema dado de baja', '', 'warning');
                this._sistemasService.actualizarTablaSistemas();
                this.dialogVincularSPU.close();
              }else if (respuesta === 'Usuarios re-vinculados'){
                console.log('Usuarios re-vinculados:', respuesta);
                Swal.fire('Vinculación Exitosa', '', 'success');
                this._sistemasService.actualizarTablaSistemas();
                this.dialogVincularSPU.close();
              }else if (respuesta === 'Usuarios ya vinculados'){
                console.log('Usuarios ya vinculados', respuesta);
                Swal.fire('Los Usuarios ya se encuentran Vinculados', '', 'warning');
                this._sistemasService.actualizarTablaSistemas();
                this.dialogVincularSPU.close();
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

  mostrarPerfilesVinculados(nombreSistema: string) {
    if (nombreSistema) {
      this._sistemasService.perfilesPorSistemas(nombreSistema).subscribe(
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

  mostrarUsuariosNoVinculados(sistema: string){
    this._sistemasService.noUsuariosPorSistema(sistema).subscribe(respuesta => {
      if (respuesta.listaDatos === null) {
        Swal.fire('Sin Usuarios', 'No hay usuarios activos para vincular', 'info');
        this.dialogVincularSPU.close();
      } else {
        this.noUsuarios = JSON.parse(respuesta.listaDatos);
        console.log('Usuarios Que no pertenecen al Sistema:', this.noUsuarios);
      }
    });
    }

  updateSelectedUsuasuarios(event: MatCheckboxChange, usuarioSeleccionado: string) {
    const selectedVistas = this.vincularSistemaPUForm.get('lstComponentes') as FormArray;
    if (event.checked) {
      selectedVistas.push(new FormControl(usuarioSeleccionado)); // Agregar nuevo FormControl al FormArray
    } else {
      const index = selectedVistas.controls.findIndex(control => control.value === usuarioSeleccionado);
      if (index >= 0) {
        selectedVistas.removeAt(index); // Eliminar el FormControl del FormArray
      }
    }
  }

  cerrarDialog(): void {
    this.dialogVincularSPU.close();
  }
}
