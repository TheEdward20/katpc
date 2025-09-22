import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { CrearFormatoDialog } from '../crear-formato-dialog/crear-formato-dialog';
import { Confirmdialog } from '../confirmdialog/confirmdialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { Equipo } from '../model/equipo.model';
import { EquipoService } from '../service/equipo.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-crear-formato',
  standalone: false,
  templateUrl: './crear-formato.html',
  styleUrls: ['./crear-formato.css'],
})
export class CrearFormato implements OnInit {
  constructor(private snackBar: MatSnackBar, private equipoService: EquipoService) {}
  readonly dialog = inject(MatDialog);

  http = inject(HttpClient);
  equipolist: Equipo[] = [];
  ngOnInit(): void {
    this.getData();
  }
  openDialog(equipo?: Equipo): void {
    const dialogRef = this.dialog.open(CrearFormatoDialog, {
      width: '700px',
      height: '700px',

      data: equipo
        ? { ...equipo } // si viene equipo => editar
        : {
            idEquipo: 0,
            modelo: '',
            numserie: '',
            procesador: '',
            frecueProc: '',
            ram: '',
            tiporam: '',
            almacenamiento: '',
            tipoalmacen: '',
            pantalla: '',
            frecuepantalla: '',
            graficos: '',
            tipograficos: '',
          },
    });

    dialogRef.afterClosed().subscribe((result: Equipo) => {
      if (result) {
        const index = this.equipolist.findIndex((x) => x.idEquipo === result.idEquipo);
        if (index > -1) {
          // ✅ EDITAR: reemplaza el equipo en la lista
          this.equipolist[index] = result;
        } else {
          // ✅ CREAR: agrega el nuevo equipo a la lista
          this.equipolist.push(result);
        }
      }
    });
  }

  editarEquipo(e: Equipo) {
    this.openDialog(e);
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
        this.equipoService.deleteEquipo(id).subscribe({
          next: () => {
            this.getData(); // refresca la tabla
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

  getData() {
    this.equipoService.getEquipos().subscribe((data) => {
      this.equipolist = data;
    });
  }

  exportPDF(equipo: Equipo) {
    const doc = new jsPDF(); // <-- solo una vez
    doc.setFontSize(18);
    doc.text(`Ficha del Equipo: ${equipo.modelo}`, 14, 22);

    const rows = [
      ['ID', equipo.idEquipo ?? ''],
      ['Modelo', equipo.modelo ?? ''],
      ['Número de Serie', equipo.numserie ?? ''],
      ['Procesador', equipo.procesador ?? ''],
      ['Frecuencia Procesador', equipo.frecueProc ?? ''],
      ['RAM', equipo.ram ?? ''],
      ['Tipo RAM', equipo.tiporam ?? ''],
      ['Almacenamiento', equipo.almacenamiento ?? ''],
      ['Tipo Almacenamiento', equipo.tipoalmacen ?? ''],
      ['Pantalla', equipo.pantalla ?? ''],
      ['Frecuencia Pantalla', equipo.frecuepantalla ?? ''],
      ['Gráficos', equipo.graficos ?? ''],
      ['Tipo Gráficos', equipo.tipograficos ?? ''],
    ];

    autoTable(doc, {
      head: [['Campo', 'Valor']],
      body: rows,
      startY: 30,
    });

    // Crear Blob y URL para mostrar
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);

    // Abrir en nueva ventana
    window.open(pdfUrl, '_blank');

    // Nombre del archivo personalizado
    const nombreArchivo = `${equipo.numserie}_${equipo.modelo}.pdf`.replace(/\s+/g, '');
    console.log('Nombre del archivo para descarga:', nombreArchivo);
  }
}
