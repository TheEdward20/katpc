import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { EquipoService } from '../service/equipo.service';
import { HttpClient } from '@angular/common/http';
import { LoginUser } from '../model/loginuser.model';
import { MatDialog } from '@angular/material/dialog';
import { Mensaje } from '../mensaje/mensaje';
@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  nombre: string = '';
  passwor: string = ''; // coincide con tu interfaz
   mensajeAlerta: string = '';
  hidePassword: boolean = true; // inicialmente oculta la contraseña
  http = inject(HttpClient);

  constructor(private router: Router, private equipoService: EquipoService,  private dialog: MatDialog) {}

 /** LOGIN */
  login() {
    if (!this.nombre || !this.passwor) {
       this.dialog.open(Mensaje, {
      data: 'Ingrese usuario y contraseña'
    });
      return;
    }

    this.equipoService.login({ nombre: this.nombre, passwor: this.passwor }).subscribe({
      next: (res) => {
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('userId', res.userId);
        this.router.navigate(['/home']);
      },
     error: err => {
       const dialogRef = this.dialog.open(Mensaje, {
        data: 'Usuario o contraseña incorrectos'
      });
       dialogRef.afterClosed().subscribe(() => {
      this.limpiarCampos();
    });
    }      
    });
  }  

  limpiarCampos() {
    this.nombre = '';
    this.passwor = '';
  }
}
