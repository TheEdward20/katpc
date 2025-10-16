import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App {
 constructor(public router: Router) {}

  isLoggedIn(): boolean {
    return localStorage.getItem('loggedIn') === 'true';
  }

  showToolbar(): boolean {
    // Ocultar toolbar en /login
    return this.router.url !== '/login' && this.isLoggedIn();
  }

  logout() {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('userId');
    this.router.navigate(['/login']);
  }

  title(): string {
    return 'KatPC';
  }
}
