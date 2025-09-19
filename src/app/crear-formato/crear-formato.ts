import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { CrearFormatoDialog } from '../crear-formato-dialog/crear-formato-dialog';
import { Confirmdialog } from '../confirmdialog/confirmdialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';


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
  selector: 'app-crear-formato',
  standalone: false,
  templateUrl: './crear-formato.html',
  styleUrls: ['./crear-formato.css'],
})
export class CrearFormato implements OnInit{
  constructor(private snackBar: MatSnackBar){ }
  readonly dialog = inject(MatDialog);

  http = inject(HttpClient);
  equipo: Equipo = {
    modelo: '',
    numserie: ''
  };
  equipolist: any[] = [];
  ngOnInit(): void {
    this.getData();
  }
  openDialog(equipo?: Equipo): void {
    const dialogRef = this.dialog.open(CrearFormatoDialog, {
      width: '700px',
      height: '700px',
      data: equipo ? { ...equipo } : null
    });

    dialogRef.afterClosed().subscribe((resultado: Equipo | undefined) => {
      if (resultado) {
        if (resultado.id) {
          // Actualizar
          const index = this.equipolist.findIndex(e => e.id === resultado.id);
          if (index !== -1) this.equipolist[index] = resultado;
        } else {
          // Crear
          resultado.id = this.equipolist.length + 1;
          this.equipolist.push(resultado);
        }
      }
    });
  }
  guardarEquipo() {
    if (this.equipo.id) {
      // Actualizar
      const index = this.equipolist.findIndex(e => e.id === this.equipo.id);
      if (index !== -1) this.equipolist[index] = { ...this.equipo };
    } else {
      // Crear
      this.equipo.id = this.equipolist.length + 1;
      this.equipolist.push({ ...this.equipo });
    }
    this.equipo = {
      modelo: '',
      numserie: ''
    };
  }

  editarEquipo(e: Equipo) {
    this.openDialog(e);

  }

  eliminarEquipo(id: number) {
    const dialogRef = this.dialog.open(Confirmdialog);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.equipolist = this.equipolist.filter(e => e.id !== id);
        this.snackBar.open('Equipo eliminado exitosamente.', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }
  getData() {
    this.http.get('https://localhost:7066/api/especificacionMaster').subscribe((res: any)=>{
      this.equipolist = res;
    })
  }



}
