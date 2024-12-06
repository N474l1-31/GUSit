import {Component, OnInit, ViewChild, AfterViewInit, Injectable} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

import { UsuarioService } from './Service/Usuario.service';
import { AllUsuarios } from './Interface/all-usuarios';
import { SearchUsuarioSistemas } from './Interface/all-usuarios';
import { DialogDetallesUsuarioComponent } from './Modales/dialogDetallesUsuario/dialogDetallesUsuario.component';
import { DialogEditarUsuarioComponent } from './Modales/dialogEditarUsuario/dialogEditarUsuario.component';
import { DialogResetPasswordComponent } from './Modales/dialogResetPassword/dialogResetPassword.component';
import { DialogVincularUsuarioComponent } from './Modales/dialogVincularUsuario/dialogVincularUsuario.component';
import { DialogCambiarPerfilComponent } from './Modales/dialogCambiarPerfil/dialogCambiarPerfil.component';
import { DialogDesvincularUsuarioComponent } from './Modales/dialogDesvincularUsuario/dialogDesvincularUsuario.component';
import { DialogRegistrarUsuarioComponent } from './Modales/dialogRegistrarUsuario/dialogRegistrarUsuario.component';

@Injectable()
export class CustomMatPaginatorIntl extends MatPaginatorIntl {        //Cambiar el idioma de las etiquetas

  constructor() {
    super(); // Cambiar el texto de "of" a "de"
    this.itemsPerPageLabel = 'Elementos por página';
    this.nextPageLabel = 'Siguiente página';
    this.previousPageLabel = 'Página anterior';
    this.firstPageLabel = 'Primera página';
    this.lastPageLabel = 'Última página';
  }

  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) {     // Cambiar el formato del rango
      return `0 de ${length}`;
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex =
      startIndex < length
        ? Math.min(startIndex + pageSize, length)
        : startIndex + pageSize;
    return `${startIndex + 1} - ${endIndex} de ${length}`;
  };
}

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css'],
  providers: [{ provide: MatPaginatorIntl, useClass: CustomMatPaginatorIntl }],
})

export class UsuarioComponent implements OnInit, AfterViewInit {
  @ViewChild('paginacionUsuarios') paginacionUsuarios: MatPaginator; //Instancia para la paginacion de MisUsuarios
  @ViewChild('paginacionVincular') paginacionVincular: MatPaginator; //Instancia para la paginacion de VincularUsuario
  @ViewChild('paginacionDesvinculacion') paginacionDesvinculacion: MatPaginator; //Instancia para la paginacion de Des-VincularUsuario

  /********************************    VARIABLES DECLARADAS PARA  USUARIO * MIS USUARIOS  ********************************/
  listaUsuarios: AllUsuarios[] = []; //V. almacena todos los usuarios que regresa la API para poder mostrarlos y llamarlos en la tabla
  dataSource = new MatTableDataSource<AllUsuarios>();
  dataLenght: number = 0; //V. obtiene la longuitud del Array
  displayedColumns: string[] = ['Usuario', 'Nombre', 'A.Paterno', 'A.Materno', 'Acciones']; //  Nombre de las matColumnDef del Usuario
  filtroUsuario: string = ''; //V. para Filtrar por Usuario
  idUsuario: number; // Asegúrate de que idUsuario esté correctamente definido como una propiedad de tu componente, para eliminar Usuario
  usuario: any;

  /********************************    VARIABLES DECLARADAS PARA  USUARIO *  VINCULAR USUARIO  ********************************/
  listaUsuariosFiltrados: AllUsuarios[] = [];
  dataSourceVincular = new MatTableDataSource<AllUsuarios>();
  dataLenghtFiltrado: number = 0;
  altaUsuario: any;

  /********************************    VARIABLES DECLARADAS PARA  USUARIO *  DESVINCULAR USUARIO  ********************************/
  displayedColumnsDesvincular: string[] = ['Usuario','Sistema','Perfil','Status-UsuarioSistemaPerfil','Acciones',]; //  Nombre de las matColumnDef del Usuario
  listaDatos: SearchUsuarioSistemas[] = []; //BuscarAnalista es la Interfaz que contiene los datos que devuelve la Api
  busqueda: string = '';
  dataSourceDesvincular = new MatTableDataSource<SearchUsuarioSistemas>([]);
  usuarioSubscription: Subscription;
  busquedaSubcription: Subscription;

  /********************************    CONSTRUCTORES     ********************************/
  constructor(
    private _usuarioService: UsuarioService,
    private dialog: MatDialog
  ) {}

  /********************************    CICLOS DE VIDA  ********************************/
  ngOnInit(): void {
    this.muestraUsuarios();
    this.autoUsuarios();
    this.buscarUsuario();
  }

  ngAfterViewInit() {     //Se ejecuta después de que Angular ha inicializado las vistas del componente y sus vistas secundarias.
    this.dataSource.paginator = this.paginacionUsuarios;
    this.dataSource.filterPredicate = this.filtroPersonalizado();

    this.dataSourceVincular.paginator = this.paginacionVincular;
    this.dataSourceVincular.filterPredicate = this.filtroPersonalizado();

    this.dataSourceDesvincular.paginator = this.paginacionDesvinculacion;
  }

  autoUsuarios(){   // Observable - Subscribe (automaticamente carga los cambios)
    this._usuarioService.usuarioActualizado$.subscribe(() => {  // Suscribe al servicio para detectar cambios en la tablaUsuarios
      this.muestraUsuarios();
    });
  }

  /********************************    METODOS PARA MENU (USUARIO - USUARIOS)  ********************************/
  dialogRegistrarUsuario(altaUsuario: any): void {         //Dialogo Editar de Usuario
    const modRegistrar = this.dialog.open(DialogRegistrarUsuarioComponent, {
      width: '500px',
      height: '720px',
      data: altaUsuario,
      disableClose: true,
    });
    modRegistrar.afterClosed().subscribe((result) => {
      if (result === '') {
        this.muestraUsuarios();
      }
    });
  }

  muestraUsuarios() {
    this._usuarioService.detallesTablaUsuarios().subscribe(
      (data: any) => {
        try {
          const auxUsuarios = JSON.parse(data.listaDatos) as AllUsuarios[];
          this.listaUsuarios = auxUsuarios.reverse();

          // Filtrar los usuarios que tienen cierto STATUS
          this.listaUsuariosFiltrados = this.listaUsuarios.filter(
            (usuario) => usuario.statuss === 'Activo'
          );

          // Actualizar la tabla de usuarios
          this.dataSource.data = this.listaUsuarios;
          this.dataLenght = this.listaUsuarios.length;

          // Actualizar la tabla de usuarios filtrados
          this.dataSourceVincular.data = this.listaUsuariosFiltrados;
          this.dataLenghtFiltrado = this.listaUsuariosFiltrados.length;

          // Actualizar el paginador
          if (this.paginacionUsuarios) {
            this.paginacionUsuarios._changePageSize(this.paginacionUsuarios.pageSize);
          }
          if (this.paginacionVincular) {
            this.paginacionVincular._changePageSize(this.paginacionVincular.pageSize);
          }

          console.log('Usuarios devueltos por API:', this.listaUsuarios);
        } catch (error) {
          console.error('Error al analizar la respuesta de la API:', data);
        }
      },
      (error) => {
        console.error('Error obteniendo usuarios:', error);
      }
    );
  }

  changeFiltroUsuario() {
    this.filtroUsuario = '';
    this.dataSource.filter = '';           // Limpia el filtro de la primera tabla
    this.dataSourceVincular.filter = '';   // Limpia el filtro de la segunda tabla
  }

  filtroMisUsuarios() {
    const filtroUsuarioLowerCase = this.filtroUsuario.toLowerCase();
    const filterValue = JSON.stringify({ usuario: filtroUsuarioLowerCase });

    this.dataSource.filter = filterValue;             // Aplica el filtro a la primera tabla
    this.dataSourceVincular.filter = filterValue;     // Aplica el filtro a la segunda tabla
  }

  private filtroPersonalizado() {
    return (data: AllUsuarios, filter: string) => {
      const { usuario } = JSON.parse(filter);
      const usuarioLowerCase = data.usuario.toLowerCase();
      const nombreCompletoLowerCase = `${data.nombre.toLowerCase()} ${data.apellidoPrimero.toLowerCase()} ${data.apellidoSegundo.toLowerCase()}`;

      const matchUsuario = usuarioLowerCase.includes(usuario);
      const matchNombreCompleto = nombreCompletoLowerCase.includes(usuario);

      return matchUsuario || matchNombreCompleto;
    };
  }

  /********************************    METODOS PARA MENU (ACCIONES - USUARIOS)  ********************************/
  dialogDetallesUsuario(usuarioDetalles: AllUsuarios): void { //Dialogo Detalles de Perfiles
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '500px';
    dialogConfig.maxHeight = '80vh';
    dialogConfig.data = usuarioDetalles;
    dialogConfig.disableClose = false;

    const modDetalle = this.dialog.open(DialogDetallesUsuarioComponent, dialogConfig);
    modDetalle.afterClosed().subscribe((result) => {
      if (result === '') {
        this.muestraUsuarios();
      }
    });
  }

  dialogEditarUsuario(usuarioEditar: any): void {         //Dialogo Editar de Usuario
    if (usuarioEditar.statuss.toLowerCase() !== 'activo') {
      Swal.fire({
        title: '¡Usuario INACTIVO!',
        text: 'No se pueden Editar Datos',
        icon: 'info',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: "#3085d6"
      });
    } else {
      this.dialog.open(DialogEditarUsuarioComponent, {
        width: '500px',
        height: '530px',
        data: usuarioEditar,
        disableClose: true,
      });
    }
  }

  dialogCambiarPass(usuarioPass: AllUsuarios): void {         //Dialogo Cambia Contraseña
    if (usuarioPass.statuss.toLowerCase () !== 'activo') {
      Swal.fire({
        title: '¡Usuario INACTIVO!',
        text: 'No se puede Editar la Contraseña',
        icon: 'info',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: "#3085d6"
    });
    } else {
      console.log('Usuario antes de abrir el diálogo:', usuarioPass);
      this.dialog.open(DialogResetPasswordComponent, {
        width: '350px',
        height: '420px',
        data: { usuario: usuarioPass },
        disableClose: true,
      });
    }
  }

  dialogActivarUsuario(usuarioActivado: string): void {       //Dialogo Activar Usuario
    console.log ('Usuario:', usuarioActivado);
    const usuarioActivo = this.listaUsuarios.find(u => u.usuario === usuarioActivado && u.statuss === 'Activo');     // Verificar si el usuario está activo
    if (usuarioActivo) {
      Swal.fire({
        title: 'Oops!!!',
        text: '¡Usuario ACTIVO!',
        icon: 'info',
        iconColor: '#32a652',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: "#3085d6"
    });
    } else {
      Swal.fire({
        title: '¿Desea Activar el Usuario?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#C82333",
      }).then((result) => {      // Verificar si se confirmó la activación del usuario
        if (result.isConfirmed) {
          this._usuarioService.activateUsuario(usuarioActivado).subscribe(
            (respuesta) => {
              console.log('Usuario activado exitosamente.', respuesta);
              Swal.fire(
                'Usuario Activado',
                '¡EXITOSAMENTE!',
                'success'
            );
              this.muestraUsuarios();
            },
            (error) => {
              console.error('Error al activar usuario:', error);
            }
          );
        }
      });
    }
  }

  dialogEliminarUsuario(usuario: string): void {            //Dialogo Eliminar Usuario
    const usuarioInactivoOEliminado = this.listaUsuarios.find(u => u.usuario === usuario && u.statuss === 'Inactivo' );     // Verificar si el usuario está activo o en proceso
    if (usuarioInactivoOEliminado){
      console.log('El usuario ya se encuentra "Inactivo"');
      Swal.fire({
        title: 'Oops!!!',
        text: '¡Usuario INACTIVO!',
        icon: 'info',
        iconColor: '#E43F31',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: "#3085d6"
    });
    } else {
      console.log('Usuario a eliminar:', usuario); // Verifica el valor de idUsuario aquí
      Swal.fire({
        title: '¿Desea Inactivar el Usuario?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#C82333",
      }).then((result) => {
        if (result.isConfirmed) {
          //Confirma que desea eliminar
          this._usuarioService.inactivateUsuario(usuario).subscribe(
            (respuesta) => {
              if (respuesta === 'ok') {
                //La respuesta la compara directamente la respuesta de la APi
                console.log(
                  'El Usuario ha sido dado de baja con Exito:',
                  respuesta
                );
                Swal.fire(
                  'Usuario Inactivo',
                  '¡EXITOSAMENTE!',
                  'success'
                );
                this.muestraUsuarios();
              } else if (
                respuesta === 'El usuario es responsable de al menos un sistema'
              ) {
                console.log('Usuario Responsable!', respuesta);
                Swal.fire(
                  'El usuario no puede ser Eliminado, ya que se encuentra como responsable, de al menos un Sistema.',
                  '',
                  'warning'
                );
              } else if (respuesta === 'Usurio inexistente') {
                console.log('Usuario Inexistente:', respuesta);
                Swal.fire('Usuario Inexistente!', '', 'error');
              } else if (respuesta === 'El usuario ya esta dado de baja') {
                console.log('Usuario Inactivo:', respuesta);
                Swal.fire('Usuario Inactivo!', '', 'error');
              }
            },
            (error) => {
              console.error('Error en la solicitud HTTP:', error);
              Swal.fire(
                'Error',
                'Ocurrió un error al eliminar el usuario.',
                'error'
              );
            }
          );
        }
      });

    }
  }

  /********************************    METODOS PARA MENU (USUARIO - VINCULAR USUARIOS)  ********************************/
  dialogVincularUsuario(usuarioVincular: any): void {          //Dialogo Vincular Usuario
    this.dialog.open(DialogVincularUsuarioComponent, {
      width: '450px',
      height: '370px',
      data: usuarioVincular,
      disableClose: true,
    });
  }

  /********************************    METODOS PARA MENU (USUARIO - DESVINCULAR USUARIOS)  ********************************/
  dialogCambiarPerfil(usuarioPerfil: any): void {
    // Verifica si el usuario está vinculado a un sistema y perfil activo
    if (!usuarioPerfil.Sistema || !usuarioPerfil.perfil) {
      Swal.fire({
        title: 'Para Cambiar Perfil, ¡El Usuario debe estar Vinculado a un Sistema y Perfil Activo!',
        icon: 'info',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: "#3085d6"
      });
    } else if (
      usuarioPerfil.statusSistema.toLowerCase() !== 'activo' ||
      usuarioPerfil.statusUsuario.toLowerCase() !== 'activo'
    ) {
      Swal.fire({
        title: 'Usuario INACTIVO',
        text: 'No se puede cambiar Perfil.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: "#3085d6"
      });

    } else {
      this.dialog.open(DialogCambiarPerfilComponent, {
        width: '300px',
        height: '370px',
        data: usuarioPerfil,
        disableClose: true,
      });
    }
  }

  buscarUsuario() {
    if (this.busqueda.trim() === '') {
      this.dataSourceDesvincular.data = [];
      return;
    }
    this._usuarioService.allUsuariosSistemas(this.busqueda).subscribe(
      (data) => {
        try {
          const auxSistUsuarios = JSON.parse(data.listaDatos);
          if (Array.isArray(auxSistUsuarios)) {
            this.dataSourceDesvincular.data = auxSistUsuarios.map(item => ({
              usuario: item.usuario,
              statusUsuario: item.statusUsuario,
              Sistema: item.Sistema,
              statusSistema: item.statusSistema,
              perfil: item.perfil,
              statusPerfil: item.statusPerfil,
              StatusUsuarioSistemaPerfil: item.StatusUsuarioSistemaPerfil
            }));
          }
          console.log('Busqueda de Usuario', auxSistUsuarios )
        } catch (error) {
          console.error('Error parsing data:', error);
        }
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  dialogDesvincularUsuario(usuarioDesvincular: any): void {
    if (!usuarioDesvincular) {
      console.error('Los datos del usuario no son válidos.');
      Swal.fire('Los datos del usuario no son válidos.', '','info');
      return;
    }

    switch (true) {
      case (
        usuarioDesvincular.statusUsuario === 'Activo' &&
        usuarioDesvincular.statusSistema === 'Activo' &&
        usuarioDesvincular.statusPerfil === 'Activo' &&
        usuarioDesvincular.StatusUsuarioSistemaPerfil === 'Activo'
      ):
        this.openDialogDesvincularUsuario(usuarioDesvincular);
        break;

      case (usuarioDesvincular.statusUsuario === 'Inactivo'):
        console.error('El usuario debe estar activo para desvincularlo.');
        Swal.fire('El usuario debe estar activo para desvincularlo.', '','info');
        break;

      case (
        usuarioDesvincular.statusUsuario === 'Activo' &&
        usuarioDesvincular.statusSistema === 'Inactivo'
      ):
        console.error('El Sistema debe estar activo para desvincular al usuario.');
        Swal.fire('El Sistema debe estar activo para desvincular al usuario.', '','info');
        break;

      case (usuarioDesvincular.StatusUsuarioSistemaPerfil === 'Inactivo'):
        console.error('El usuario ya está desvinculado de Sistema-Perfil.');
        Swal.fire('El usuario ya está desvinculado de Sistema-Perfil.', '','info');
        break;

      default:
        console.error('No se cumplen todas las condiciones para abrir el diálogo.');
        Swal.fire('No se cumplen todas las condiciones para abrir el diálogo.', '','info');
        break;
    }
  }

  openDialogDesvincularUsuario(usuarioDesvincular: any): void {
    this.dialog.open(DialogDesvincularUsuarioComponent, {
      width: '500px',
      height: '370px',
      data: usuarioDesvincular,
      disableClose: true,
    });
  }
}
