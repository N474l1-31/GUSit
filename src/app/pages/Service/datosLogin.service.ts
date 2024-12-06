import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class DatosLoginService {
  private STORAGE_KEY = 'userData';

  /***********************     VARIABLES PARA REGRESAR PERFIL Y NOMBRE COMPLETO      ***********************/
  perfil: string;
  nombreCompleto: string;
  usuario: string;

  constructor() {
    this.loadUserData();
  }

  loadUserData(): void {
    const userData = JSON.parse (localStorage.getItem(this.STORAGE_KEY));
    console.log('Datos de usuario cargados:', userData);
    if (userData){
      this.perfil = userData.perfil;
      this.nombreCompleto = userData.nombreCompleto;
      this.usuario = userData.usuario;
    }
  }

  saveUserData(): void {
    const userData = {
      perfil: this.perfil,
      nombreCompleto: this.nombreCompleto,
      usuario: this.usuario,
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify (userData));
  }

  clearUserData (): void{
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
