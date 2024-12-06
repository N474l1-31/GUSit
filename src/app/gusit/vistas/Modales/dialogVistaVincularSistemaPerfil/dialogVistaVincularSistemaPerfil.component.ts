import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import  Swal  from 'sweetalert2';

import { VistasService } from '../../Service/Vistas.service';
import { SistemasService } from 'src/app/gusit/sistemas/Service/Sistemas.service';
import { PerfilesService } from 'src/app/gusit/perfil/Service/Perfiles.service';

@Component({
  selector: 'app-dialogVistaVincularSistemaPerfil',
  templateUrl: './dialogVistaVincularSistemaPerfil.component.html',
  styleUrls: ['./dialogVistaVincularSistemaPerfil.component.css']
})
export class DialogVistaVincularSistemaPerfilComponent implements OnInit {
  vincularVistaSPForm: FormGroup;
  sistemasActivosVinculados: any [] = [];
  selectedSistema: string = '';
  selectedPerfil: string = '';
  perfiles: any[] = [];     //Guarda los Perfiles

  constructor(
    private formVistaVinculaSP: FormBuilder,
    public _vistasService: VistasService,
    public _sistemasService: SistemasService,
    public _perfilService: PerfilesService,
    public dialogVincularVSP: MatDialogRef <DialogVistaVincularSistemaPerfilComponent>,
    @Inject (MAT_DIALOG_DATA) public vistaSPVinculada: any) { }

  ngOnInit() {
    this.crearFormularioVinculaVistaSP();
    this.mostrarSistemasVinculados();
  }

  crearFormularioVinculaVistaSP(){
    this.vincularVistaSPForm = this.formVistaVinculaSP.group({
      perfil: [this.vistaSPVinculada.perfil, [Validators.required]],
      sistema: ['', [Validators.required]],
      lstComponentes: new FormControl(this.vistaSPVinculada.vista)
  });
  }

  vinculaVistaASistemaPerfil(){
    if (this.vincularVistaSPForm.valid) {
      const formVinculacion = {
        perfil: this.vincularVistaSPForm.value.perfil,
        sistema: this.vincularVistaSPForm.value.sistema,
        lstComponentes: this.vincularVistaSPForm.value.lstComponentes || []
      };
      console.log('FORMULARIO VINCULA VISTA A SISTEMA-PERFIL', formVinculacion);
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
                    console.log('Vinculacion Exitosa:', respuesta);
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
                    console.log('El SISTEMA se encuentra Apagado.', respuesta);
                    Swal.fire('El SISTEMA se encuentra Apagado.', 'Error', 'error');
                    break;
                  default:
                    console.error('Respuesta desconocida:', respuesta);
                    Swal.fire('Respuesta desconocida', 'Error', 'error');
                }
                this._vistasService.actualizarTablaVistas();
                this.dialogVincularVSP.close();
              },
              (error) => {
                console.error('Error en la solicitud:', error);
              }
            )
        }
      })
    }
  }

  mostrarSistemasVinculados() {
    const vistaControl = this.vincularVistaSPForm.get('lstComponentes');
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

  onSelectSistema(nombreSistema: string){
    this.selectedSistema = nombreSistema;   //Guarda el sistema seleccionado
    this.mostrarPerfilesPorSistema(nombreSistema);
  }

  mostrarPerfilesPorSistema(nombreSistema: string){
    this._sistemasService.perfilesPorSistemas(nombreSistema).subscribe(
      (data: any) => {
        if (data.DtT){
          this.perfiles = data.DtT.map ((perfil:any) => perfil.perfil);
        } else {
          console.error('La propiedad DtT en la respuesta está vacía o indefinida.');
        }
      },
      (error) => {
        console.error('Error Obteniendo Perfiles:', error);
      }
    )
  }

  cerrarDialog(): void {
    this.dialogVincularVSP.close();
  }
}
