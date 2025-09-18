import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CrearFormato } from './crear-formato/crear-formato';
import { OrdenServicio } from './orden-servicio/orden-servicio';
import { Home } from './home/home';

const routes: Routes = [
  { path: 'home', component: Home },
  { path: 'crear-formato', component: CrearFormato },
  { path: 'orden-servicio', component: OrdenServicio },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  // wildcard (si escriben una ruta rara)
  { path: '**', redirectTo: '/home' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
