import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { SistemasService } from '../../Service/Sistemas.service';

@Component({
  selector: 'app-dialogSistemaActivar',
  templateUrl: './dialogSistemaActivar.component.html',
  styleUrls: ['./dialogSistemaActivar.component.css']
})
export class DialogSistemaActivarComponent implements OnInit {
  activarSistemaForm: FormGroup;

  constructor(
    private formActivarSistema: FormBuilder,
    public _sistemasService: SistemasService,
    public dialogActivaristema: MatDialogRef<DialogSistemaActivarComponent>,
    @Inject(MAT_DIALOG_DATA) public sistemaActivo: any) {}

  ngOnInit() {
    this.crearFormularioActivarSistema();
      console.log("Formulario", this.activarSistemaForm);
  }

  crearFormularioActivarSistema() {
    this.activarSistemaForm = this.formActivarSistema.group({
      version: [this.sistemaActivo.versionSistema || '', [Validators.required]],
      nombre: [this.sistemaActivo.nombre || '', [Validators.required]],
    });
  }

  activarSistema() {
    if (this.activarSistemaForm.valid) {
      const formActivarSistema = {
        version: this.activarSistemaForm.value.version,
        nombre: this.activarSistemaForm.value.nombre,
      };
        console.log('FORMULARIO ACTIVAR SISTEMA', formActivarSistema);
      Swal.fire({
        title: '¿Desea Activar el Sistema?',
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#C82333",
      }).then((result) => {
        if (result.isConfirmed) {
          this._sistemasService.activarSistema(formActivarSistema.version, formActivarSistema.nombre)
            .subscribe(
              (respuesta) => {
                console.log('RESPUESTA DE API SPARKLE:', respuesta); // Imprimir respuesta de éxito

                switch (respuesta) {
                  case 'ok':
                    console.log('ok', respuesta);
                    Swal.fire('El Sistema se Activó con Éxito', '', 'success');
                    this._sistemasService.actualizarTablaSistemas();
                    this.dialogActivaristema.close();
                    break;
                  case 'El sistema NO existe.':
                    console.log('El Sistema ya se encuentra Activo', respuesta);
                    Swal.fire('El Sistema ya se encuentra Activo', '', 'warning');
                    this._sistemasService.actualizarTablaSistemas();
                    this.dialogActivaristema.close();
                    break;
                  case 'EL sistema no tiene usuarios':
                    console.log('El Sistema NO tiene Usuarios Vinculados', respuesta);
                    Swal.fire('El Sistema NO tiene Usuarios Vinculados', '', 'info');
                    this._sistemasService.actualizarTablaSistemas();
                    this.dialogActivaristema.close();
                    break;
                  case 'El sistema no tiene vistas':
                    console.log('El Sistema NO tiene Vistas Vinculadas', respuesta);
                    Swal.fire('El Sistema NO tiene Vistas Vinculadas', '', 'info');
                    this._sistemasService.actualizarTablaSistemas();
                    this.dialogActivaristema.close();
                    break;
                  default:
                    console.log('Respuesta no manejada:', respuesta);
                    Swal.fire('Respuesta de error de la API', '', 'error');
                    this.dialogActivaristema.close();
                }
              },
            );
        }
      });
    }
  }

  cerrarDialog(): void {
    this.dialogActivaristema.close();
  }
}

