import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Servicio } from '../model/servicio.model';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-crear-servicio-dialog',
  standalone: false,
  templateUrl: './crear-servicio-dialog.html',
  styleUrl: './crear-servicio-dialog.css',
  providers: [DatePipe],
})
export class CrearServicioDialog {
  form: FormGroup;
  loading = false;
  fechaFormateada: string = '';
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CrearServicioDialog>,
    @Inject(MAT_DIALOG_DATA) public data: Servicio,
    private http: HttpClient, // <-- inyecta HttpClient
    private datePipe: DatePipe
  ) {
    this.form = this.fb.group({
      idServicio: [data?.idServicio],
      folio: [data?.folio],
      marca: [data?.marca],
      modelo: [data?.modelo],
      serie: [data?.serie],
      fechaderecepcion: [data?.fechaderecepcion],
      nombre: [data?.nombre],
      telefono: [data?.telefono],
      enciende: [data?.enciende],
      wifi: [data?.wifi],
      puertosusb: [data?.puertosusb],
      bluetooth: [data?.bluetooth],
      bocinas: [data?.bocinas],
      teclado: [data?.teclado],
      pantalla: [data?.pantalla],
      microfono: [data?.microfono],
      touchpad: [data?.touchpad],
      webcam: [data?.webcam],
      observaciones: [data?.observaciones],
      pass: [data?.pass],
     // descripciondiagnostico: [data?.descripciondiagnostico],
      costo: [data?.costo],
      estado: [data?.estado]
    });
    // Cada vez que cambie la fecha, la formateamos
    this.form.get('fechaderecepcion')?.valueChanges.subscribe((valor) => {
      this.fechaFormateada = this.formatearFecha(valor);
    });
  }

  formatearFecha(fecha: Date): string {
    if (!fecha) return '';
    // Formato: martes, 28 de octubre de 2025
    return this.datePipe.transform(fecha, "EEEE, d 'de' MMMM 'de' y", 'es-MX')!;
  }
  cancelar() {
    this.loading = true;
    this.form.reset();
    this.dialogRef.close();
  }

  guardarServicio() {
    if (this.form.valid) {
      this.loading = true; // <-- comienza loading
      const servicioActualizado: Servicio = {
        // DATOS
        idServicio: this.form.value.idServicio,
        folio: this.form.value.folio,
        marca: this.form.value.marca || '',
        modelo: this.form.value.modelo || '',
        serie: this.form.value.serie || '',
        fechaderecepcion: this.form.value.fechaderecepcion || '',
        nombre: this.form.value.nombre || '',
        telefono: this.form.value.telefono || '',

        //Revision de la laptop o CPU
        enciende: this.form.value.enciende ?? false,
        wifi: this.form.value.wifi ?? false,
        puertosusb: this.form.value.puertosusb ?? false,
        bluetooth: this.form.value.bluetooth ?? false,
        bocinas: this.form.value.bocinas ?? false,
        teclado: this.form.value.teclado ?? false,
        pantalla: this.form.value.pantalla ?? false,
        microfono: this.form.value.microfono ?? false,
        touchpad: this.form.value.touchpad ?? false,
        webcam: this.form.value.webcam ?? false,

        //Descripciones
        observaciones: this.form.value.observaciones || '',
        pass: this.form.value.pass || '',

       // descripciondiagnostico: this.form.value.descripciondiagnostico || '',
        costo: Number(this.form.value.costo) || 0,

        estado: this.form.value.estado ?? '',
      };

      if (servicioActualizado.idServicio && servicioActualizado.idServicio > 0) {
        // UPDATE
        this.http
          .put(
            `https://www.katpc.somee.com/api/KatPCServiciosMaster/${servicioActualizado.idServicio}`,
            servicioActualizado
          )
          .subscribe({
            next: (response) => {
              //console.log('Servicio actualizado:', response);
              this.loading = true;
              this.dialogRef.close(servicioActualizado); // ✅ DEVOLVER el servicio completo
            },
            error: (error) => {
              console.error('Error al actualizar el Servicio:', error);
            },
          });
      } else {
        // CREATE
        this.http
          .post('https://www.katpc.somee.com/api/KatPCServiciosMaster', servicioActualizado)
          .subscribe({
            next: (response: any) => {
              //console.log('Servicio creado correctamente:', response);
              this.loading = true;
              // 👇 Si la API devuelve el nuevo idServicio, úsalo
              const nuevoServicio = {
                ...servicioActualizado,
                idServicio: response.idServicio || 0,
              };
              this.dialogRef.close(nuevoServicio);
            },
            error: (error) => {
              console.error('Error al guardar el equipo:', error);
            },
          });
      }
    }
  }
}
