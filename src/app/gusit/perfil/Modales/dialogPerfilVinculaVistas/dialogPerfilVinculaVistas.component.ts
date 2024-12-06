import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatCheckboxChange } from '@angular/material/checkbox';
import  Swal  from 'sweetalert2';

import { VistasService } from 'src/app/gusit/vistas/Service/Vistas.service';
import { SistemasService } from 'src/app/gusit/sistemas/Service/Sistemas.service';
import { PerfilesService } from '../../Service/Perfiles.service';

@Component({
  selector: 'app-dialogPerfilVinculaVistas',
  templateUrl: './dialogPerfilVinculaVistas.component.html',
  styleUrls: ['./dialogPerfilVinculaVistas.component.css']
})
export class DialogPerfilVinculaVistasComponent implements OnInit {
  vincularPerfilSVForm: FormGroup;
  sistemasActivosVinculados: any [] = [];
  vistasVinculadas: any[] = [];

  constructor(
    private formPerfilVinculaSV: FormBuilder,
    public _sistemasService: SistemasService,
    public _perfilService: PerfilesService,
    public _vistasService: VistasService,
    public dialogVincularPSV: MatDialogRef <DialogPerfilVinculaVistasComponent>,
    @Inject (MAT_DIALOG_DATA) public perfilSVVinculada: any) { }

  ngOnInit() {
    this.crearFormularioVinculaPerfilSV();
      console.log(this.vincularPerfilSVForm);
    this.mostrarSistemasVinculados();
  }

  crearFormularioVinculaPerfilSV() {
    this.vincularPerfilSVForm = this.formPerfilVinculaSV.group({
      perfil: [this.perfilSVVinculada.perfil, [Validators.required]],
      sistema: ['', [Validators.required]],
      lstComponentes: this.formPerfilVinculaSV.array([])
    });
    this.vincularPerfilSVForm.get('sistema').valueChanges.subscribe((sistema) => {       // Observa cambios en el campo 'sistema' para cargar las vistas vinculadas
      if (sistema) {
        this.mostrarVistasActivas(sistema);
      }
    });
  }

  vinculaPerfilASistemaVistas() {
    if (this.vincularPerfilSVForm.valid) {
      const formVinculacion = {
        perfil: this.vincularPerfilSVForm.value.perfil,
        sistema: this.vincularPerfilSVForm.value.sistema,
        lstComponentes: this.vincularPerfilSVForm.value.lstComponentes || []
      };
      console.log('FORMULARIO VINCULA PERFIL A SISTEMA-VISTAS', formVinculacion);
      Swal.fire({
        title: '¿Desea Realizar la Vinculación?',
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#C82333",
      }).then((result) => {
        if (result.isConfirmed) {
          this._perfilService.vinculaPerfilSistemaVistas(formVinculacion.perfil, formVinculacion.sistema, formVinculacion.lstComponentes)
            .subscribe(
              (respuesta) => {
                console.log('Respuesta de la API:', respuesta);
                switch (respuesta) {
                  case 'ok':
                    console.log('Vinculación Exitosa:', respuesta);
                    Swal.fire('Vinculación Exitosa', '', 'success');
                    break;
                  case 'Vistas ya vinculadas':
                    console.log('La Vista ya se encuentra vinculada con el Sistema:', respuesta);
                    Swal.fire('La Vista ya se encuentra vinculada con el Sistema', '', 'info');
                    break;
                  case 'Sistema inexistente':
                    console.log('No existe el Sistema:', respuesta);
                    Swal.fire('No existe el Sistema', 'Error', 'error');
                    break;
                  case 'Sistema dado de baja':
                    console.log('El SISTEMA se encuentra Activo o Eliminado.', respuesta);
                    Swal.fire('El SISTEMA se encuentra Activo o Eliminado.', 'Error', 'error');
                    break;
                  default:
                    console.error('Respuesta desconocida del servidor:', respuesta);
                    Swal.fire('Error desconocido', 'Hubo un problema desconocido en la respuesta del servidor', 'error');
                }
                this._perfilService.actualizarTablaPerfiles();
                this.dialogVincularPSV.close();
              },
            );
        }
      });
    }
  }

  mostrarSistemasVinculados() {
    this._perfilService.perfilSistemasVinculados(this.perfilSVVinculada.perfil).subscribe(
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
            this.dialogVincularPSV.close();
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
          this.dialogVincularPSV.close();
        }
      },
      (error) => {
        console.error('Error Obteniendo Sistemas:', error);
        Swal.fire('Error', 'Hubo un problema al obtener los sistemas vinculados.', 'error');
      }
    );
  }

  mostrarVistasActivas(sistema: string) {
    this._vistasService.vistasSistema(sistema).subscribe(
      (respuesta: any) => {
        console.log('Respuesta de vistas:', respuesta);

        if (respuesta.listaDatos) {
          const vistas = JSON.parse(respuesta.listaDatos);

          // Filtrar las vistas que están activas
          this.vistasVinculadas = vistas.filter(vista => vista.statuss === 'Activo');

          // Verificar si hay vistas activas
          if (this.vistasVinculadas.length === 0) {
            Swal.fire({
              title: 'El Sistema seleccionado se encuentra ACTIVO.',
              text: 'Pero NO tiene Vistas Vinculadas o Activas.',
              icon: 'info',
              iconColor: '#32A652',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#3085d6'
            });
            this.cerrarDialog();
          }
        } else {
          console.error('La propiedad listaDatos en la respuesta está vacía o indefinida.');

          // Mostrar Swal si listaDatos es null o indefinida
          Swal.fire({
            title: 'El Sistema seleccionado se encuentra ACTIVO.',
            text: 'Pero NO tiene Vistas Vinculadas o Activas.',
            icon: 'info',
            iconColor: '#32A652',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#3085d6'
          });
          this.cerrarDialog();
        }
      },
      (error) => {
        console.error('Error obteniendo vistas:', error);
      }
    );
  }

  updateSelectedVistas(event: MatCheckboxChange, vistaSeleccionada: string) {
    const selectedVistas = this.vincularPerfilSVForm.get('lstComponentes') as FormArray;
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
    this.dialogVincularPSV.close();
  }
}
