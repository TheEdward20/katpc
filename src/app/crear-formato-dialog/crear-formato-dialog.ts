import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

interface Equipo {
  id?: number;
  modelo: string;
  numserie: string;
  procesador?: string;
  ram?: string;
  almacenamiento?: string;
  pantalla?: string;
  graficos?: string;
  frecuencia?: string;
  tipo?: string;
  ssd?: string;
  frecuenciapulgada?: string;
  tarjeta?: string;
}
@Component({
  selector: 'app-crear-formato-dialog',
  standalone: false,
  templateUrl: './crear-formato-dialog.html',
  styleUrl: './crear-formato-dialog.css'
})
export class CrearFormatoDialog {
  equipo: Equipo;

  constructor(
    public dialogRef: MatDialogRef<CrearFormatoDialog>,
    @Inject(MAT_DIALOG_DATA) public data: Equipo
  ) {
    this.equipo = data ? { ...data } : { modelo: '', numserie: '' };
  }

  guardarEquipo() {
    this.dialogRef.close(this.equipo);
  }

  cancelar() {
    this.dialogRef.close();
  }
}
