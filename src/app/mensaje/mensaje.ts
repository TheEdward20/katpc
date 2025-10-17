import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-mensaje',
  standalone: false,
  templateUrl: './mensaje.html',
  styleUrl: './mensaje.css'
})
export class Mensaje {
   constructor(
    private dialogRef: MatDialogRef<Mensaje>,
   @Inject(MAT_DIALOG_DATA) public mensaje: string
  ) {}

  cerrar() {
    this.dialogRef.close(); // <-- Esto dispara el afterClosed() del componente padre
  }
}
