import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import  Swal  from 'sweetalert2';

import { SistemasService } from 'src/app/gusit/sistemas/Service/Sistemas.service';
import { PerfilesService } from 'src/app/gusit/perfil/Service/Perfiles.service';
import { VistasService } from '../../Service/Vistas.service';

@Component({
  selector: 'app-dialogVistaDesvincularSistemaPerfil',
  templateUrl: './dialogVistaDesvincularSistemaPerfil.component.html',
  styleUrls: ['./dialogVistaDesvincularSistemaPerfil.component.css']
})
export class DialogVistaDesvincularSistemaPerfilComponent implements OnInit {
  desvinculaVistaSPForm: FormGroup;
  sistemasActivosVinculados: any [] = [];
  selectedSistema: string = '';
  selectedPerfil: string = '';
  perfilesActivosVinculados: any [] = [];

  constructor(
    private formVistaDesvinculaSP: FormBuilder,
    public _vistasService: VistasService,
    public _sistemasService: SistemasService,
    public _perfilService: PerfilesService,
    public dialogDesvincularVSP: MatDialogRef <DialogVistaDesvincularSistemaPerfilComponent>,
    @Inject (MAT_DIALOG_DATA) public vistaSPDesvinculada: any) { }

  ngOnInit() {
    this.crearFormularioDesvinculaSP();
    this.mostrarSistemasVinculados();
  }

  crearFormularioDesvinculaSP() {
    this.desvinculaVistaSPForm = this.formVistaDesvinculaSP.group({
      lstComponentes: new FormControl(this.vistaSPDesvinculada.vista),
      sistema: ['', [Validators.required]],
      perfil: ['', [Validators.required]],
    });
  }

  desvinculaVistaASistemaPerfil () {
    if (this.desvinculaVistaSPForm.valid){
      const formDesvinculacion = {
        perfil: this.desvinculaVistaSPForm.value.perfil.perfil,      // Solo enviamos el campo 'perfil'
        sistema: this.desvinculaVistaSPForm.value.sistema,
        lstComponentes: this.desvinculaVistaSPForm.value.lstComponentes || []
      };
      console.log('FORMULARIO DESVINCULA VISTA DE SISTEMA-PERFIL', formDesvinculacion);
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
                this._vistasService.actualizarTablaVistas();
                this.dialogDesvincularVSP.close();
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

  mostrarSistemasVinculados() {
    const vistaControl = this.desvinculaVistaSPForm.get('lstComponentes');
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

  onSelectSistema(sistema: string){
    this.selectedSistema = sistema;
    const vista = this.desvinculaVistaSPForm.get('lstComponentes').value; // Obtener el valor de la vista desde el formulario
    this.mostrarPerfilesVinculadosAVista(sistema, vista);
  }

  mostrarPerfilesVinculadosAVista (sistema: string, vista: string) {
    this._perfilService.obtenerPerfilPorSistemaVistas(sistema, vista).subscribe(
      (data) => {
        // Filtrar solo los perfiles activos
        this.perfilesActivosVinculados = data.DtT.filter((perfil) => perfil.StatusVistaPerfil === "Activo");
        console.log('Perfiles activos vinculados:', this.perfilesActivosVinculados);
      }, (error) => {
        console.error(error);
      }
    );
  }

    cerrarDialog(): void {
      this.dialogDesvincularVSP.close();
    }
}
