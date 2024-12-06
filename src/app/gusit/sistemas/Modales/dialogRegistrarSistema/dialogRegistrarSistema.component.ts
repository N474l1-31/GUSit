import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, Validators, FormGroup, AbstractControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';

import { SistemasService } from '../../Service/Sistemas.service';
import { UsuarioService } from 'src/app/gusit/usuario/Service/Usuario.service';

@Component({
  selector: 'app-dialogRegistrarSistema',
  templateUrl: './dialogRegistrarSistema.component.html',
  styleUrls: ['./dialogRegistrarSistema.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class DialogRegistrarSistemaComponent implements OnInit {
  altaSistemasForm: FormGroup;
  usuariosData: any[] = [];

  constructor(
    private formSistemas: FormBuilder,
    public _sistemasService: SistemasService,
    public _usuariosService: UsuarioService,
    public dialogRegistrarSistema: MatDialogRef<DialogRegistrarSistemaComponent>
  ) { }

  ngOnInit() {
    this.creaFormularioAltaSistema();
    this.mostrarUsuarios();

    this.altaSistemasForm.get('nombre')?.valueChanges.subscribe(value => {
      const uppercasedValue = value?.toUpperCase();
      if (value !== uppercasedValue) {
        this.altaSistemasForm.get('nombre')?.setValue(uppercasedValue, { emitEvent: false });
      }
    });

  }

  creaFormularioAltaSistema() {
    this.altaSistemasForm = this.formSistemas.group({
      version: this.formSistemas.control('', [Validators.required, this.validarVersion]),
      nombre: this.formSistemas.control('', [Validators.required, this.validarNomeclatura]),
      descripcion: this.formSistemas.control('', [Validators.required, this.validarDescripcion]),
      nombreResponsable: this.formSistemas.control('', [Validators.required]),
      tipo: this.formSistemas.control('Web', Validators.required),
    });
  }

  crearSistema() {
    if (this.altaSistemasForm.valid) {
      const formRegistrarSistema = { ...this.altaSistemasForm.value };    // operador spread (...) Utilizado cuando se desea modificar los datos del formulario antes de enviarlos al servidor sin afectar el formulario original.
      formRegistrarSistema.nombreResponsable = formRegistrarSistema.nombreResponsable.usuario;    // Solo tomar el nombre del responsable, en lugar del objeto completo

      console.log('FORMULARIO ALTA SISTEMAS enviado al Servidor:', formRegistrarSistema);

      Swal.fire({
        title: '¿Desea Registrar un Nuevo Sistema?',
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#C82333",
      }).then((result) => {
        if (result.isConfirmed) {
          this._sistemasService.addSistema(formRegistrarSistema).subscribe(
            (respuesta) => {
              console.log('Respuesta del servidor:', respuesta);
              switch (respuesta) {
                case 'ok':
                  console.log('Sistema Registrado Correctamente:', respuesta);
                  Swal.fire('Sistema Registrado Exitosamente!', '', 'success');
                  this.altaSistemasForm.reset(); // Restablecer solo después de una operación exitosa
                  this._sistemasService.actualizarTablaSistemas();
                  this.dialogRegistrarSistema.close();
                  break;

                case 'Responsable inexistente':
                  Swal.fire('El responsable no Existe!', '', 'warning');
                  this._sistemasService.actualizarTablaSistemas();
                  break;

                default:
                  if (respuesta.startsWith('No se insertó el sistema: "+ nombre + " Version: "+ version + ", ya existe uno con ese nombre')) {
                    console.log('Error: El sistema ya existe:', respuesta);
                    Swal.fire('Error: El sistema ya existe', '', 'info');
                  } else {
                    console.error('Error desconocido en la solicitud:', respuesta);
                    Swal.fire('Error desconocido en la solicitud: ' + respuesta, '', 'error');
                  }
                  this._sistemasService.actualizarTablaSistemas();
                  this.dialogRegistrarSistema.close();
                  break;
              }
            }
          );
        }
      });
    }
  }

  mostrarUsuarios() {
    this._usuariosService.catalogoUsuarios().subscribe(data => {
      this.usuariosData = JSON.parse(data.listaDatos);
      console.log('Usuarios recuperados:', this.usuariosData);
    });
  }


  validarNomeclatura(control: AbstractControl): { [key: string]: boolean } | null {
    const vNomeclatura = control.value;

    // Expresión regular para permitir solo letras mayúsculas, números, puntos y guiones
    const allowedCharacters = /^[A-Z0-9.-]*$/;
    const isValid = allowedCharacters.test(vNomeclatura);

    if (!isValid || !vNomeclatura || vNomeclatura.trim() === '') {
      return { 'nomeclaturaInvalido': true };
    }

    // Convierte el valor a mayúsculas
    const nombreEnMayusculas = vNomeclatura.toUpperCase();
    if (vNomeclatura !== nombreEnMayusculas) {
      control.setValue(nombreEnMayusculas, { emitEvent: false }); // `emitEvent: false` para evitar emitir un evento de cambio
    }

    return null;
  }

  validarVersion(control: AbstractControl): { [key: string]: boolean } | null {
    let vVersion = control.value;

    if (!vVersion || vVersion.trim() === '') {
        return null;          // Si la versión está vacío, retornar null (indicando que es válido)
    }
    vVersion = vVersion.replace(/\s+/g, '');     // Eliminar espacios en blanco
    vVersion = vVersion.charAt(0).toUpperCase() + vVersion.slice(1).toLowerCase();    // Convertir la primera letra a mayúscula y el resto a minúscula

    const primeraMayusculaPuntoYNumeros = /^[a-zA-ZÁÉÍÓÚÑáéíóúñ\s]?[a-z0-9]*(\.[a-z0-9]+)?$/.test(vVersion);         // Verificar si la versión tiene el formato correcto (mayúscula seguida opcionalmente de minúsculas, números y puntos)
    if (!primeraMayusculaPuntoYNumeros) {
        return { 'versionInvalida': true };
    }

    if (vVersion !== control.value) {           // Si se realizaron cambios, actualizar el valor del control
        control.setValue(vVersion, { emitEvent: false });
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
    this.dialogRegistrarSistema.close();
  }
}
