import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/* API REFERENCE */
import {MatInputModule} from '@angular/material/input';                     /* INTRODUCIR DATOS */
import {MatCardModule} from '@angular/material/card';                       /* TARJETA */
import {MatCheckboxModule} from '@angular/material/checkbox';               /* CHECKBOX */
import {MatRadioModule } from '@angular/material/radio';                    /* RADIOBUTTON */
import {MatButtonModule} from '@angular/material/button';                   /* BOTONES */
import {MatTableModule} from '@angular/material/table';                     /* TABLAS */
import {MatPaginatorModule} from '@angular/material/paginator';             /* PAGINADOR */
import {MatSortModule} from '@angular/material/sort';                       /* CLASIFICACION*/
import {FormsModule, ReactiveFormsModule } from '@angular/forms';           /* FORMULARIOS REACTIVOS */
import {MatTabsModule} from '@angular/material/tabs';                       /* PESTAÑAS */
import {MatSidenavModule} from '@angular/material/sidenav';                 /* AMBURGESA*/
import {MatFormFieldModule} from "@angular/material/form-field";            /* CAMPOS DEL FORMULARIO */
import {MatSelectModule} from '@angular/material/select';                   /* LISTA DESPLEGABLE */
import {MatDialogModule} from '@angular/material/dialog';                   /* DIALOGOS EMERGENTES */
import {MatStepperModule} from '@angular/material/stepper';                 /* */
import {MatIconModule} from '@angular/material/icon';                       /* ICONOS */
import {NgbModalModule} from '@ng-bootstrap/ng-bootstrap';                  /* MODALES BOOTSTRAP*/
import {FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';           /* SWEET ALERTAS*/
import {MatMenuModule } from '@angular/material/menu';
import {MatSlideToggleModule } from '@angular/material/slide-toggle';      /* SLIDER ACTIVO/INACTIVO */
import {MatGridListModule} from '@angular/material/grid-list';             /* GRILLAS */
import {MatExpansionModule} from '@angular/material/expansion';
import {MatDatepickerModule} from '@angular/material/datepicker';          /* SELECTOR DE FECHAS*/
import {MatNativeDateModule} from '@angular/material/core';                /* FORMATO DE FECHAS*/

/*VISTAS AGREGADAS AL SISTEMA */
import { GusitRoutingModule } from './gusit-routing.module';
import { UsuarioComponent } from './usuario/usuario.component';
import { PerfilComponent } from './perfil/perfil.component';
import { SistemasComponent } from './sistemas/sistemas.component';
import { VistasComponent } from './vistas/vistas.component';
import { AuditoriaComponent } from './auditoria/auditoria.component';
import { Error_404Component } from './Error/Error_404/error_404/error_404.component';


/*  Debo Importar en el MODULE.TS el componente donde quiero definir lo que necesito para utilizar ANGULAR MATERIAL */
/* SI QUIERO OCUPAR LOS MODALES DE CUALQUIER VISTA (Usuario, Perfil etc..) DEBO AGREGARLO AQUI PARA PODER OCUPAR LOS COMPONENTES DE ANGULAR*/

/* USUARIO */
import { DialogRegistrarUsuarioComponent } from './usuario/Modales/dialogRegistrarUsuario/dialogRegistrarUsuario.component';
import { DialogActaResponsivaComponent } from './usuario/Modales/dialogActaResponsiva/dialogActaResponsiva.component';
import { DialogDetallesUsuarioComponent } from './usuario/Modales/dialogDetallesUsuario/dialogDetallesUsuario.component';     /* DetallesUsuario */
import { DialogEditarUsuarioComponent } from './usuario/Modales/dialogEditarUsuario/dialogEditarUsuario.component';     /* EditarUsuario */
import { DialogResetPasswordComponent } from './usuario/Modales/dialogResetPassword/dialogResetPassword.component';     /* ResetPassword */
import { DialogVincularUsuarioComponent } from './usuario/Modales/dialogVincularUsuario/dialogVincularUsuario.component';     /* Vincular Usuario */
import { DialogDesvincularUsuarioComponent } from './usuario/Modales/dialogDesvincularUsuario/dialogDesvincularUsuario.component';
import { DialogCambiarPerfilComponent } from './usuario/Modales/dialogCambiarPerfil/dialogCambiarPerfil.component';

/* PERFIL */
import { DialogRegistrarPerfilComponent } from './perfil/Modales/dialogRegistrarPerfil/dialogRegistrarPerfil.component';      /* RegistrarPerfil */
import { DialogDetallesPerfilComponent } from './perfil/Modales/dialogDetallesPerfil/dialogDetallesPerfil.component';
import { DialogPerfilVincularSistemaComponent } from './perfil/Modales/dialogPerfilVincularSistema/dialogPerfilVincularSistema.component';      /* VincularPerfil-con-Sistema */
import { DialogPerfilDesvincularSistemaComponent } from './perfil/Modales/dialogPerfilDesvincularSistema/dialogPerfilDesvincularSistema.component';     /* DesvincularPerfil-de-Sistema */
import { DialogPerfilVinculaVistasComponent } from './perfil/Modales/dialogPerfilVinculaVistas/dialogPerfilVinculaVistas.component';
import { DialogPerfilDesvinculaVistasComponent } from './perfil/Modales/dialogPerfilDesvinculaVistas/dialogPerfilDesvinculaVistas.component';
import { DialogDetallesPerfilSistemaVistasComponent } from './perfil/Modales/dialogDetallesPerfilSistemaVistas/dialogDetallesPerfilSistemaVistas.component';


/* SISTEMA */
import { DialogRegistrarSistemaComponent } from './sistemas/Modales/dialogRegistrarSistema/dialogRegistrarSistema.component';     /* RegistrarSistema */
import { DialogEditarSistemaComponent } from './sistemas/Modales/dialogEditarSistema/dialogEditarSistema.component';      /*EditarSistema */
import { DialogCambiarResponsableSistemaComponent } from './sistemas/Modales/dialogCambiarResponsableSistema/dialogCambiarResponsableSistema.component';
import { DialogSistemaEncenderComponent } from './sistemas/Modales/dialogSistemaEncender/dialogSistemaEncender.component';
import { DialogSistemaApagarComponent } from './sistemas/Modales/dialogSistemaApagar/dialogSistemaApagar.component';
import { DialogSistemaActivarComponent } from './sistemas/Modales/dialogSistemaActivar/dialogSistemaActivar.component';
import { DialogSistemaVinculaPerfilesComponent } from './sistemas/Modales/dialogSistemaVinculaPerfiles/dialogSistemaVinculaPerfiles.component';
import { DialogSistemaDesvinculaPerfilesComponent } from './sistemas/Modales/dialogSistemaDesvinculaPerfiles/dialogSistemaDesvinculaPerfiles.component';
import { DialogSistemaVinculaUsuariosComponent } from './sistemas/Modales/dialogSistemaVinculaUsuarios/dialogSistemaVinculaUsuarios.component';
import { DialogSistemaDesvinculaUsuariosComponent } from './sistemas/Modales/dialogSistemaDesvinculaUsuarios/dialogSistemaDesvinculaUsuarios.component';
import { DialogSistemaVinculaVistasComponent } from './sistemas/Modales/dialogSistemaVinculaVistas/dialogSistemaVinculaVistas.component';
import { DialogSistemaDesvinculaVistasComponent } from './sistemas/Modales/dialogSistemaDesvinculaVistas/dialogSistemaDesvinculaVistas.component';
import { DialogDetallesSistemaUsuariosComponent } from './sistemas/Modales/dialogDetallesSistemaUsuarios/dialogDetallesSistemaUsuarios.component';
import { DialogDetallesSistemaPerfilesComponent } from './sistemas/Modales/dialogDetallesSistemaPerfiles/dialogDetallesSistemaPerfiles.component';
import { DialogDetallesSistemaVistasComponent } from './sistemas/Modales/dialogDetallesSistemaVistas/dialogDetallesSistemaVistas.component';
import { DialogDetallesSistemaPerfilVistasComponent } from './sistemas/Modales/dialogDetallesSistemaPerfilVistas/dialogDetallesSistemaPerfilVistas.component';
import { DialogDetallesSistemaPerfilVistaControlesComponent } from './sistemas/Modales/dialogDetallesSistemaPerfilVistaControles/dialogDetallesSistemaPerfilVistaControles.component';


/* VISTA */
import { DialogRegistrarVistaComponent } from './vistas/Modales/dialogRegistrarVista/dialogRegistrarVista.component';
import { DialogVistaVincularSistemaComponent } from './vistas/Modales/dialogVistaVincularSistema/dialogVistaVincularSistema.component';
import { DialogVistaDesvincularSistemaComponent } from './vistas/Modales/dialogVistaDesvincularSistema/dialogVistaDesvincularSistema.component';
import { DialogVistaVincularSistemaPerfilComponent } from './vistas/Modales/dialogVistaVincularSistemaPerfil/dialogVistaVincularSistemaPerfil.component';
import { DialogVistaDesvincularSistemaPerfilComponent } from './vistas/Modales/dialogVistaDesvincularSistemaPerfil/dialogVistaDesvincularSistemaPerfil.component';
import { DialogDetallesVistaSistemaPerfilesComponent } from './vistas/Modales/dialogDetallesVistaSistemaPerfiles/dialogDetallesVistaSistemaPerfiles.component';


@NgModule({
  declarations: [
    UsuarioComponent,
    PerfilComponent,
    SistemasComponent,
    VistasComponent,
    AuditoriaComponent,
    Error_404Component,

    DialogRegistrarUsuarioComponent,
    DialogActaResponsivaComponent,
    DialogDetallesUsuarioComponent,
    DialogEditarUsuarioComponent,
    DialogResetPasswordComponent,
    DialogVincularUsuarioComponent,
    DialogDesvincularUsuarioComponent,
    DialogCambiarPerfilComponent,

    DialogRegistrarPerfilComponent,
    DialogDetallesPerfilComponent,
    DialogPerfilVincularSistemaComponent,
    DialogPerfilDesvincularSistemaComponent,
    DialogPerfilVinculaVistasComponent,
    DialogPerfilDesvinculaVistasComponent,
    DialogDetallesPerfilSistemaVistasComponent,
    DialogSistemaApagarComponent,
    DialogSistemaActivarComponent,
    DialogRegistrarSistemaComponent,
    DialogEditarSistemaComponent,
    DialogCambiarResponsableSistemaComponent,
    DialogSistemaEncenderComponent,
    DialogSistemaVinculaPerfilesComponent,
    DialogSistemaDesvinculaPerfilesComponent,
    DialogSistemaVinculaUsuariosComponent,
    DialogSistemaDesvinculaUsuariosComponent,
    DialogSistemaVinculaVistasComponent,
    DialogSistemaDesvinculaVistasComponent,
    DialogDetallesSistemaUsuariosComponent,
    DialogDetallesSistemaPerfilesComponent,
    DialogDetallesSistemaVistasComponent,
    DialogDetallesSistemaPerfilVistasComponent,
    DialogDetallesSistemaPerfilVistaControlesComponent,

    DialogRegistrarVistaComponent,
    DialogVistaVincularSistemaComponent,
    DialogVistaDesvincularSistemaComponent,
    DialogVistaVincularSistemaPerfilComponent,
    DialogVistaDesvincularSistemaPerfilComponent,
    DialogDetallesVistaSistemaPerfilesComponent,
  ],

  imports: [
    CommonModule,
    GusitRoutingModule,
    MatInputModule,
    MatCardModule,
    MatCheckboxModule,
    MatRadioModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatSidenavModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
    MatIconModule,
    SweetAlert2Module,
    MatSortModule,
    MatStepperModule,
    NgbModalModule,
    FontAwesomeModule,
    MatMenuModule,
    MatSlideToggleModule,
    MatGridListModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],

  providers: [

  ],
  exports: [

  ]

})
export class GusitModule { }
