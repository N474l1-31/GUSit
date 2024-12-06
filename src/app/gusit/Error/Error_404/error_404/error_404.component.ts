import { Component} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-error_404',
  templateUrl: './error_404.component.html',
  styleUrls: ['./error_404.component.css']
})
export class Error_404Component  {
  errorMessage: string;

  constructor(private route: ActivatedRoute) {
    const status = +this.route.snapshot.queryParams['status'];

    switch (status) {
      case 400:
        this.errorMessage = 'Solicitud incorrecta';
        break;
      case 401:
        this.errorMessage = 'No autorizado';
        break;
      case 402:
        this.errorMessage = 'Pago requerido';
        break;
      case 403:
        this.errorMessage = 'Prohibido';
        break;
      case 404:
        this.errorMessage = 'No se pudo encontrar la Página';
        break;
      case 405:
        this.errorMessage = 'Método no permitido';
        break;
      case 406:
        this.errorMessage = 'No aceptable';
        break;
      case 407:
        this.errorMessage = 'Autenticación proxy requerida';
        break;
      case 408:
        this.errorMessage = 'Tiempo de espera agotado';
        break;
      case 409:
        this.errorMessage = 'Conflicto';
        break;
      default:
        this.errorMessage = 'Error desconocido';
        break;
    }
  }
}
