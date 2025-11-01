import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { Servicio } from '../model/servicio.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EquipoService } from '../service/equipo.service';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { CrearServicioDialog } from '../crear-servicio-dialog/crear-servicio-dialog';
import { Confirmdialog } from '../confirmdialog/confirmdialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-orden-servicio',
  standalone: false,
  templateUrl: './orden-servicio.html',
  styleUrl: './orden-servicio.css',
})
export class OrdenServicio implements OnInit, AfterViewInit {
  constructor(private snackBar: MatSnackBar, private equipoService: EquipoService) {}
  readonly dialog = inject(MatDialog);
  http = inject(HttpClient);
  servciolist: Servicio[] = [];
  dataSource = new MatTableDataSource<Servicio>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.getServicios();
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  openDialog(servicio?: Servicio): void {
    const dialogRef = this.dialog.open(CrearServicioDialog, {
      width: '1900px',
      height: '600px',

      data: servicio
        ? { ...servicio } // si viene equipo => editar
        : {
            idServicio: 0,
            folio: 0,
            marca: '',
            serie: '',
            fechaderecepcion: '',
            nombre: '',
            telefono: '',
            observaciones: '',
            pass: '',
            descripciondiagnostico: '',
            costo: 0,
          },
    });

    dialogRef.afterClosed().subscribe((result: Servicio) => {
      if (result) {
        this.getServicios(); //refresca los datos reales del backend
      }
    });
  }
  editarEquipo(s: Servicio) {
    this.openDialog(s);
  }

  eliminarEquipo(id: number) {
    const dialogRef = this.dialog.open(Confirmdialog, {
      width: '400px',
      data: {
        titulo: 'Confirmar',
        mensaje: '¿Seguro que deseas eliminar este equipo?',
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.equipoService.deleteServicios(id).subscribe({
          next: () => {
            this.getServicios(); // refresca la tabla
            this.snackBar.open('Equipo eliminado exitosamente.', 'Cerrar', {
              duration: 3000,
            });
          },
          error: (err) => {
            console.error('Error al eliminar el equipo:', err);
            this.snackBar.open('Error al eliminar el equipo.', 'Cerrar', {
              duration: 3000,
            });
          },
        });
      }
    });
  }

  getServicios() {
    
    this.equipoService.getServicios().subscribe((data) => {
      this.servciolist = data;
      this.dataSource.data = data;
    });
  }

  exportPDF(servicio: Servicio) {}

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
