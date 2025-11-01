import { NgModule, provideBrowserGlobalErrorListeners, LOCALE_ID } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
registerLocaleData(localeEs);
//material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';



//rutas
import { Home } from './home/home';
import { CrearFormato } from './crear-formato/crear-formato';
import { OrdenServicio } from './orden-servicio/orden-servicio';
import { CrearFormatoDialog } from './crear-formato-dialog/crear-formato-dialog';
import { Confirmdialog } from './confirmdialog/confirmdialog';
import { Login } from './login/login';
import { Mensaje } from './mensaje/mensaje';
import { CrearServicioDialog } from './crear-servicio-dialog/crear-servicio-dialog';


@NgModule({
  declarations: [
    App,
    CrearFormato,
    OrdenServicio,
    Home,
    CrearFormatoDialog,
    Confirmdialog,
    Login,
    Mensaje,
    CrearServicioDialog
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatListModule,
    MatCardModule,
    MatPaginatorModule,
    MatTableModule,
    MatDialogModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatOptionModule,
    MatSelectModule,
    MatChipsModule,

  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(withEventReplay()),
    { provide: LOCALE_ID, useValue: 'es-MX' },
    { provide: MAT_DATE_LOCALE, useValue: 'es-MX' } // <-- para dd/MM/yyyy
  ],
  bootstrap: [App]
})
export class AppModule { }
