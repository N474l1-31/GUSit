import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { SistemasService } from '../../Service/Sistemas.service';

@Component({
  selector: 'app-dialogSistemaApagar',
  templateUrl: './dialogSistemaApagar.component.html',
  styleUrls: ['./dialogSistemaApagar.component.css']
})
export class DialogSistemaApagarComponent implements OnInit {
  apagarSistemaForm: FormGroup;

  constructor(
    private formApagarSistema: FormBuilder,
    public _sistemasService: SistemasService,
    public dialogApagarSistema: MatDialogRef<DialogSistemaApagarComponent>,
    @Inject(MAT_DIALOG_DATA) public sistemaApagado: any) {}

  ngOnInit() {
    this.crearFormularioApagarSistema();
    console.log("Formulario", this.apagarSistemaForm);
  }

  crearFormularioApagarSistema() {
    this.apagarSistemaForm = this.formApagarSistema.group({
      version: [this.sistemaApagado.versionSistema || '', [Validators.required]],
      nombre: [this.sistemaApagado.nombre || '', [Validators.required]],
    });
  }

  apagarSistema() {
    if (this.apagarSistemaForm.valid) {
      const formApagarSistema = {
        version: this.apagarSistemaForm.value.version,
        nombre: this.apagarSistemaForm.value.nombre,
      };
      console.log('FORMULARIO APAGAR SISTEMA', formApagarSistema);
      Swal.fire({
        title: '¿Desea Apagar el Sistema?',
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#C82333",
      }).then((result) => {
        if (result.isConfirmed) {
          this._sistemasService.apagarSistema(formApagarSistema.version, formApagarSistema.nombre)
            .subscribe(
              (respuesta) => {
                if (respuesta === 'ok') {
                  console.log('ok:', respuesta);
                  Swal.fire('El Sistema se ha Apagado con Éxito', '', 'success');
                  this._sistemasService.actualizarTablaSistemas();
                  this.dialogApagarSistema.close();
                } else if (respuesta === 'Sistema dado de baja') {
                  console.log('Sistema dado de baja:', respuesta);
                  Swal.fire('Sistema dado de baja', '', 'warning');
                  this._sistemasService.actualizarTablaSistemas();
                  this.dialogApagarSistema.close();
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
    this.dialogApagarSistema.close();
  }
}
