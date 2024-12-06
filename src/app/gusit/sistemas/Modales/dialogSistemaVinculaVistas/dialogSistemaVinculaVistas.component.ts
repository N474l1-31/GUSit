import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatCheckboxChange } from '@angular/material/checkbox';
import  Swal  from 'sweetalert2';

import { VistasService } from 'src/app/gusit/vistas/Service/Vistas.service';
import { SistemasService } from '../../Service/Sistemas.service';

@Component({
  selector: 'app-dialogSistemaVinculaVistas',
  templateUrl: './dialogSistemaVinculaVistas.component.html',
  styleUrls: ['./dialogSistemaVinculaVistas.component.css']
})
export class DialogSistemaVinculaVistasComponent implements OnInit {
  vincularSistemaVistasForm: FormGroup;
  noVistas: any [] = [];

  constructor(
    private formSistemaVinculaV: FormBuilder,
    public _sistemasService: SistemasService,
    public _vistasService: VistasService,
    public dialogVinculaSV: MatDialogRef <DialogSistemaVinculaVistasComponent>,
    @Inject (MAT_DIALOG_DATA) public sistemaVistasVinculada: any) { }

  ngOnInit() {
    this.crearFormularioVinculaSistemaV();
      console.log(this.vincularSistemaVistasForm)
      this.mostrarVistasNoVinculados(this.sistemaVistasVinculada.nombre)
  }

  crearFormularioVinculaSistemaV () {
    this.vincularSistemaVistasForm = this.formSistemaVinculaV.group({
      sistema: [this.sistemaVistasVinculada, [Validators.required]],
      lstComponentes: this.formSistemaVinculaV.array ([])
    })
  }

  vinculaSistemaAVistas() {
    if (this.vincularSistemaVistasForm.valid){
      const formVinculacion = {
        sistema: this.vincularSistemaVistasForm.value.sistema.nombre,
        lstComponentes: this.vincularSistemaVistasForm.value.lstComponentes
      };
      console.log('FORMULARIO VINCULA SISTEMA A VISTAS', formVinculacion);
      Swal.fire({
        title: '¿Desea Realizar Vinculación?',
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#C82333",
      }).then((result) => {
        if(result.isConfirmed){
          this._vistasService.vinculaVistaSistema(formVinculacion.sistema, formVinculacion.lstComponentes)
          .subscribe(
            (respuesta) => {
              if(respuesta === 'ok'){
                console.log('Vinculacion Exitosa:', respuesta);
                Swal.fire('Vinculación Exitosa', '', 'success');
              } else if (respuesta === 'Vistas ya vinculadas'){
                console.log('La Vista ya se encuentra vinculada con el Sistema:', respuesta);
                Swal.fire('La Vista ya se encuentra vinculada con el Sistema', '', 'warning');
              }
            },
              (error) => { console.error('Error en la solicitud:', error);}
          )
        }
      })
    }
  }

  mostrarVistasNoVinculados(sistema:string){
    this._sistemasService.noVistasPorSistema(sistema).subscribe(respuesta => {
      if (respuesta.listaDatos === null) {
        Swal.fire('Sin Vistas', 'No hay Vistas activos para Vincular', 'info');
        this.dialogVinculaSV.close();
      } else {
        this.noVistas = JSON.parse(respuesta.listaDatos);
        console.log('Vistas Que no pertenecen al Sistema:', this.noVistas);
      }
    });
  }

  updateSelectedVistas(event: MatCheckboxChange, vistaSeleccionada: string) {
    const selectedVistas = this.vincularSistemaVistasForm.get('lstComponentes') as FormArray;
    if (event.checked) {
      selectedVistas.push(new FormControl(vistaSeleccionada)); // Agregar nuevo FormControl al FormArray
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
