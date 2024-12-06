import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { FormBuilder, FormGroup, AbstractControl, Validators } from '@angular/forms';
import  Swal  from 'sweetalert2';
import { UsuarioService } from 'src/app/gusit/usuario/Service/Usuario.service';

@Component({
  selector: 'app-dialogEditarUsuario',
  templateUrl: './dialogEditarUsuario.component.html',
  styleUrls: ['./dialogEditarUsuario.component.css']
})
export class DialogEditarUsuarioComponent implements OnInit {
  areasForm: FormGroup;
  areasData: any [] = [];   //V. almacena las areas obtenidas de la API
  statusForm: FormGroup;    //V. almacena las status obtenidas de la API
  statusData: any [] = [];
  editarUsuarioForm: FormGroup;    //V. almacena el formulario para editar

  constructor(
    private formEditarUsuarios: FormBuilder,
    public _usuarioService: UsuarioService,
    public dialogEditarUsuario: MatDialogRef<DialogEditarUsuarioComponent>,
    @Inject (MAT_DIALOG_DATA) public usuarioActualizado: any) {}

  ngOnInit() {
    this.crearFormularioEditarUsuario();
    this.mostrarAreas();
  }

  crearFormularioEditarUsuario() {    //Formulario Dinamico
    this.editarUsuarioForm = this.formEditarUsuarios.group({
      usuario: [this.usuarioActualizado.usuario],
      nombre: [this.usuarioActualizado.nombre.toUpperCase(), Validators.compose ([Validators.required, this.validarNombreCompleto])],
      apellidoPrimero: [this.usuarioActualizado.apellidoPrimero.toUpperCase(), Validators.compose ([Validators.required, this.validarNombreCompleto])],
      apellidoSegundo: [this.usuarioActualizado.apellidoSegundo.toUpperCase(), Validators.compose ([Validators.required, this.validarNombreCompleto])],
      idArea: [this.usuarioActualizado.idArea],
      idStatus: [this.usuarioActualizado.idStatus],   //Se omite campo en html para nuevas versiones, pero se declara, ya que la api lo requiere.
    });
  }

  validarEditarUsuario() {
    if (this.editarUsuarioForm.valid) {
      const formActualizaUsuario = this.editarUsuarioForm.value;
      formActualizaUsuario.idArea = formActualizaUsuario.idArea.toString();
        console.log('Datos enviados para validación:', formActualizaUsuario);

      Swal.fire({
        title: '¿Desea Actualizar Datos del Usuario?',
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#C82333",
      }).then((result) => {
        if (result.isConfirmed) {
          this._usuarioService.validaUpdateUsuario(formActualizaUsuario).subscribe(
            (respuesta) => {

              console.log('Respuesta del servidor:', respuesta);
              if (respuesta === 'Los datos fueron actualizados correctamente') {
                console.log('Los datos fueron actualizados correctamente:', respuesta);
                this.editarUsuarioForm.reset();
                Swal.fire('Usuario Actualizado con Éxito!', '', 'success');
                this._usuarioService.actualizarTablaUsuarios();
                this.dialogEditarUsuario.close();
              } else if (respuesta === 'El usuario ya existe') {
                console.log('El usuario ya existe:', respuesta);
                  Swal.fire({
                    title: 'Existe un Usuario con el mismo Registro de Nombre Completo, ¿Desea actualizarlo de igual manera?',
                      icon: 'question',
                      showCancelButton: true,
                      confirmButtonText: 'Sí',
                      cancelButtonText: 'No',
                      confirmButtonColor: "#3085d6",
                      cancelButtonColor: "#C82333",
                    }).then((result) => {
                      if (result.isConfirmed) {
                        this.editarUsuario(); // Llama al método para editar el usuario
                      } else {
                        this.cerrarDialog(); // Cierra el diálogo si se selecciona "No"
                      }
                    });
              } else if (respuesta === 'El usuario no existe') {
                console.log('El usuario no existe:', respuesta);
                Swal.fire('El usuario no existe', '', 'question');
              } else {
                console.log('Error al enviar Datos', respuesta);
                Swal.fire({
                  icon: 'error',
                  title: 'Oops...',
                  text: `Error: ${respuesta}`,
                });
              }
            },
            (error) => {
              console.error('Error en la validación:', error);
              Swal.fire({
                icon: 'error',
                title: 'Error en la Validación',
                text: `No se pudo validar la información: ${error.message}`,
              });
            }
          );
        } else {
          Swal.fire('No se actualizó el usuario', '', 'info');
        }
      });
    }
  }

  procesarActualizacionExitosa() {
    this.editarUsuarioForm.reset();
    Swal.fire('Usuario Actualizado con Éxito!', '', 'success');
    this._usuarioService.actualizarTablaUsuarios();
    this.dialogEditarUsuario.close();
  }

  editarUsuario() {
    const formActualizaUsuario = this.editarUsuarioForm.value;
    formActualizaUsuario.idArea = formActualizaUsuario.idArea.toString();
    console.log('FORMULARIO ACTUALIZADO:', formActualizaUsuario);

    // Remove the second Swal.fire confirmation
    this._usuarioService.updateUsuario(formActualizaUsuario).subscribe(
      (respuesta) => {
        switch (respuesta) {
          case 'Los datos fueron actualizados correctamente':
            console.log('Datos Enviados Correctamente Api:', respuesta);
            this.editarUsuarioForm.reset();
            Swal.fire('Usuario Actualizado', '¡EXITOSAMENTE!', 'success');
            this._usuarioService.actualizarTablaUsuarios();
            this.dialogEditarUsuario.close();
            break;

          case 'El usuario es responsable de algún sistema':
            console.error('Usuario Responsable:');
            Swal.fire('Usuario Responsable!', '', 'error');
            this.dialogEditarUsuario.close();
            break;

          default:
            console.error('Error al enviar Datos', 'Error');
            Swal.fire({icon: 'error', title: 'Oops...', text: 'Error',});
            break;
        }
      },
    );
  }

  mostrarAreas(){   //Devuelve las areas registradas en la base de datos
    this._usuarioService.catalogoAreas().subscribe (data => {
    this.areasData = JSON.parse(data.listaDatos);   //ListaDatos es la V. donde me devuelve las Areas en la Api
    this.initializeFormAreas ();
      console.log (this.areasData.length)
      console.log('Datos de áreas:', this.areasData);
    });
  }

  initializeFormAreas(): void {
    this.areasForm = this.formEditarUsuarios.group ({area: ['']});
  }

  validarNombreCompleto(control: AbstractControl): { [key: string]: boolean } | null {    //NOMBRE COMPLETO solo se visualiza en mayusculas y si registra con MIN. las convierte en MAY.
    const nombreCompleto = control.value;
    const soloLetrasMayusculas = /^[a-zA-ZÑñ\s]+$/.test(nombreCompleto);      // Aceptar solo letras mayúsculas, minúsculas, "ñ" y "Ñ", sin espacios
      if (!soloLetrasMayusculas || !nombreCompleto || nombreCompleto.trim() === '') {     // Validar si el nombre contiene caracteres no permitidos o está vacío o contiene espacios
        return { 'nombreCompletoInvalido': true };
      }

      const nombreEnMayusculas = nombreCompleto.toUpperCase();
      if (nombreCompleto !== nombreEnMayusculas) {
        control.setValue(nombreEnMayusculas);
      }
      return null;
  }

  cerrarDialog(): void {
    this.dialogEditarUsuario.close();
  }
}


