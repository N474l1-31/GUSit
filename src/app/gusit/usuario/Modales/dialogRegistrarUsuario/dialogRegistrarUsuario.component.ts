import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, AbstractControl} from '@angular/forms';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import  Swal  from 'sweetalert2';

import { UsuarioService } from '../../Service/Usuario.service';
import { DialogActaResponsivaComponent } from '../dialogActaResponsiva/dialogActaResponsiva.component';

@Component({
  selector: 'app-dialogRegistrarUsuario',
  templateUrl: './dialogRegistrarUsuario.component.html',
  styleUrls: ['./dialogRegistrarUsuario.component.css']
})
export class DialogRegistrarUsuarioComponent implements OnInit {
  altaUsuarioForm: FormGroup;    //Declara Formulario
  generapass: string = '';    //V. almacena la Pass. generada
  areasData: any [] = [];   //V. almacena las areas obtenidas de la API
  areasForm: FormGroup;
  generandoContraseña = false;
  generandoActa = false;

  constructor(
    private toastr: ToastrService,
    private formUsuarios: FormBuilder,
    private _usuarioService: UsuarioService,
    private dialog: MatDialog,
    public dialogRegistrarUsuario: MatDialogRef<DialogRegistrarUsuarioComponent>,
  ) { }

  ngOnInit(): void {
    this.crearFormularioAltaUsuario();
    this.mostrarAreas();
  }

  crearFormularioAltaUsuario(){     //Formulario Dinamico
    this.altaUsuarioForm = this.formUsuarios.group({      //  Valida Campos del Formulario de Registro, debe tener la misma estructura que la de la API debe tener todos los campos
      nombre: this.formUsuarios.control ('', [Validators.required, this.validarNombreCompleto]),
      apellidoPrimero: this.formUsuarios.control ('', [Validators.required, this.validarNombreCompleto]),
      apellidoSegundo: this.formUsuarios.control ('', [Validators.required, this.validarNombreCompleto]),
      usuario: this.formUsuarios.control ('', [Validators.required, this.validarUsuario] ),
      passwd: this.formUsuarios.control('', Validators.required),
      idArea:this.formUsuarios.control ('' , Validators.required),
    });
  }

  validarRegistroUsuario() {
    if (this.altaUsuarioForm.valid) {
        const formRegistraUsuario = this.altaUsuarioForm.value;
        formRegistraUsuario.idArea = formRegistraUsuario.idArea.toString();
        console.log('FORMULARIO ALTA USUARIO enviado al Servidor:', formRegistraUsuario);
        Swal.fire({
            title: '¿Desea Registrar Usuario?',
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#C82333",
        }).then((result) => {
            if (result.isConfirmed) {
                this._usuarioService.validaAddUsuario(formRegistraUsuario).subscribe(
                    (respuesta) => {
                        switch (respuesta) {
                            case 'Usuario creado correctamente':
                                console.log('Datos Enviados Correctamente:', respuesta);
                                this.altaUsuarioForm.reset();
                                Swal.fire('Usuario Registrado con Exito!', '', 'success');
                                this._usuarioService.actualizarTablaUsuarios();
                                this.dialogRegistrarUsuario.close();
                                break;
                            case 'El usuario ya existe':
                                console.log('Usuario ya existe:', respuesta);
                                Swal.fire('El Usuario ya existe', '', 'question');
                                break;
                            case 'El nombre del usuario ya existe':
                                console.log('El nombre del usuario ya existe:', respuesta);
                                Swal.fire({
                                    title: 'Existe un Usuario con el mismo Registro de Nombre Completo, ¿Desea agregarlo de igual manera?',
                                    showCancelButton: true,
                                    confirmButtonText: 'Sí',
                                    cancelButtonText: 'No',
                                    confirmButtonColor: "#3085d6",
                                    cancelButtonColor: "#C82333",
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        this.registrarUsuario(); // Llama al método para crear el usuario
                                    }
                                });
                                break;
                            default:
                                console.log ('Error al enviar Datos', 'Error');
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Oops...',
                                    text: 'Error',
                                });
                                break;
                        }
                    },
                );
            } else if (result.isDenied) {
                this.altaUsuarioForm.reset();
                Swal.fire('NO se registró usuario', '', 'info');
            }
        });
    }
  }

  registrarUsuario() {
    const formRegistraUsuario = this.altaUsuarioForm.value;
    formRegistraUsuario.idArea = formRegistraUsuario.idArea.toString();
    this._usuarioService.addUsuario(formRegistraUsuario).subscribe(
        (respuesta) => {
            if (respuesta === 'Usuario creado correctamente') {
                console.log('Datos Enviados Correctamente:', respuesta);
                this.altaUsuarioForm.reset();
                Swal.fire('Usuario Registrado con Éxito!', '', 'success');
                this._usuarioService.actualizarTablaUsuarios();
                this.dialogRegistrarUsuario.close();
            } else if (respuesta === 'El usuario ya existe') {
                console.log('Usuario ya existe:', respuesta);
                Swal.fire('El Usuario ya existe', '', 'question');
            } else {
                this.toastr.error('Error al enviar Datos', 'Error');
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: '!',
                });
            }
        },
        (error) => {
            console.error('Error en la solicitud:', error);
            Swal.fire('Error en la solicitud', 'info');
        }
    );
  }

  generaPASS (customPassword: string | null = null): void{  // Genera una contraseña Aleatoria
    if(customPassword){
      this.altaUsuarioForm.patchValue( {passwd: customPassword});   // Actualiza el valor del campo de contraseña
      this.generapass = customPassword;

      } else {
        const length = 10;  //Longitud de Contraseña
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+{}[]<>?'; // Caracteres válidos para la contraseña
        let result = '';
        for (let i = 0; i < length; i++) {
          const randomIndex = Math.floor(Math.random() * charset.length);
          result += charset[randomIndex];
      }
        this.altaUsuarioForm.patchValue ({passwd:result});
        this.generapass = result;
      }
  }

  mostrarAreas(){   //Devuelve las areas registradas en la base de datos
    this._usuarioService.catalogoAreas().subscribe (data => {
    this.areasData = JSON.parse(data.listaDatos);
    this.initializeForm ();
    console.log(this.areasData)
    });
  }

  nombreDeAreaPorID(idArea: string): string {
    const area = this.areasData.find(area => area.idArea === idArea);
    return area ? area.area : '';
}

  initializeForm(): void{
    this.areasForm = this.formUsuarios.group({area: ['']}); //Asegúrate de que el nombre sea el mismo que usas en el formulario HTML
  }

  generarCartaResponsiva() {  //Genera archivo PDF
    const idArea = this.altaUsuarioForm.get('idArea').value;
    const areaNombre = this.nombreDeAreaPorID(idArea);
    this.dialog.open(DialogActaResponsivaComponent, {
      data: { form: this.altaUsuarioForm, area: areaNombre }
    });
  }

  validarUsuario(control: AbstractControl): { [key: string]: boolean } | null {   //USUARIO solo se visualiza en minusculas y si registra con MAY. las convierte en MIN.
    const usuario = control.value;
    const soloLetrasMinusculas = /^[a-zA-Z\s]+$/.test(usuario); // Validar solo letras
      if (!soloLetrasMinusculas || !usuario || usuario.trim() === '') {
        return { 'usuarioInvalido': true };
      }
      const usuarioEnMinusculas = usuario.toLowerCase();
      if (usuario !== usuarioEnMinusculas) {
      control.setValue(usuarioEnMinusculas);
    }
    return null;
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
    this.dialogRegistrarUsuario.close();
  }
}



