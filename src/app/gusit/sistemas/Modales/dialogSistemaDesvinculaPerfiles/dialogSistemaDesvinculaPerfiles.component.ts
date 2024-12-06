import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatCheckboxChange } from '@angular/material/checkbox';
import  Swal  from 'sweetalert2';

import { PerfilesService } from 'src/app/gusit/perfil/Service/Perfiles.service';
import { SistemasService } from '../../Service/Sistemas.service';

@Component({
  selector: 'app-dialogSistemaDesvinculaPerfiles',
  templateUrl: './dialogSistemaDesvinculaPerfiles.component.html',
  styleUrls: ['./dialogSistemaDesvinculaPerfiles.component.css']
})

export class DialogSistemaDesvinculaPerfilesComponent implements OnInit {
  desvinculaSistemaPForm: FormGroup;
  perfilesActivosVinculados: any []=[];

  constructor(
    private formSistemaDesvinculaP: FormBuilder,
    public _sistemasService: SistemasService,
    public _perfilService: PerfilesService,
    public dialogDesvinculaSP: MatDialogRef <DialogSistemaDesvinculaPerfilesComponent>,
    @Inject (MAT_DIALOG_DATA) public sistemaPDesvinculada: any)  { }

  ngOnInit() {
    this.crearFormularioDesvinculaSistemaP();
    this.obtenerPerfilesActivos();
  }

  crearFormularioDesvinculaSistemaP() {
    this.desvinculaSistemaPForm = this.formSistemaDesvinculaP.group ({
      sistema: [this.sistemaPDesvinculada, []],
      lstComponentes: this.formSistemaDesvinculaP.array([]) // Inicializa lstComponentes como un FormArray vacío
    });
  }

  desvinculaSistemaDePerfiles() {
    if (this.desvinculaSistemaPForm.valid){
      const formDesvinculacion = {
        sistema: this.desvinculaSistemaPForm.value.sistema.nombre,
        lstComponentes: this.desvinculaSistemaPForm.value.lstComponentes
      };
      console.log('FORMULARIO DESVINCULA SISTEMA A PERFILES', formDesvinculacion);
      Swal.fire({
        title: '¿Desea Realizar Desvinculación?',
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#C82333",
      }).then((result) => {
        if(result.isConfirmed){
          this._perfilService.desvinculaPerfilesSistema(formDesvinculacion.sistema, formDesvinculacion.lstComponentes)
          .subscribe(
            (respuesta) => {
              if(respuesta === 'ok'){
                console.log('Desvinculacion Exitosa:', respuesta);
                Swal.fire('Desvinculación Exitosa', '', 'success');
                this._sistemasService.actualizarTablaSistemas();
                this.dialogDesvinculaSP.close();

              } else if (respuesta === 'Sistema inexistente'){
                console.log('No Existe el Sistema:', respuesta);
                Swal.fire('No Existe el Sistema:', '', 'warning');
                this._sistemasService.actualizarTablaSistemas();
                this.dialogDesvinculaSP.close();
              }
            },
              (error) => { console.error('Error en la solicitud:', error);}
          )
        }
      })
    }
  }

  obtenerPerfilesActivos(){
    const sistema = this.sistemaPDesvinculada.nombre;
    this.mostrarPerfilesActivosVinculados(sistema);
  }

  mostrarPerfilesActivosVinculados(sistema: string) {
    this._sistemasService.perfilesPorSistema(sistema).subscribe(
      (respuesta: any) => {
        if (respuesta && respuesta.listaDatos) {
          const listaDatos = JSON.parse(respuesta.listaDatos); // Convertir la cadena JSON en un objeto JavaScript
          console.log('Perfiles del Sistema:', listaDatos);

          // Mostrar solo las Vistas Vinculadas (Activas)
          const perfilesActivos = listaDatos.filter(perfil => perfil.statuss === 'Activo');
          this.perfilesActivosVinculados = perfilesActivos;
          if (perfilesActivos.length > 0) {
            console.log('perfilesActivosVinculados:', this.perfilesActivosVinculados);
          } else {
            Swal.fire({
              title: 'No hay perfiles activos',
              text: 'No se encontraron perfiles activos al sistema.',
              icon: 'info',
              confirmButtonColor: "#3085d6",
            });
            this.dialogDesvinculaSP.close();
          }
        } else {
          console.error('La propiedad lista Datos en la respuesta está vacía o indefinida.');
          Swal.fire({
            title: 'Error',
            text: 'No se encontraron perfiles Vinculados al Sistema.',
            icon: 'error',
            confirmButtonColor: "#C82333",
          });
          this.dialogDesvinculaSP.close();
        }
      },
      (error) => {
        console.error('Error Obteniendo Vistas:', error);
        Swal.fire({
          title: 'Error',
          text: 'Ocurrió un error al obtener las vistas vinculadas al sistema.',
          icon: 'error',
          confirmButtonColor: "#C82333",
        });
      }
    );
  }

  updateSelectedPerfiles(event: MatCheckboxChange, perfilSeleccionado: string) {
    const selectedVistas = this.desvinculaSistemaPForm.get('lstComponentes') as FormArray;
    if (event.checked) {
      selectedVistas.push(new FormControl(perfilSeleccionado)); // Agregar nuevo FormControl al FormArray
      console.log('Perfil seleccionado:', perfilSeleccionado);
    } else {
      const index = selectedVistas.controls.findIndex(control => control.value === perfilSeleccionado);
      if (index >= 0) {
        selectedVistas.removeAt(index); // Eliminar el FormControl del FormArray
      }
    }
  }

  cerrarDialog(): void {
    this.dialogDesvinculaSP.close();
  }
}
