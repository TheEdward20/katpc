import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-crear-formato-dialog',
  standalone: false,
  templateUrl: './crear-formato-dialog.html',
  styleUrl: './crear-formato-dialog.css'
})
export class CrearFormatoDialog {
  modelo: string = '';
  numserie: string = '';

  constructor(public dialogRef: MatDialogRef<CrearFormatoDialog>) {}

  guardar() {
    this.dialogRef.close({ modelo: this.modelo, numserie: this.numserie });
  }

  cancelar() {
    this.dialogRef.close();
  }
}
