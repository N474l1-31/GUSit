import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { FormBuilder, Validators, FormGroup, AbstractControl } from '@angular/forms';
import  Swal  from 'sweetalert2';

import { SistemasService } from '../../Service/Sistemas.service';

@Component({
  selector: 'app-dialogEditarSistema',
  templateUrl: './dialogEditarSistema.component.html',
  styleUrls: ['./dialogEditarSistema.component.css']
})
export class DialogEditarSistemaComponent implements OnInit {
  editaSistemaForm: FormGroup;

  constructor(
    private _sistemaService: SistemasService,
    private formEditarSistema: FormBuilder,
    private dialogEditarSistema: MatDialogRef<DialogEditarSistemaComponent>,
    @Inject (MAT_DIALOG_DATA) public sistemaActualizado: any){}

    ngOnInit() {
      this.crearFormularioEditarSistema();
    }

  crearFormularioEditarSistema(){     //Formulario Dinamico
    this.editaSistemaForm = this.formEditarSistema.group({
      version: [this.sistemaActualizado.versionSistema, Validators.compose ([Validators.required, this.validarVersion])],
      nombre: [this.sistemaActualizado.nombre],     //Campo deshabilitado
      descripcion: [this.sistemaActualizado.descripcion, Validators.compose ([Validators.required, this.validarDescripcion])],
      nombreResponsable: [this.sistemaActualizado.responsable],       //Se omite campo en html para nuevas versiones, pero se declaraa, ya que la api lo requiere.
      idStatus: [this.sistemaActualizado.idStatus],     //Se omite campo en html para nuevas versiones, pero se declaraa, ya que la api lo requiere.
    })
  }

  editarSistema(){
    const formData = this.editaSistemaForm.value;
      console.log('Formulario Actualizado:', formData)
      Swal.fire({   // Mostrar la alerta antes de llamar al servicio
        title: ' ¿Desea Actualizar Datos del Sistema?',
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#C82333",
      }).then((result) => {
        if (result.isConfirmed) {   //Confirma que desea guardar
        this._sistemaService.updateSistema(formData).subscribe(     // Llamada al servicio para registrar usuario
          (respuesta) => {
            if (respuesta === 'ok'){
              console.log('Datos Enviados Correctamente:', respuesta);
              Swal.fire('Sistema Actualizado con Exito!', '', 'success');
              this.editaSistemaForm.reset();    //Limpia Formulario
              this._sistemaService.actualizarTablaSistemas();
              this.dialogEditarSistema.close(); // Cerrar el diálogo después del cambio de contraseña exitoso

              } else {
                console.error('Error en la Actualización:');
                Swal.fire('Error!', '', 'error');
              }
        },
          (error) => {
            console.error('Error en la Actualización:', error);
            Swal.fire('Error!', '', 'error');
          });
 //Niega que quiera guardar
      } else if (result.isDenied) {
        Swal.fire('No se Actualizarón Datos', '', 'info')
        this.dialogEditarSistema.close();
      }
    })
  }

  validarVersion(control: AbstractControl): { [key: string]: boolean } | null {
    let vVersion = control.value;
    if (!vVersion || vVersion.trim() === '') {      // Si la versión está vacío, retornar null (indicando que es válido)
      return null;
    }
    vVersion = vVersion.charAt(0).toUpperCase() + vVersion.slice(1).toLowerCase(); // Convertir la primera letra a mayúscula y el resto a minúscula
    const primeraMayusculaPuntoYNumeros = /^[A-Z]?[a-z0-9]*(\.[a-z0-9]+)?$/.test(vVersion);     // Verificar si la versión tiene el formato correcto (mayúscula seguida opcionalmente de minúsculas, números y puntos)
    if (!primeraMayusculaPuntoYNumeros) {
      return { 'versionInvalida': true };
    }
    if (vVersion !== control.value) {
      control.setValue (vVersion)
    }
    return null;
  }

  validarDescripcion(control: AbstractControl): { [key: string]: boolean } | null {
    const vDescripcion = control.value;
    if (!vDescripcion || vDescripcion.trim() === '') {
      return { 'descripcionInvalido': true };
    }
    const palabras = vDescripcion.split(' '); // Dividir el texto en palabras
    const textoFormateado = palabras.map(palabra => {     // Mapear sobre cada palabra y capitalizar la primera letra y convertir las siguientes en minúsculas
      return palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase();
    }).join(' '); // Volver a unir las palabras en un solo string

    if (vDescripcion !== textoFormateado) {
      control.setValue(textoFormateado); // Establecer el nuevo valor en el control si ha cambiado
    }
    return null;
  }

  cerrarDialog(): void {
    this.dialogEditarSistema.close();
  }
}
