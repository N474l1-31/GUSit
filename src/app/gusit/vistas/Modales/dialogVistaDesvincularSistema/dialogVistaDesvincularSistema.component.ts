import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup,Validators,FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import  Swal  from 'sweetalert2';

import { VistasService } from '../../Service/Vistas.service';
import { SistemasService } from 'src/app/gusit/sistemas/Service/Sistemas.service';

@Component({
  selector: 'app-dialogVistaDesvincularSistema',
  templateUrl: './dialogVistaDesvincularSistema.component.html',
  styleUrls: ['./dialogVistaDesvincularSistema.component.css']
})
export class DialogVistaDesvincularSistemaComponent implements OnInit {

  desvinculaSistemaVForm: FormGroup;
  sistemasActivosVinculados: any [] = [];

  constructor(
    private formVistaDesvincula: FormBuilder,
    public _sistemasService: SistemasService,
    public _vistasService: VistasService,
    public dialogDesvincularVistas: MatDialogRef <DialogVistaDesvincularSistemaComponent>,
    @Inject (MAT_DIALOG_DATA) public vistaDesvinculada: any) { }

  ngOnInit(){
    this.crearFormularioDesvincularVista();
  }

  crearFormularioDesvincularVista() {
    this.desvinculaSistemaVForm = this.formVistaDesvincula.group({
      sistema: ['', [Validators.required]],
      lstComponentes: new FormControl(this.vistaDesvinculada.vista) // La vista se establece como deshabilitada
    });
    this.mostrarSistemasVinculados();
  }

  desvinculaVista(){
    if (this.desvinculaSistemaVForm.valid){
      const formDesvinculacion = {
        sistema: this.desvinculaSistemaVForm.value.sistema,
        lstComponentes: this.desvinculaSistemaVForm.value.lstComponentes
      };
      console.log('FORMULARIO DESVINCULA VISTA A SISTEMA', formDesvinculacion);
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
                this._vistasService.actualizarTablaVistas();
                this.dialogDesvincularVistas.close();
              } else if (respuesta === 'ya se habian desvinculado las vistas'){
                console.log('La Vista Desvinculada del Sistema:', respuesta);
                Swal.fire('La Vista ya se encontraba Desvinculada del Sistema', '', 'warning');
                this._vistasService.actualizarTablaVistas();
                this.dialogDesvincularVistas.close();
              }
            },
              (error) => { console.error('Error en la solicitud:', error);}
          )
        }
      })
    }
  }

  mostrarSistemasVinculados() {
    const vistaControl = this.desvinculaSistemaVForm.get('lstComponentes');
    if (vistaControl && vistaControl.value) {
      const vistaSeleccionada = vistaControl.value;

      this._vistasService.detallesVistaSistemaPerfil(vistaSeleccionada).subscribe(
        (response: any) => {
          if (response.listaDatos !== null) {
            const data = JSON.parse(response.listaDatos);
            if (data.length > 0) {
              const sistemasActivos = data.filter((sistema: any) => sistema.statuss === 'Activo');
              if (sistemasActivos.length > 0) {
                console.log('Sistemas Activos:', sistemasActivos);
                this.sistemasActivosVinculados = sistemasActivos; // Asignamos los sistemas activos para mostrarlos en el mat-select
              } else {
                console.log('Los Sistemas con los que se encuentra Vinculados tienen Status Inactivo', response.mensaje);
                Swal.fire({
                  icon: 'warning',
                  title: 'Atención',
                  text: 'La Vista no tiene Sistemas Vinculados.'
                }).then(() => {
                  this.cerrarDialog(); // Cierra el modal después de que el usuario hace clic en "OK"
                });
              }
            }
          } else {
            console.log('La Vista no tiene Sistemas Vinculados.', response.mensaje);
            Swal.fire({
              icon: 'warning',
              title: 'Atención',
              text: 'La Vista no tiene Sistemas Vinculados.'
            }).then(() => {
              this.cerrarDialog();
            });
          }
        },
        (error) => {
          console.error('Error al obtener sistemas vinculados:', error);
        }
      );
    }
  }

  cerrarDialog(): void {
    this.dialogDesvincularVistas.close();
  }
}
