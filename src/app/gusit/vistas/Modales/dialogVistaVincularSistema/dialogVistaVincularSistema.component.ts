import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup,Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import  Swal  from 'sweetalert2';

import { VistasService } from '../../Service/Vistas.service';
import { SistemasService } from 'src/app/gusit/sistemas/Service/Sistemas.service';
import { AllSistemas } from 'src/app/gusit/sistemas/Interface/allSistemas';

@Component({
  selector: 'app-dialogVistaVincularSistema',
  templateUrl: './dialogVistaVincularSistema.component.html',
  styleUrls: ['./dialogVistaVincularSistema.component.css']
})
export class DialogVistaVincularSistemaComponent implements OnInit {
  vinculaVistasForm:FormGroup;
  DtT: AllSistemas [] = [];  //DtT es la V. donde regresa los resultados de la API
  sistemasActivosVinculados: AllSistemas [] = [];

  constructor(
    public _sistemasService: SistemasService,
    public _vistasService: VistasService,
    private formVincularVista: FormBuilder,
    public dialogVincularVista: MatDialogRef <DialogVistaVincularSistemaComponent>,
    @Inject (MAT_DIALOG_DATA) public vistaVinculada:any ){ }

  ngOnInit() {
    this.creaFormularioVinculaVista();
  }

  creaFormularioVinculaVista() {
    this.vinculaVistasForm = this.formVincularVista.group({
      sistema: ['', [Validators.required]],
      lstComponentes: [this.vistaVinculada.vista],
    });
    this.mostrarSistemasActivos();
  }

  vinculaVista(){
    if (this.vinculaVistasForm.valid){
      const formVinculacion = {
        sistema: this.vinculaVistasForm.value.sistema,
        lstComponentes: this.vinculaVistasForm.value.lstComponentes
      };
      console.log('FORMULARIO VINCULA VISTA A SISTEMA', formVinculacion);
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
                this._vistasService.actualizarTablaVistas();
                this.dialogVincularVista.close();
              } else if (respuesta === 'Vistas ya vinculadas'){
                console.log('La Vista ya se encuentra vinculada con el Sistema:', respuesta);
                Swal.fire('La Vista ya se encuentra vinculada con el Sistema', '', 'warning');
                this._vistasService.actualizarTablaVistas();
                this.dialogVincularVista.close();
              }
            },
              (error) => { console.error('Error en la solicitud:', error);}
          )
        }
      })
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
    this.dialogVincularVista.close();
  }
}
