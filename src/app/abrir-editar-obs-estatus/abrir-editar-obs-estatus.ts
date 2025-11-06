import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-abrir-editar-obs-estatus',
  standalone: false,
  templateUrl: './abrir-editar-obs-estatus.html',
  styleUrl: './abrir-editar-obs-estatus.css'
})
export class AbrirEditarObsEstatus {
obsForm: FormGroup;
constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AbrirEditarObsEstatus>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // Inicializamos el formulario con los valores recibidos
    this.obsForm = this.fb.group({
      observaciones: [data?.observaciones || '', Validators.required],
      estado: [data?.estado || '', Validators.required],
      fechaderecepcion: [data?.fechaderecepcion || '']
    });
  }

  guardarObsEstatus(): void {
    if (this.obsForm.valid) {
      // Envía los datos al componente padre
      this.dialogRef.close(this.obsForm.value);
    }
  }
}
