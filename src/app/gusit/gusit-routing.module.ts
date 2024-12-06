import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

/*ROUTEO ENTRE PAGINAS */
import { AuditoriaComponent } from './auditoria/auditoria.component';
import { PerfilComponent } from './perfil/perfil.component';
import { SistemasComponent } from './sistemas/sistemas.component';
import { UsuarioComponent } from './usuario/usuario.component';
import { VistasComponent } from './vistas/vistas.component';

const routes: Routes = [
  /*PRIMERA RUTA A LA QUE VA A NAVEGAR*/
  { path: 'gusits', component: UsuarioComponent },  /*NOMBRE QUE DEBES DE ASIGNAR EN EL DASHBOARD DEL AuthComponent*/
  { path: 'usuario', component: UsuarioComponent },
  { path: 'perfil', component: PerfilComponent },
  { path: 'sistemas', component: SistemasComponent },
  { path: 'vistas', component: VistasComponent },
  { path: 'auditoria', component: AuditoriaComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GusitRoutingModule { }

/* EXPORTACION DE COMPONENTES */
export const routingComponents = [ UsuarioComponent, PerfilComponent, SistemasComponent, VistasComponent, AuditoriaComponent]
