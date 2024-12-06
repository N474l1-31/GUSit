import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatCheckboxChange } from '@angular/material/checkbox';
import  Swal  from 'sweetalert2';

import { VistasService } from 'src/app/gusit/vistas/Service/Vistas.service';
import { SistemasService } from '../../Service/Sistemas.service';

@Component({
  selector: 'app-dialogSistemaDesvinculaVistas',
  templateUrl: './dialogSistemaDesvinculaVistas.component.html',
  styleUrls: ['./dialogSistemaDesvinculaVistas.component.css']
})

export class DialogSistemaDesvinculaVistasComponent implements OnInit {
  desvinculaSistemaVForm: FormGroup;
  vistasActivasVinculadas: any [] = [];

  constructor(
    private formSistemaDesvinculaV: FormBuilder,
    public _sistemasService: SistemasService,
    public _vistasService: VistasService,
    public dialogVinculaSV: MatDialogRef <DialogSistemaDesvinculaVistasComponent>,
    @Inject (MAT_DIALOG_DATA) public sistemaVDesvinculada: any) { }

  ngOnInit() {
    this.crearFormularioDesvinculaSistemaV();
    this.obtenerVistasActivas();
  }

  crearFormularioDesvinculaSistemaV () {
    this.desvinculaSistemaVForm = this.formSistemaDesvinculaV.group({
      sistema: [this.sistemaVDesvinculada, []],
      lstComponentes: this.formSistemaDesvinculaV.array ([])
    });
  }

  desvinculaSistemaAVistas() {
    if (this.desvinculaSistemaVForm.valid){
      const formDesvinculacion = {
        sistema: this.desvinculaSistemaVForm.value.sistema.nombre,
        lstComponentes: this.desvinculaSistemaVForm.value.lstComponentes
      };
      console.log('FORMULARIO DESVINCULA SISTEMA A VISTAS', formDesvinculacion);
      Swal.fire({
        title: '¿Desea Realizar Desvinculación?',
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#C82333",
      }).then((result) => {
        if(result.isConfirmed){
          this._vistasService.desvinculaVistaSistema(formDesvinculacion.sistema, formDesvinculacion.lstComponentes)
          .subscribe(
            (respuesta) => {
              if(respuesta === 'ok'){
                console.log('Desvinculacion Exitosa:', respuesta);
                Swal.fire('Desvinculación Exitosa', '', 'success');
                this._sistemasService.actualizarTablaSistemas();
                this.dialogVinculaSV.close();
              } else if (respuesta === 'ya se habian desvinculado las vistas'){
                console.log('La Vista Desvinculada del Sistema:', respuesta);
                Swal.fire('La Vista ya se encontraba Desvinculada del Sistema', '', 'warning');
                this._sistemasService.actualizarTablaSistemas();
                this.dialogVinculaSV.close();
              }
            },
              (error) => { console.error('Error en la solicitud:', error);}
          )
        }
      })
    }
  }

  obtenerVistasActivas() {
    const sistema = this.sistemaVDesvinculada.nombre; // Obtén el nombre del sistema del que deseas obtener las vistas
    this.mostrarVistasActivasVinculadas(sistema); // Llama al método para mostrar las vistas activas
  }

  mostrarVistasActivasVinculadas(sistema: string) {
    this._vistasService.vistasSistema(sistema).subscribe(
      (respuesta: any) => {
        if (respuesta && respuesta.listaDatos) {
          const listaDatos = JSON.parse(respuesta.listaDatos);  // Convertir la cadena JSON en un objeto JavaScript
          console.log('Vistas del Sistema:', listaDatos);
          const vistasActivas = listaDatos.filter(vista => vista.statuss === 'Activo');     // Mostrar solo las Vistas Vinculadas (Activas)
          this.vistasActivasVinculadas = vistasActivas;
          if (vistasActivas.length > 0) {
            console.log('vistasActivasVinculadas:', this.vistasActivasVinculadas);
          } else {
            Swal.fire({
              title: 'No hay vistas activas',
              text: 'No se encontraron vistas activas vinculadas al sistema.',
              icon: 'info',
              confirmButtonColor: "#3085d6",
            });
            this.dialogVinculaSV.close();
          }
        } else {
          console.error('La propiedad lista Datos en la respuesta está vacía o indefinida.');     // Mostrar alerta si la lista de datos está vacía o indefinida
          Swal.fire({
            title: 'Error',
            text: 'No se encontraron vistas Vinculadas al Sistema.',
            icon: 'error',
            confirmButtonColor: "#C82333",
          });
          this.dialogVinculaSV.close();
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

  updateSelectedVistas(event: MatCheckboxChange, vistaSeleccionada: string) {
    const selectedVistas = this.desvinculaSistemaVForm.get('lstComponentes') as FormArray;
    if (event.checked) {
      selectedVistas.push(new FormControl(vistaSeleccionada)); // Agregar nuevo FormControl al FormArray
      console.log('Perfil seleccionado:', vistaSeleccionada);
    } else {
      const index = selectedVistas.controls.findIndex(control => control.value === vistaSeleccionada);
      if (index >= 0) {
        selectedVistas.removeAt(index); // Eliminar el FormControl del FormArray
      }
    }
  }

  cerrarDialog(): void {
    this.dialogVinculaSV.close();
  }
}


