import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CrearFormato } from './crear-formato/crear-formato';
import { OrdenServicio } from './orden-servicio/orden-servicio';
import { Home } from './home/home';
import { Login } from './login/login';
import { AuthGuard } from './auth.guard/auth.guard';

const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'home', component: Home, canActivate: [AuthGuard] },
  { path: 'crear-formato', component: CrearFormato, canActivate: [AuthGuard] },
  { path: 'orden-servicio', component: OrdenServicio, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
