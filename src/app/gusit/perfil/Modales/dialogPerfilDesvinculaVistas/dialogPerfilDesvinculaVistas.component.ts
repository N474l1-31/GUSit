import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatCheckboxChange } from '@angular/material/checkbox';
import  Swal  from 'sweetalert2';

import { VistasService } from 'src/app/gusit/vistas/Service/Vistas.service';
import { PerfilesService } from '../../Service/Perfiles.service';
import { SistemasService } from 'src/app/gusit/sistemas/Service/Sistemas.service';
import { AllSistemas } from 'src/app/gusit/sistemas/Interface/allSistemas';

@Component({
  selector: 'app-dialogPerfilDesvinculaVistas',
  templateUrl: './dialogPerfilDesvinculaVistas.component.html',
  styleUrls: ['./dialogPerfilDesvinculaVistas.component.css']
})
export class DialogPerfilDesvinculaVistasComponent implements OnInit {
  desvinculaPerfilSVForm: FormGroup;
  sistemasActivos: AllSistemas [] = [];
  sistemasActivosVinculados: any [] = [];
  vistasVinculadas: any [] = [];
  perfil: string;

  constructor(
    private formPerfilDesvinculaSV: FormBuilder,
    public _sistemasService: SistemasService,
    public _perfilService: PerfilesService,
    public _vistasService: VistasService,
    public dialogDesvincularPSV: MatDialogRef <DialogPerfilDesvinculaVistasComponent>,
    @Inject (MAT_DIALOG_DATA) public perfilSVDesvinculado: any) { }

  ngOnInit() {
    this.perfil = this.perfilSVDesvinculado.perfil;
    this.crearFormularioDesvincularPerfilSV();
      console.log(this.desvinculaPerfilSVForm);
    this.mostrarSistemasVinculados();
  }

  crearFormularioDesvincularPerfilSV() {
    this.desvinculaPerfilSVForm = this.formPerfilDesvinculaSV.group({
      perfil: [this.perfilSVDesvinculado.perfil, [Validators.required]],
      sistema: ['', [Validators.required]],
      lstComponentes: this.formPerfilDesvinculaSV.array ([])
    });
      this.desvinculaPerfilSVForm.get('sistema').valueChanges.subscribe ((sistema) => {
        if (sistema) {
          this.mostrarVistasActivasVinculadas(sistema, this.perfil)
        }
      })
  }

  desvincularPerfilASistemaVistas(){
    if (this.desvinculaPerfilSVForm.valid){
      const formDesvinculacion = {
        perfil: this.desvinculaPerfilSVForm.value.perfil,
        sistema: this.desvinculaPerfilSVForm.value.sistema,
        lstComponentes: this.desvinculaPerfilSVForm.value.lstComponentes || []
      };
      console.log('FORMULARIO DESVINCULA PERFIL A SISTEMA-VISTAS', formDesvinculacion);
      Swal.fire({
        title: '¿Desea Realizar la Desvinculación?',
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#C82333",
      }).then((result) => {
        if(result.isConfirmed){
          this._perfilService.desvinculaPerfilSistemaVistas( formDesvinculacion.perfil, formDesvinculacion.sistema, formDesvinculacion.lstComponentes)
          .subscribe(
            (respuesta) => {
              console.log('Respuesta de la API:', respuesta);
              if(respuesta === 'ok'){
                console.log('Desvinculacion Exitosa:', respuesta);
                Swal.fire('Desinculacion Exitosa', '', 'success');
                this._perfilService.actualizarTablaPerfiles();
                this.dialogDesvincularPSV.close();
              } else if (respuesta === 'Vistas no dadas de alta en el sistema'){
                console.log('Vista(s) no dadas de alta en el Sistema:', respuesta);
                Swal.fire('Vista(s) no dadas de alta.', 'Error en el Sistema o Perfil', 'info');
              }
            },
              (error) => { console.error('Error en la solicitud:', error);}
          )
        }
      })
    }
  }

  // mostrarSistemasVinculados (){
  //   this._perfilService.perfilSistemasVinculados(this.perfilSVDesvinculado.perfil).subscribe(
  //   (respuesta: any) => {
  //     if (respuesta.DtT) {
  //       this.sistemasActivosVinculados = respuesta.DtT.filter(sistema => sistema.statuss === 'Activo');

  //       if (this.sistemasActivosVinculados.length === 0) {
  //         Swal.fire({
  //           title: 'No se puede DESVINCULAR Vistas.',
  //           text: 'Este Perfil NO tiene Sistemas Vinculados.',
  //           icon: 'warning',
  //           confirmButtonText: 'Aceptar',
  //           confirmButtonColor: "#3085D6"
  //         });
  //       this.dialogDesvincularPSV.close();
  //     } else {
  //       console.log(this.sistemasActivosVinculados);
  //     }
  //     } else {
  //       console.error('La propiedad DtT en la respuesta está vacía o indefinida.');
  //     }
  //   },
  //   (error) => {
  //     console.error('Error Obteniendo Sistemas:', error);
  //   }
  // );
  // }




  mostrarSistemasVinculados() {
    this._perfilService.perfilSistemasVinculados(this.perfilSVDesvinculado.perfil).subscribe(
      (respuesta: any) => {
        console.log('Sistemas:',respuesta);
        if (respuesta.DtT && respuesta.DtT.length > 0) {
          this.sistemasActivosVinculados = respuesta.DtT.filter(sistema => sistema.statuss === 'Activo' || sistema.statuss === 'Proceso');

          if (this.sistemasActivosVinculados.length > 0) {
            console.log(this.sistemasActivosVinculados);
          } else {
            Swal.fire({
              title: 'No se puede VINCULAR Vistas.',
              text: 'Este Perfil no tiene Sistemas Vinculados Activos o en Proceso.',
              icon: 'info',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: "#3085d6"
            });
            this.dialogDesvincularPSV.close();
          }

        } else {
          Swal.fire({
            title: 'No se puede VINCULAR Vistas.',
            text: 'Este Perfil NO tiene Sistemas Vinculados.',
            icon: 'info',
            iconColor: '#00728C',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: "#3085d6"
          });
          this.dialogDesvincularPSV.close();
        }
      },
      (error) => {
        console.error('Error Obteniendo Sistemas:', error);
        Swal.fire('Error', 'Hubo un problema al obtener los sistemas vinculados.', 'error');
      }
    );
  }










  mostrarVistasActivasVinculadas(sistema: string, perfil: string){
    this._vistasService.vistasSistemaPerfil(sistema, perfil).subscribe(
      (respuesta: any) => {
        if (respuesta.DtT) {
          this.vistasVinculadas = respuesta.DtT.filter(vista => vista.statuss === 'Activo' );      // Filtrar solo las vistasVinculadas activas

          if (this.vistasVinculadas.length === 0) {
            Swal.fire({
              title:'El Sistema seleccionado se encuentra ACTIVO.',
              text:'Pero NO tiene Vistas Vinculadas.',
              icon:'info',
              iconColor: '#32A652',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: "#3085d6"
            })
            this.cerrarDialog();  // Cerrar el diálogo si no hay vistas vinculadas
          }
        } else {
          console.error('La propiedad lista Datos en la respuesta está vacía o indefinida.');
        }
      },
      (error) => {
        console.error('Error Obteniendo Vistas:', error);
      }
    );
  }

  updateSelectedVistas(event: MatCheckboxChange, idVistaSis: string) {
    const selectedVistas = this.desvinculaPerfilSVForm.get('lstComponentes') as FormArray;
    if (event.checked) {
      selectedVistas.push(new FormControl(idVistaSis)); // Agregar nuevo FormControl al FormArray
    } else {
      const index = selectedVistas.controls.findIndex(control => control.value === idVistaSis);
      if (index >= 0) {
        selectedVistas.removeAt(index); // Eliminar el FormControl del FormArray
      }
    }
  }

  cerrarDialog(): void {
    this.dialogDesvincularPSV.close();
  }
}
