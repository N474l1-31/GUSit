import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import  Swal  from 'sweetalert2';

import { UsuarioService } from '../../Service/Usuario.service';
import { SistemasService } from 'src/app/gusit/sistemas/Service/Sistemas.service';
import { AllSistemas } from 'src/app/gusit/sistemas/Interface/allSistemas';

@Component({
  selector: 'app-dialogVincularUsuario',
  templateUrl: './dialogVincularUsuario.component.html',
  styleUrls:['./dialogVincularUsuario.component.css']
})
export class DialogVincularUsuarioComponent implements OnInit {
  vincularUsuarioPSForm: FormGroup;    //V. almacena el formulario para realizar la vinculacion
  DtT: AllSistemas[] = [];  //DtT es la V. donde regresa los resultados de la API
  sistemasActivos: any [];
  selectedSistema: string = '';
  selectedPerfil: string = '';
  perfiles: any[] = [];

constructor(
  private formVinculaUsuario: FormBuilder,
  public _usuarioService: UsuarioService,
  public _sistemasService: SistemasService,
  public dialogVincularUsuarioSP: MatDialogRef<DialogVincularUsuarioComponent>,
  @Inject (MAT_DIALOG_DATA) public usuarioVinculado: any) {}


  ngOnInit() {
    this.creaFormularioVinculaUsuario();
    this.mostrarSistemasActivos();
  }

  creaFormularioVinculaUsuario(){
    this.vincularUsuarioPSForm = this.formVinculaUsuario.group({
      sistema: ['', [Validators.required]],
      perfil: ['', [Validators.required]],
      usr: [this.usuarioVinculado.usuario, [Validators.required]],
    })
  }

  vincularUsuario() {
    if (this.vincularUsuarioPSForm.valid) {
      const formVinculacion = this.vincularUsuarioPSForm.value;
      console.log('FORMULARIO VINCULA USUARIO/SISTEMA/PERFIL', formVinculacion);

      Swal.fire({
        title: ' ¿Desea Realizar Vinculación?',
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#C82333",
      }).then((result) => {
        if (result.isConfirmed) {
          this._usuarioService.vincularUsuarioSP(formVinculacion.sistema, formVinculacion.perfil, formVinculacion.usr)
            .subscribe(
              (respuesta) => {
                if (respuesta === 'ok') {
                  console.log('Vinculación Exitosa:', respuesta);
                  Swal.fire('Vinculación Exitosa', '', 'success');
                  this._usuarioService.actualizarTablaUsuarios();
                  this.dialogVincularUsuarioSP.close();
                } else if (respuesta === 'La vinculacion ya existe') {
                  console.log('El Usuario ya se encuentra con la Vinculación Solicitada:', respuesta);
                  Swal.fire('Ya se encuentra vinculado', '', 'error');
                  this._usuarioService.actualizarTablaUsuarios();
                  this.dialogVincularUsuarioSP.close();
                }
              },
              (error) => {
                console.error('Error en la solicitud:', error);
              }
            );
        }
      });
    }
  }

  mostrarSistemasActivos() {   //DetallesSistema **API
    this._sistemasService.detallesTablaSistemas().subscribe(    //La respuesta de la Api ya esta en formato JSON, no se necesita una hacer un JSON.parse().
      (data: any) => {
        if (data.DtT) {
          this.DtT = data.DtT;
          this.sistemasActivos = this.DtT.filter((sistema) => sistema.status === 'Activo' || sistema.status === 'Proceso');
          console.log('Sistemas Activos :', this.sistemasActivos);
        } else {
          console.error('La propiedad DtT en la respuesta está vacía o indefinida.');
        }
      },
      (error) => {
        console.error('Error Obteniendo Sistemas:', error);
      }
    );
  }

  onSelectSistema(nombreSistema: string){
    this.selectedSistema = nombreSistema;   //Guarda el sistema seleccionado
    this.mostrarPerfilesPorSistema(nombreSistema);
  }

  mostrarPerfilesPorSistema(nombreSistema: string) {
    this._sistemasService.perfilesPorSistemas(nombreSistema).subscribe(
      (data: any) => {
        if (data.DtT && data.DtT.length > 0) {
          this.perfiles = data.DtT.map((perfil: any) => perfil.perfil);
          console.log('Perfiles Vinculados:', this.perfiles);
        } else if (data.DtT && data.DtT.length === 0) {
          console.warn('El sistema seleccionado no tiene perfiles vinculados.');
          Swal.fire({
            title: '¡El Sistema seleccionado!',
            text: 'No cuenta con Perfiles Vinculados',
            icon: 'info',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: "#3085d6"
          }).then((result) => {
            if (result.isConfirmed) {
              this.cerrarDialog();  // Si estás usando MatDialog
            }
          });
        } else {
          console.error('La propiedad DtT en la respuesta está vacía o indefinida.');
        }
      },
      (error) => {
        console.error('Error Obteniendo Perfiles:', error);
      }
    );
  }


  cerrarDialog(): void {
    this.dialogVincularUsuarioSP.close();
  }
}
