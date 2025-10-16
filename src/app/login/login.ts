import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { EquipoService } from '../service/equipo.service';
import { HttpClient } from '@angular/common/http';
import { LoginUser } from '../model/loginuser.model';
@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
   nombre: string = '';
  passwor: string = '';  // coincide con tu interfaz
  hidePassword: boolean = true; // inicialmente oculta la contraseña
  http = inject(HttpClient);

  constructor(private router: Router, private equipoService: EquipoService) {}

  /** LOGIN */
  login() {
    if (!this.nombre || !this.passwor) {
      alert('Ingrese usuario y contraseña');
      return;
    }
    
    this.equipoService.login({ nombre: this.nombre, passwor: this.passwor })
  .subscribe({
    next: res => {
      localStorage.setItem('loggedIn', 'true');
      localStorage.setItem('userId', res.userId);
      this.router.navigate(['/home']);
    },
    error: err => alert('Usuario o contraseña incorrectos')
  });

  }

  
}
