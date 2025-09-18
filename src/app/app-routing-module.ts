import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CrearFormato } from './crear-formato/crear-formato';
import { OrdenServicio } from './orden-servicio/orden-servicio';

const routes: Routes = [
  { path: 'crear-formato', component: CrearFormato },
  { path: 'orden-servicio', component: OrdenServicio },
  { path: '', redirectTo: '/crear-formato', pathMatch: 'full' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
