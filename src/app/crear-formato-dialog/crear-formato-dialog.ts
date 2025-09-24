import { HttpClient } from '@angular/common/http';
import { Component, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Equipo } from '../model/equipo.model';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-crear-formato-dialog',
  standalone: false,
  templateUrl: './crear-formato-dialog.html',
  styleUrl: './crear-formato-dialog.css',
})
export class CrearFormatoDialog {
  form: FormGroup;
  formInterpretacion: FormGroup;
  loading = false; // <--- nueva variable
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CrearFormatoDialog>,
    @Inject(MAT_DIALOG_DATA) public data: Equipo,
    private http: HttpClient // <-- inyecta HttpClient
  ) {

    
    //console.log('Datos recibidos en el dialog:', data);
    this.form = this.fb.group({
      idEquipo: [data?.idEquipo],
      modelo: [data?.modelo],
      numserie: [data?.numserie],
      procesador: [data?.procesador],
      frecueProc: [data?.frecueProc],
      ram: [data?.ram],
      tiporam: [data?.tiporam],
      almacenamiento: [data?.almacenamiento],
      tipoalmacen: [data?.tipoalmacen],
      pantalla: [data?.pantalla],
      frecuepantalla: [data?.frecuepantalla],
      graficos: [data?.graficos],
      tipograficos: [data?.tipograficos],
      usooficina: [data?.usooficina],
      maximaexigencia: [data?.maximaexigencia],
      vidautil: [data?.vidautil],
      arranque: [data?.arranque],
      videoconfe: [data?.videoconfe],
      navegacion: [data?.navegacion],
      excelprograma: [data?.excelprograma],
      escrituradocum: [data?.escrituradocum],
      edicionfotoscad: [data?.edicionfotoscad],
      edicionvideo: [data?.edicionvideo],
      videojuego: [data?.videojuego],
      tecladoilumi: [data?.tecladoilumi],
      windowshello: [data?.windowshello],
      puertosusb: [data?.puertosusb],
      salidavideo: [data?.salidavideo],
      wifi: [data?.wifi],
      puertotipoc: [data?.puertotipoc],
      microfono: [data?.microfono],
      touchpad: [data?.touchpad],
      bluetooth: [data?.bluetooth],
      cd: [data?.cd],
      puertoauxiliar: [data?.puertoauxiliar],
      bocinas: [data?.bocinas],
      pantallatactil: [data?.pantallatactil],
      webcam: [data?.webcam],
      pantallad: [data?.pantallad],
      botones: [data?.pantallad]
      
    });

    this.formInterpretacion = this.fb.group({
      grado: [data?.grado],
      condicionfisica: [data?.condicionfisica],
      interpretacion: [data?.interpretacion],
      encargado: [data?.encargado],
      fechaprueba: [data?.fechaprueba]
    });
  }

 

  guardarEquipo() {
    if (this.form.valid) {
      this.loading = true; // <-- comienza loading
      const equipoActualizado: Equipo = {
        idEquipo: this.form.value.idEquipo,
        modelo: this.form.value.modelo || '',
        numserie: this.form.value.numserie || '',
        procesador: this.form.value.procesador || '',
        frecueProc: this.form.value.frecueproc || this.form.value.frecueProc, // <-- aquí
        ram: this.form.value.ram || '',
        tiporam: this.form.value.tiporam || '',
        almacenamiento: this.form.value.almacenamiento || '',
        tipoalmacen: this.form.value.tipoalmacen || '',
        pantalla: this.form.value.pantalla || '',
        frecuepantalla: this.form.value.frecuepantalla || '',
        graficos: this.form.value.graficos || '',
        tipograficos: this.form.value.tipograficos || '',
       
      };

      if (equipoActualizado.idEquipo && equipoActualizado.idEquipo > 0) {
        // UPDATE
        this.http
          .put(
            `https://localhost:7066/api/KatPCDataMaster/${equipoActualizado.idEquipo}`,
            { ...equipoActualizado, idEquipo: equipoActualizado.idEquipo } // forzar que coincida
          )
          .subscribe({
            next: (response) => {
              //console.log('Equipo actualizado:', response);
              //console.log('PUT payload:', equipoActualizado);
              window.location.reload();
              this.dialogRef.close(this.form.value);
            },
            error: (error) => {
              //console.log('PUT payload:', equipoActualizado);
              console.error('Error al actualizar el equipo:', error);
            },
          });
      } else {
        // CREATE
        this.http.post('https://localhost:7066/api/KatPCDataMaster', equipoActualizado).subscribe({
          next: (response) => {
            console.log('Equipo guardado:', response);
            window.location.reload();
            this.dialogRef.close(this.form.value);
          },
          error: (error) => {
            console.error('Error al guardar el equipo:', error);
          },
        });
      }
    }
  }

  siguiente() {
    
  }

  cancelar() {
    this.dialogRef.close();
  }
}
