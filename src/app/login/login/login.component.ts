import { Component, OnDestroy } from '@angular/core';
import { Router, NavigationStart} from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import  Swal  from 'sweetalert2';

import { AuthService } from './Service/auth.service';
import { DatosLoginService } from 'src/app/pages/Service/datosLogin.service';

declare var particlesJS: any; // Declaración para particles.js

@Component({
selector: 'app-login',
templateUrl: './login.component.html',
styleUrls: ['./login.component.css']
})

export class LoginComponent  implements OnDestroy {
  ocultar = true;    // Visualización de la contraseña
  private routerSubscription: Subscription;
  loginForm = new FormGroup({
    usuario: new FormControl (''),
    passwd: new FormControl('')
  })

constructor(
  private router:Router,
  private _authService: AuthService,
  private toastr: ToastrService,
  private datosLoginService: DatosLoginService){
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
            this._authService.disableParticles();
          }
          });
      }

  ngOnInit() {
    this.loadParticles();
  }

  ngOnDestroy() {     // Cancela la suscripción a los eventos de cambio de ruta cuando el componente se destruye
    this.routerSubscription.unsubscribe();
  }

  loadParticles() {
    if ( this._authService.areParticlesEnabled()){
      particlesJS('particles-js',
              {
                "particles": {
                  "number": {
                    "value": 150,
                    "density": {
                      "enable": true,
                      "value_area": 800
                    }
                  },
                  "color": {
                    "value": "00468C"
                  },
                  "shape": {
                    "type": "circle",
                    "stroke": {
                      "width": 0,
                      "color": "#000000"
                    },
                    "polygon": {
                      "nb_sides": 5
                    },
                    "image": {
                      "src": "img/github.svg",
                      "width": 100,
                      "height": 100
                    }
                  },
                  "opacity": {
                    "value": 0.5,
                    "random": false,
                    "anim": {
                      "enable": false,
                      "speed": 1,
                      "opacity_min": 0.1,
                      "sync": false
                    }
                  },
                  "size": {
                    "value": 5,
                    "random": true,
                    "anim": {
                      "enable": false,
                      "speed": 40,
                      "size_min": 0.1,
                      "sync": false
                    }
                  },
                  "line_linked": {
                    "enable": true,
                    "distance": 150,
                    "color": "#f0f1fa",
                    "opacity": 0.4,
                    "width": 1
                  },
                  "move": {
                    "enable": true,
                    "speed": 6,
                    "direction": "none",
                    "random": false,
                    "straight": false,
                    "out_mode": "out",
                    "bounce": false,
                    "attract": {
                      "enable": false,
                      "rotateX": 600,
                      "rotateY": 1200
                    }
                  }
                },
                "interactivity": {
                  "detect_on": "canvas",
                  "events": {
                    "onhover": {
                      "enable": true,
                      "mode": "repulse"
                    },
                    "onclick": {
                      "enable": true,
                      "mode": "push"
                    },
                    "resize": true
                  },
                  "modes": {
                    "grab": {
                      "distance": 400,
                      "line_linked": {
                        "opacity": 1
                      }
                    },
                    "bubble": {
                      "distance": 400,
                      "size": 40,
                      "duration": 2,
                      "opacity": 8,
                      "speed": 3
                    },
                    "repulse": {
                      "distance": 200,
                      "duration": 0.4
                    },
                    "push": {
                      "particles_nb": 4
                    },
                    "remove": {
                      "particles_nb": 2
                    }
                  }
                },
                "retina_detect": true
              }
            );
            }
              }

  onLogin(usuario: string, passwd: string): void {
    this._authService.login(usuario, passwd).subscribe(
      (respuesta) => {
        switch (respuesta.mensaje) {
          case 'Inicio de sesión correcta':
            console.log('Datos de sesión correcta:', respuesta);
              this.toastr.success('Login Exitoso', 'Bienvenido a G-USIT');
              this.router.navigateByUrl('/dashboard/gusit/usuario');
              this.datosLoginService.perfil = respuesta.perfil;
              this.datosLoginService.nombreCompleto = respuesta.nombreCompleto;
              this.datosLoginService.saveUserData();
          break;

          case 'No es la contraseña':
            console.log('Contraseña Incorrecta:', respuesta);
              Swal.fire({
                icon: 'warning',
                title: 'Oops...',
                text: 'Contraseña Incorrecta',
                footer: '',
                showConfirmButton: false,
                timer: 3000,
              });
          break;

          case 'No existe el usuario':
            console.log('No existe el usuario:', respuesta);
              Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'No existe Usuario',
                footer: '',
                showConfirmButton: false,
                timer: 3000,
              });
          break;

          case 'Sistema no está activo':
            console.log('El sistema al cual pertenece se encuentra Inactivo:', respuesta);
              Swal.fire({
                icon: 'warning',
                title: 'Oops...',
                text: 'Sistema Apagado',
                footer: '',
                showConfirmButton: false,
                timer: 5000,
            });
          break;

          case 'No es la versión del Sistema':
            console.log('La version a la cual desea ingresar, es incorrecta :', respuesta);
              Swal.fire({
                icon: 'warning',
                title: 'Oops...',
                text: 'La version a la cual desea ingresar, es incorrecta',
                footer: '',
                showConfirmButton: false,
                timer: 5000,
              });
          break;

          case 'Usuario no está activo':
            console.log('Usuario Inactivo:', respuesta);
              Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Usuario Inactivo',
                footer: '',
                showConfirmButton: false,
                timer: 5000,
            });
          break;

          case 'Perfil no está activo':
            console.log('El perfil no esta activo:', respuesta);
              Swal.fire({
                icon: 'warning',
                title: 'Oops...',
                text: 'El perfil del usuario, se encuentra Inactivo',
                footer: '',
                showConfirmButton: false,
                timer: 5000,
              });
          break;

          case 'No pertenece a ese sistema':
            console.log('El perfil no esta activo:', respuesta);
              Swal.fire({
                icon: 'warning',
                title: 'Oops...',
                text: 'El usuario, no pertenece a este sistema',
                footer: '',
                showConfirmButton: false,
                timer: 5000,
              });
          break;

            default:
              console.log('Respuesta no reconocida:', respuesta);
                Swal.fire({
                  icon: 'info',
                  title: 'Información',
                  text: 'Respuesta no reconocida',
                  footer: '',
                  showConfirmButton: true,
                });
            break;
          }
        },
        (error) => {
          // Manejo de errores del servidor
          console.error('Error en el servidor:', error);
          this.toastr.error('Hubo un problema con el servidor. Intenta nuevamente más tarde.', 'Error de Servidor');
        }
      );
  }

/***********************      MUESTRA TODOS LOS USUARIOS      ***********************/
  enviaFormLogin(loginFormValues: any): void {
    this.onLogin(loginFormValues.usuario, loginFormValues.passwd);
  }
}
