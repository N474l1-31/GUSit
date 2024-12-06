import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { SistemasService } from '../../Service/Sistemas.service';

@Component({
  selector: 'app-dialogSistemaEncender',
  templateUrl: './dialogSistemaEncender.component.html',
  styleUrls: ['./dialogSistemaEncender.component.css']
})
export class DialogSistemaEncenderComponent implements OnInit {
  reactivarSistemaForm: FormGroup;

  constructor(
    private formReactivarSistema: FormBuilder,
    public _sistemasService: SistemasService,
    public dialogReactivaristema: MatDialogRef<DialogSistemaEncenderComponent>,
    @Inject(MAT_DIALOG_DATA) public sistemaEncendido: any) {}

  ngOnInit() {
    this.crearFormularioReactivarSistema();
    console.log("Formulario", this.reactivarSistemaForm);
  }

  crearFormularioReactivarSistema() {
    this.reactivarSistemaForm = this.formReactivarSistema.group({
      version: [this.sistemaEncendido.versionSistema || '', [Validators.required]],
      nombre: [this.sistemaEncendido.nombre || '', [Validators.required]],
    });
  }

    reactivaSistema() {
      if (this.reactivarSistemaForm.valid) {
        const formEncenderSistema = {
          version: this.reactivarSistemaForm.value.version,
          nombre: this.reactivarSistemaForm.value.nombre,
        };
        console.log('FORMULARIO ENCENDER SISTEMA', formEncenderSistema);
        Swal.fire({
          title: '¿Desea Reactivar el Sistema?',
          showCancelButton: true,
          confirmButtonText: 'Aceptar',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#C82333",
        }).then((result) => {
          if (result.isConfirmed) {
            this._sistemasService.encenderSistema(formEncenderSistema.version, formEncenderSistema.nombre)
              .subscribe(
                (respuesta) => {
                  if (respuesta === 'ok') {
                    console.log('ok:', respuesta);
                    Swal.fire('El Sistema se Reactivo con Éxito', '', 'success');

                    this._sistemasService.actualizarTablaSistemas();
                    this.dialogReactivaristema.close();

                  } else if (respuesta === 'El sistema NO existe.') {
                    console.log('Nombre o Versión Incorrectas:', respuesta);
                    Swal.fire('Nombre o Versión Incorrectas', '', 'warning');
                    this._sistemasService.actualizarTablaSistemas();
                    this.dialogReactivaristema.close();
                  }
                },
                (error) => {
                  console.error('Error al obtener la respuesta de la API:', error);
                  console.log('Respuesta de error de la API:', error.respuesta);    //Imprime la respuesta de la api
                }
              )
          }
        })
      }
    }

    cerrarDialog(): void {
      this.dialogReactivaristema.close();
    }
  }

