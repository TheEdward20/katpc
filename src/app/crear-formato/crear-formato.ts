import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { CrearFormatoDialog } from '../crear-formato-dialog/crear-formato-dialog';
import { Confirmdialog } from '../confirmdialog/confirmdialog';
import { MatSnackBar } from '@angular/material/snack-bar';


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
export class CrearFormato {
  constructor(private snackBar: MatSnackBar){ }
  readonly dialog = inject(MatDialog);
  equipo: Equipo = {
    modelo: '',
    numserie: ''
  };
  equipos: Equipo[] = [
    {
      id: 1,
      modelo: 'Accer Nitro V15',
      numserie: 'NHQRYAA001409033E07600',
      procesador: 'Intel Core i7-13620H',
      ram: '16GB',
      almacenamiento: '512GB',
      pantalla: '15.6',
      graficos: 'NVIDIA RTX 4060',
      frecuencia: '4.90GHz',
      tipo: 'DDR5',
      ssd: 'SSD NVMe',
      frecuenciapulgada: 'FHD 90+Hz',
      tarjeta: '8GB'
    }
  ];
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
          const index = this.equipos.findIndex(e => e.id === resultado.id);
          if (index !== -1) this.equipos[index] = resultado;
        } else {
          // Crear
          resultado.id = this.equipos.length + 1;
          this.equipos.push(resultado);
        }
      }
    });
  }
  guardarEquipo() {
    if (this.equipo.id) {
      // Actualizar
      const index = this.equipos.findIndex(e => e.id === this.equipo.id);
      if (index !== -1) this.equipos[index] = { ...this.equipo };
    } else {
      // Crear
      this.equipo.id = this.equipos.length + 1;
      this.equipos.push({ ...this.equipo });
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
        this.equipos = this.equipos.filter(e => e.id !== id);
        this.snackBar.open('Equipo eliminado exitosamente.', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }
}
