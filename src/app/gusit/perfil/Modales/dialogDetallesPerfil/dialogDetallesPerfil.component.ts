import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { AllPerfiles } from '../../Interface/allPerfiles';
import { PerfilesService } from '../../Service/Perfiles.service';

@Component({
  selector: 'app-dialogDetallesPerfil',
  templateUrl: './dialogDetallesPerfil.component.html',
  styleUrls: ['./dialogDetallesPerfil.component.css']
})
export class DialogDetallesPerfilComponent implements OnInit, OnDestroy {
  perfilDetallesSubscription: Subscription;
  perfilesDetalles: AllPerfiles;

  constructor(
    public _perfilService: PerfilesService,
    @Inject (MAT_DIALOG_DATA) public perfilDetalles: AllPerfiles) { }

  ngOnInit() {
    this.perfilDetallesSubscription = this._perfilService.perfilDetallesActualizado$.subscribe(
      detalles => {
        this.perfilesDetalles = detalles;
      })
  }

  ngOnDestroy(): void {
    if (this.perfilDetallesSubscription) {
      this.perfilDetallesSubscription.unsubscribe()
    }
  }
}




