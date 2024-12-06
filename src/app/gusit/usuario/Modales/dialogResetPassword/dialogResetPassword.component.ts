import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

import { AllUsuarios } from '../../Interface/all-usuarios';
import { UsuarioService } from '../../Service/Usuario.service';

@Component({
  selector: 'app-dialogResetPassword',
  templateUrl: './dialogResetPassword.component.html',
  styleUrls: ['./dialogResetPassword.component.css']
})

export class DialogResetPasswordComponent implements OnInit {
  @ViewChild('passwordInput') passwordInput: any;
  password: string = '';
  lowercaseRegex = /[a-z]/;
  uppercaseRegex = /[A-Z]/;
  digitRegex = /\d/;
  symbolRegex = /[!@#$%^&*(),.?":{}|<>]/;
  hasLowercase = false;
  hasUppercase = false;
  hasDigit = false;
  hasSymbol = false;

  constructor(
    private _usuarioService: UsuarioService,
    private formPasswordUsuario: FormBuilder,
    private dialogResetPass: MatDialogRef<DialogResetPasswordComponent>,
    @Inject(MAT_DIALOG_DATA) public usuarioPass: { usuario: AllUsuarios }
  ) { }
  passwordForm = this.formPasswordUsuario.group({
    passwd: this.formPasswordUsuario.control('', [Validators.required, Validators.maxLength(10)])
  });

  ngOnInit() {
    console.log('Usuario:', this.usuarioPass?.usuario);
  }

  cambiarPassword() {
    if (this.passwordForm.valid && this.cumpleCriterios()) {
      const formPass = this.passwordForm.value.passwd;
      console.log('FORMULARIO CAMBIO DE CONTRASEÑA:', formPass);
      Swal.fire({
        title: '¿Desea Cambiar Contraseña?',
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#C82333",
      }).then((result) => {
        if (result.isConfirmed) {
          this._usuarioService.resetPassword(this.usuarioPass.usuario.usuario, formPass).subscribe(
            (respuesta) => {
              console.log('Respuesta de la API:', respuesta);
              if (respuesta === 'ok') {
                this.passwordForm.reset();
                console.log('Cambio de Contraseña Exitoso');
                Swal.fire('Cambio Exitoso!', '', 'success');
                this.dialogResetPass.close();
              } else {
                console.error('Error al cambiar la contraseña');
                Swal.fire('Error!', '', 'error');
              }
            },
            (error) => {
              console.error('Error al cambiar la contraseña', error);
              Swal.fire('Error!', '', 'error');
            }
          );
        } else if (result.isDenied) {
          this.passwordForm.reset();
          Swal.fire('NO se Cambio Contraseña', '', 'info');
          this.dialogResetPass.close();
        }
      });
    }
  }

  cumpleCriterios(): boolean {
    return this.hasLowercase && this.hasUppercase && this.hasDigit && this.hasSymbol && this.password.length >= 10;
  }

  verificaCriterios() {
    const passwordValue = this.passwordForm.get('passwd').value;
    this.hasLowercase = this.lowercaseRegex.test(passwordValue);
    this.hasUppercase = this.uppercaseRegex.test(passwordValue);
    this.hasDigit = this.digitRegex.test(passwordValue);
    this.hasSymbol = this.symbolRegex.test(passwordValue);
  }

  isCriteriaMet(criteria: boolean): boolean {
    return criteria;
  }

  truncatePassword() {
    const passwordControl = this.passwordForm.get('passwd');
    if (passwordControl.value.length > 10) {
      passwordControl.setValue(passwordControl.value.slice(0, 10));
    }
    this.password = passwordControl.value;
    this.verificaCriterios();
  }

  preventSpace(event: KeyboardEvent) {
    if (event.key === ' ') {
      event.preventDefault();
    }
  }

  getColorStyle(isValid: boolean): any {
    return { 'color': isValid ? 'green' : 'red' };
  }

  cerrarDialog(): void {
    this.dialogResetPass.close();
  }
}
