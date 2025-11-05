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
export class CrearFormato implements OnInit, AfterViewInit  {
  constructor(private snackBar: MatSnackBar, private equipoService: EquipoService) {}
  readonly dialog = inject(MatDialog);
  http = inject(HttpClient);
  equipolist: Equipo[] = [];
  dataSource = new MatTableDataSource<Equipo>();
@ViewChild(MatPaginator) paginator!: MatPaginator;
  ngOnInit(): void {
    this.getData();
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  openDialog(equipo?: Equipo): void {
    const dialogRef = this.dialog.open(CrearFormatoDialog, {
      width: '1900px',
      height: '600px',

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
         this.dataSource.data = [...this.equipolist];
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
      this.dataSource.data = data;
    });
  }

  exportPDF(equipo: Equipo) {
    const logo = new Image();
    logo.src = './Logo KatPC 2022.png'; // asegúrate que el archivo exista en src/assets

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'letter',
    });
    // 🔲 Fondo negro detrás del título
    doc.setFillColor(0, 0, 0); // RGB: negro
    doc.rect(14, 15, 237, 15, 'F'); // x, y, ancho, alto, "F" = fill

    // 📝 Texto en blanco sobre el fondo
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255); // blanco
    doc.text('FORMATO DE CONDICIÓN DE EQUIPO', 70, 25); // centrado un poco a la derecha

    // Imagen a la izquierda
    doc.addImage(logo, 'PNG', 45, 17, 20, 10);

    const rows = [[equipo.modelo ?? '', equipo.numserie ?? '']];

    // ── Primera tabla ──
    autoTable(doc, {
      head: [['Modelo', 'Número de serie']],
      body: rows,
      theme: 'grid',
      startY: 40,
      styles: {
        font: 'helvetica', // fuente
        fontStyle: 'bold', // negrita
        textColor: [0, 0, 0], // negro puro
        fontSize: 7,
        cellPadding: 1,
        halign: 'center',
      },
      headStyles: {
        fontSize: 8,
        fillColor: [245, 212, 59],
        textColor: [0, 0, 0],
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 50 },
      },
      tableWidth: 'wrap',
    });

    // ── Título centrado de la segunda tabla ──
    const lastY = (doc as any).lastAutoTable?.finalY || 60;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    // Dibujar fondo amarillo para el título
    const pageWidth = 118;
    const titleText = 'Especificaciones del Equipo';
    const rectWidth = 90; // ancho del fondo igual a la primera tabla
    const rectHeight = 8;
    doc.setFillColor(245, 212, 59);
    doc.rect((pageWidth - rectWidth) / 2, lastY + 0.1, rectWidth, rectHeight, 'F');

    // Escribir texto centrado sobre el fondo
    doc.text(titleText, pageWidth / 2, lastY + 5.5, { align: 'center' });

    // ── Segunda tabla igual a la primera ──
    const specsRows = [
      ['Procesador', equipo.procesador ?? '', equipo.frecueProc ?? ''],
      ['Ram', equipo.ram ?? '', equipo.tiporam ?? ''],
      ['Almacenamiento', equipo.almacenamiento ?? '', equipo.tipoalmacen ?? ''],
      ['Pantalla', equipo.pantalla ?? '', equipo.frecuepantalla ?? ''],
      ['Gráficos', equipo.graficos ?? '', equipo.tipograficos ?? ''],
    ];

    autoTable(doc, {
      //head: [['', '', '']],
      body: specsRows,
      theme: 'grid',
      startY: 40 + 18, // deja un espacio entre título y tabla
      styles: {
        font: 'helvetica', // fuente
        fontStyle: 'bold', // negrita
        textColor: [0, 0, 0], // negro puro
        fontSize: 7,
        cellPadding: 1,
        halign: 'center',
      },

      columnStyles: {
        0: { cellWidth: 30 }, // misma proporción que la primera tabla
        1: { cellWidth: 40 },
        2: { cellWidth: 20 },
      },
      tableWidth: 'wrap', // ajusta al contenido como la primera
    });

    // Dibujar fondo amarillo para el título
    const pageWidth2 = 118;
    const titleText2 = 'Resultados PC Mark 10';
    const rectWidth2 = 90; // ancho del fondo igual a la primera tabla
    const rectHeight2 = 8;

    doc.setFillColor(245, 212, 59);
    doc.rect((pageWidth2 - rectWidth2) / 2, lastY + 32, rectWidth2, rectHeight2, 'F');
    // Escribir texto centrado sobre el fondo
    doc.text(titleText2, pageWidth2 / 2, lastY + 37, { align: 'center' });

    // ── Tercera tabla igual a la primera ──
    const specsRows2 = [
      ['', equipo.usooficina ?? '', equipo.maximaexigencia ?? '', (equipo.vidautil ?? '') + '%'],
    ];
    autoTable(doc, {
      head: [['', 'Uso de oficina', 'Máxima exigencia', 'Vida Útil']],
      body: specsRows2,
      startY: 40 + 50, // deja un espacio entre título y tabla
      theme: 'grid',
      styles: {
        font: 'helvetica', // fuente
        fontStyle: 'bold', // negrita
        textColor: [0, 0, 0], // negro puro
        fontSize: 7,
        cellPadding: 1,
        halign: 'center',
      },
      headStyles: {
        fontSize: 8,
        fillColor: [245, 212, 59],
        textColor: [0, 0, 0],
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 26.5 }, // misma proporción que la primera tabla
        1: { cellWidth: 20 },
        2: { cellWidth: 18 },
        3: { cellWidth: 25.5 },
      },
      tableWidth: 'wrap', // ajusta al contenido como la primera

      // 🎨 Colorear dinámicamente la celda
      didParseCell: function (data) {
        if (data.section === 'body' && data.column.index === 3) {
          const valor = Number(equipo.vidautil ?? 0);

          if (valor >= 0 && valor <= 50) {
            data.cell.styles.fillColor = [245, 73, 39]; // rojo
          } else if (valor >= 51 && valor <= 80) {
            data.cell.styles.fillColor = [229, 255, 51]; // amarillo
          } else if (valor >= 81 && valor <= 100) {
            data.cell.styles.fillColor = [80, 245, 39]; // verde
          }
        }
      },
      margin: { left: 14 },
    });
    const specsRows14 = [['']];
    autoTable(doc, {
      //head: [['','', '']],
      body: specsRows14,
      startY: 40 + 58, // deja un espacio entre título y tabla
      styles: {
        font: 'helvetica', // fuente
        fontStyle: 'bold', // negrita
        textColor: [0, 0, 0], // negro puro
        fontSize: 7,
        cellPadding: 1,
        halign: 'center',
      },
      headStyles: {
        fontSize: 8,
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 26.5, fillColor: [245, 212, 59], minCellHeight: 19 },
      },
      tableWidth: 'wrap', // ajusta al contenido como la primera
    });

    doc.setFontSize(10);
    const x = 28; // posición X (ajústalo según donde quieras)
    let y = lastY + 43; // posición inicial Y

    const lines3 = ['Condición', 'de', 'Batería'];

    lines3.forEach((line3, i) => {
      doc.text(line3, x, y + i * 4, { align: 'center' }); // cada línea a +5px
    });

    doc.setFontSize(5);

    // ── Tercera tabla igual a la primera ──
    const specsRows3 = [['', 'Arranque de Programas', equipo.arranque ?? '']];
    const specsRows5 = [['', 'Videoconferencias', equipo.videoconfe ?? '']];
    const specsRows6 = [['', 'Navegación por Internet', equipo.navegacion ?? '']];
    autoTable(doc, {
      // head: [['','', '']],
      body: specsRows3,
      theme: 'grid',
      startY: 40 + 63, // deja un espacio entre título y tabla
      styles: {
        font: 'helvetica', // fuente
        fontStyle: 'bold', // negrita
        textColor: [0, 0, 0], // negro puro
        fontSize: 7,
        cellPadding: 1,
        halign: 'center',
      },
      headStyles: {
        fontSize: 8,
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 26.5 }, // misma proporción que la primera tabla
        1: { cellWidth: 38 },
        2: { cellWidth: 25.5 },
      },
      tableWidth: 'wrap', // ajusta al contenido como la primera
      // 🎨 Colorear dinámicamente la celda
      didParseCell: function (data) {
        if (data.section === 'body' && data.column.index === 2) {
          const valor = Number(equipo.arranque ?? 0);

          if (valor >= 0 && valor <= 999) {
            data.cell.styles.fillColor = [245, 73, 39]; // rojo
          } else if (valor >= 1000 && valor <= 5999) {
            data.cell.styles.fillColor = [229, 255, 51]; // amarillo
          } else if (valor >= 6000 && valor <= 100000) {
            data.cell.styles.fillColor = [80, 245, 39]; // verde
          }
        }
      },
    });
    autoTable(doc, {
      // head: [['','', '']],
      body: specsRows5,
      theme: 'grid',
      startY: 40 + 67.5, // deja un espacio entre título y tabla
      styles: {
        font: 'helvetica', // fuente
        fontStyle: 'bold', // negrita
        textColor: [0, 0, 0], // negro puro
        fontSize: 7,
        cellPadding: 1,
        halign: 'center',
      },
      headStyles: {
        fontSize: 8,
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 26.5 }, // misma proporción que la primera tabla
        1: { cellWidth: 38 },
        2: { cellWidth: 25.5 },
      },
      tableWidth: 'wrap', // ajusta al contenido como la primera
      // 🎨 Colorear dinámicamente la celda
      didParseCell: function (data) {
        if (data.section === 'body' && data.column.index === 2) {
          const valor = Number(equipo.videoconfe ?? 0);

          if (valor >= 0 && valor <= 999) {
            data.cell.styles.fillColor = [245, 73, 39]; // rojo
          } else if (valor >= 1000 && valor <= 5999) {
            data.cell.styles.fillColor = [229, 255, 51]; // amarillo
          } else if (valor >= 6000 && valor <= 100000) {
            data.cell.styles.fillColor = [80, 245, 39]; // verde
          }
        }
      },
    });
    autoTable(doc, {
      // head: [['','', '']],
      body: specsRows6,
      theme: 'grid',
      startY: 40 + 72, // deja un espacio entre título y tabla
      styles: {
        font: 'helvetica', // fuente
        fontStyle: 'bold', // negrita
        textColor: [0, 0, 0], // negro puro
        fontSize: 7,
        cellPadding: 1,
        halign: 'center',
      },
      headStyles: {
        fontSize: 8,
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 26.5 }, // misma proporción que la primera tabla
        1: { cellWidth: 38 },
        2: { cellWidth: 25.5 },
      },
      tableWidth: 'wrap', // ajusta al contenido como la primera
      // 🎨 Colorear dinámicamente la celda
      didParseCell: function (data) {
        if (data.section === 'body' && data.column.index === 2) {
          const valor = Number(equipo.navegacion ?? 0);

          if (valor >= 0 && valor <= 999) {
            data.cell.styles.fillColor = [245, 73, 39]; // rojo
          } else if (valor >= 1000 && valor <= 5999) {
            data.cell.styles.fillColor = [229, 255, 51]; // amarillo
          } else if (valor >= 6000 && valor <= 100000) {
            data.cell.styles.fillColor = [80, 245, 39]; // verde
          }
        }
      },
    });
    doc.rect((pageWidth2 - rectWidth2) / 2, lastY + 32, 90, 7);
    doc.rect((pageWidth2 - rectWidth2) / 2, lastY + 39, 26.5, 14);
    doc.rect(40.5, lastY + 39, 20, 14);
    doc.rect(60.5, lastY + 39, 18, 14);

    // ── Tercera tabla igual a la primera ──

    const specsRows4 = [['']];
    autoTable(doc, {
      // head: [['','', '']],
      body: specsRows4,
      startY: 45 + 58, // deja un espacio entre título y tabla
      styles: {
        font: 'helvetica', // fuente
        fontStyle: 'bold', // negrita
        textColor: [0, 0, 0], // negro puro
        fontSize: 7,
        cellPadding: 1,
        halign: 'center',
      },
      headStyles: {
        fontSize: 8,
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 26.5, minCellHeight: 18 },
      },
      tableWidth: 'wrap', // ajusta al contenido como la primera
    });
    const titleText4 = 'Escenciales';
    doc.text(titleText4, 55 / 2, lastY + 58, { align: 'center' });
    doc.rect(14, lastY + 53, 90, 9);

    // ── cuarta tabla igual a la primera ──
    const specsRows7 = [['', 'Excel y Programación', equipo.excelprograma ?? '']];
    const specsRows8 = [['', 'Escritura de Documentos', equipo.escrituradocum ?? '']];
    autoTable(doc, {
      // head: [['','', '']],
      body: specsRows7,
      theme: 'grid',
      startY: 40 + 76, // deja un espacio entre título y tabla
      styles: {
        font: 'helvetica', // fuente
        fontStyle: 'bold', // negrita
        textColor: [0, 0, 0], // negro puro
        fontSize: 7,
        cellPadding: 1,
        halign: 'center',
      },
      headStyles: {
        fontSize: 8,
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 26.5 }, // misma proporción que la primera tabla
        1: { cellWidth: 38 },
        2: { cellWidth: 25.5 },
      },
      tableWidth: 'wrap', // ajusta al contenido como la primera
      // 🎨 Colorear dinámicamente la celda
      didParseCell: function (data) {
        if (data.section === 'body' && data.column.index === 2) {
          const valor = Number(equipo.excelprograma ?? 0);

          if (valor >= 0 && valor <= 999) {
            data.cell.styles.fillColor = [245, 73, 39]; // rojo
          } else if (valor >= 1000 && valor <= 5999) {
            data.cell.styles.fillColor = [229, 255, 51]; // amarillo
          } else if (valor >= 6000 && valor <= 100000) {
            data.cell.styles.fillColor = [80, 245, 39]; // verde
          }
        }
      },
    });
    autoTable(doc, {
      // head: [['','', '']],
      body: specsRows8,
      theme: 'grid',
      startY: 40 + 80, // deja un espacio entre título y tabla
      styles: {
        font: 'helvetica', // fuente
        fontStyle: 'bold', // negrita
        textColor: [0, 0, 0], // negro puro
        fontSize: 7,
        cellPadding: 1,
        halign: 'center',
      },
      headStyles: {
        fontSize: 8,
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 26.5 }, // misma proporción que la primera tabla
        1: { cellWidth: 38 },
        2: { cellWidth: 25.5 },
      },
      tableWidth: 'wrap', // ajusta al contenido como la primera
      // 🎨 Colorear dinámicamente la celda
      didParseCell: function (data) {
        if (data.section === 'body' && data.column.index === 2) {
          const valor = Number(equipo.escrituradocum ?? 0);

          if (valor >= 0 && valor <= 999) {
            data.cell.styles.fillColor = [245, 73, 39]; // rojo
          } else if (valor >= 1000 && valor <= 5999) {
            data.cell.styles.fillColor = [229, 255, 51]; // amarillo
          } else if (valor >= 6000 && valor <= 100000) {
            data.cell.styles.fillColor = [80, 245, 39]; // verde
          }
        }
      },
    });

    // ── cuarta tabla igual a la primera ──
    const specsRows9 = [['']];
    autoTable(doc, {
      // head: [['','', '']],
      body: specsRows9,
      startY: 45 + 70, // deja un espacio entre título y tabla
      styles: {
        font: 'helvetica', // fuente
        fontStyle: 'bold', // negrita
        textColor: [0, 0, 0], // negro puro
        fontSize: 7,
        cellPadding: 1,
        halign: 'center',
      },
      headStyles: {
        fontSize: 8,
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 26.5, minCellHeight: 18 },
      },
      tableWidth: 'wrap', // ajusta al contenido como la primera
    });

    const titleText5 = 'Productividad';
    doc.text(titleText5, 55 / 2, lastY + 68, { align: 'center' });
    doc.rect(14, lastY + 62, 90, 11.8);

    // ── quinta tabla igual a la primera ──
    const specsRows10 = [['', 'Edición de Fotos y CAD', equipo.edicionfotoscad ?? '']];
    const specsRows11 = [['', 'Edición de Video', equipo.edicionvideo ?? '']];
    autoTable(doc, {
      // head: [['','', '']],
      body: specsRows10,
      theme: 'grid',
      startY: 40 + 84, // deja un espacio entre título y tabla
      styles: {
        font: 'helvetica', // fuente
        fontStyle: 'bold', // negrita
        textColor: [0, 0, 0], // negro puro
        fontSize: 7,
        cellPadding: 1,
        halign: 'center',
      },
      headStyles: {
        fontSize: 8,
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 26.5 }, // misma proporción que la primera tabla
        1: { cellWidth: 38 },
        2: { cellWidth: 25.5 },
      },
      tableWidth: 'wrap', // ajusta al contenido como la primera
      // 🎨 Colorear dinámicamente la celda
      didParseCell: function (data) {
        if (data.section === 'body' && data.column.index === 2) {
          const valor = Number(equipo.edicionfotoscad ?? 0);

          if (valor >= 0 && valor <= 999) {
            data.cell.styles.fillColor = [245, 73, 39]; // rojo
          } else if (valor >= 1000 && valor <= 5999) {
            data.cell.styles.fillColor = [229, 255, 51]; // amarillo
          } else if (valor >= 6000 && valor <= 100000) {
            data.cell.styles.fillColor = [80, 245, 39]; // verde
          }
        }
      },
    });

    autoTable(doc, {
      // head: [['','', '']],
      body: specsRows11,
      theme: 'grid',
      startY: 40 + 88, // deja un espacio entre título y tabla
      styles: {
        font: 'helvetica', // fuente
        fontStyle: 'bold', // negrita
        textColor: [0, 0, 0], // negro puro
        fontSize: 7,
        cellPadding: 1,
        halign: 'center',
      },
      headStyles: {
        fontSize: 8,
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 26.5 }, // misma proporción que la primera tabla
        1: { cellWidth: 38 },
        2: { cellWidth: 25.5 },
      },
      tableWidth: 'wrap', // ajusta al contenido como la primera
      // 🎨 Colorear dinámicamente la celda
      didParseCell: function (data) {
        if (data.section === 'body' && data.column.index === 2) {
          const valor = Number(equipo.edicionvideo ?? 0);

          if (valor >= 0 && valor <= 999) {
            data.cell.styles.fillColor = [245, 73, 39]; // rojo
          } else if (valor >= 1000 && valor <= 5999) {
            data.cell.styles.fillColor = [229, 255, 51]; // amarillo
          } else if (valor >= 6000 && valor <= 100000) {
            data.cell.styles.fillColor = [80, 245, 39]; // verde
          }
        }
      },
    });

    // ── quinta tabla igual a la primera ──
    const specsRows12 = [['']];
    autoTable(doc, {
      // head: [['','', '']],
      body: specsRows12,
      startY: 45 + 79, // deja un espacio entre título y tabla
      styles: {
        font: 'helvetica', // fuente
        fontStyle: 'bold', // negrita
        textColor: [0, 0, 0], // negro puro
        fontSize: 7,
        cellPadding: 1,
        halign: 'center',
      },
      headStyles: {
        fontSize: 8,
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 26.5, minCellHeight: 8 },
      },
      tableWidth: 'wrap', // ajusta al contenido como la primera
    });
    doc.setFontSize(5);
    const titleText6 = 'Edición de Contenido Digital';
    doc.text(titleText6, 55 / 2, lastY + 78, { align: 'center' });
    doc.rect(14, lastY + 73.8, 90, 8.5);
    // ── sexta tabla igual a la primera ──
    const specsRows13 = [['', 'Videojuegos y Renderizado', equipo.videojuego ?? '']];
    autoTable(doc, {
      body: specsRows13,
      theme: 'grid',
      startY: 40 + 92.5, // deja un espacio entre título y tabla
      styles: {
        font: 'helvetica', // fuente
        fontStyle: 'bold', // negrita
        textColor: [0, 0, 0], // negro puro
        fontSize: 7,
        cellPadding: 1,
        halign: 'center',
      },
      headStyles: {
        fontSize: 8,
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 26.5 },
        1: { cellWidth: 38 },
        2: { cellWidth: 25.5 }, // sin color fijo aquí
      },
      tableWidth: 'wrap',
      // Colorear dinámicamente la celda
      didParseCell: function (data) {
        if (data.section === 'body' && data.column.index === 2) {
          const valor = Number(equipo.videojuego ?? 0);

          if (valor >= 0 && valor <= 999) {
            data.cell.styles.fillColor = [245, 73, 39]; // rojo
          } else if (valor >= 1000 && valor <= 5999) {
            data.cell.styles.fillColor = [229, 255, 51]; // amarillo
          } else if (valor >= 6000 && valor <= 100000) {
            data.cell.styles.fillColor = [80, 245, 39]; // verde
          }
        }
      },
    });
    const specsRows15 = [['']];
    autoTable(doc, {
      body: specsRows15,
      startY: 40 + 92.5, // deja un espacio entre título y tabla
      styles: {
        font: 'helvetica', // fuente
        fontStyle: 'bold', // negrita
        textColor: [0, 0, 0], // negro puro
        fontSize: 7,
        cellPadding: 1,
        halign: 'center',
      },
      headStyles: {
        fontSize: 8,
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 26.5 },
        1: { cellWidth: 38 },
        2: { cellWidth: 25.5 }, // sin color fijo aquí
      },
      tableWidth: 'wrap',
      // 🎨 Colorear dinámicamente la celda
      didParseCell: function (data) {
        if (data.section === 'body' && data.column.index === 2) {
          const valor = Number(equipo.videojuego ?? 0);

          if (valor >= 0 && valor <= 999) {
            data.cell.styles.fillColor = [245, 73, 39]; // rojo
          } else if (valor >= 1000 && valor <= 5999) {
            data.cell.styles.fillColor = [229, 255, 51]; // amarillo
          } else if (valor >= 6000 && valor <= 100000) {
            data.cell.styles.fillColor = [80, 245, 39]; // verde
          }
        }
      },
    });
    const titleText7 = 'Gaming y Render';
    doc.text(titleText7, 55 / 2, lastY + 85.5, { align: 'center' });
    doc.rect(14, lastY + 82.3, 90, 5.1);
    doc.rect(40.5, lastY + 39, 38, 48.4);
    doc.rect(78.5, lastY + 39, 25.5, 48.4);
    // Función para dibujar casilla con o sin palomita
    const drawLabelWithCheckbox = (x: number, y: number, label: string, value: string | number) => {
      doc.setFontSize(6);

      // escribimos el texto primero
      doc.text(label, x, y + 2.3);
      const textWidth = doc.getTextWidth(label); // ancho del texto
      const checkX = x + textWidth + 2; // 2 px de separación mínima
      // Dibuja la casilla en la posición indicada
      doc.rect(checkX, y, 3, 3); // tamaño 3x3

      // si es 1 dibujamos la palomita
      if (value == 1 || value === '1') {
        doc.text('X', checkX + 0.6, y + 2.3);
      }
    };

    const baseY = lastY + 88.5;

    //IZQUIERDA
    drawLabelWithCheckbox(15, baseY, 'Teclado Iluminado:', equipo.tecladoilumi ?? '');
    doc.rect(14, baseY - 1.2, 26.6, 5);
    drawLabelWithCheckbox(15, baseY + 5, 'Windows Hello:     ', equipo.windowshello ?? '');
    doc.rect(14, baseY + 4, 26.6, 5);
    drawLabelWithCheckbox(15, baseY + 10, 'Puertos USB:        ', equipo.puertosusb ?? '');
    doc.rect(14, baseY + 9, 26.6, 5);
    drawLabelWithCheckbox(15, baseY + 15, 'Salida de Video:    ', equipo.salidavideo ?? '');
    doc.rect(14, baseY + 14, 26.6, 5);

    //CENTRO
    drawLabelWithCheckbox(42, baseY, 'Wifi:                ', equipo.wifi ?? '');
    doc.rect(40.5, baseY - 1.2, 21, 5);
    drawLabelWithCheckbox(42, baseY + 5, 'Puerto Tipo C:', equipo.puertotipoc ?? '');
    doc.rect(40.5, baseY + 4, 21, 5);
    drawLabelWithCheckbox(42, baseY + 10, 'Micrófono:      ', equipo.microfono ?? '');
    doc.rect(40.5, baseY + 9, 21, 5);
    drawLabelWithCheckbox(42, baseY + 15, 'Touchpad:      ', equipo.touchpad ?? '');
    doc.rect(40.5, baseY + 14, 21, 5);

    //PRIMERA DERECHA
    drawLabelWithCheckbox(62, baseY, 'Bluetooth:          ', equipo.bluetooth ?? '');
    doc.rect(61.5, baseY - 1.2, 22, 5);
    drawLabelWithCheckbox(62, baseY + 5, 'CD/DVD:           ', equipo.cd ?? '');
    doc.rect(61.5, baseY + 4, 22, 5);
    drawLabelWithCheckbox(62, baseY + 10, 'Puerto Auxiliar: ', equipo.puertoauxiliar ?? '');
    doc.rect(61.5, baseY + 9, 22, 5);
    drawLabelWithCheckbox(62, baseY + 15, 'Bocinas:            ', equipo.bocinas ?? '');
    doc.rect(61.5, baseY + 14, 22, 5);

    //SEGUNDA DERECHA
    drawLabelWithCheckbox(85, baseY, 'Pantala Tactil:', equipo.pantallatactil ?? '');
    doc.rect(83.5, baseY - 1.2, 20.5, 5);
    drawLabelWithCheckbox(85, baseY + 5, 'Webcam:       ', equipo.webcam ?? '');
    doc.rect(83.5, baseY + 4, 20.5, 5);
    drawLabelWithCheckbox(85, baseY + 10, 'Pantalla:        ', equipo.pantallad ?? '');
    doc.rect(83.5, baseY + 9, 20.5, 5);
    drawLabelWithCheckbox(85, baseY + 15, 'Botones:        ', equipo.botones ?? '');
    doc.rect(83.5, baseY + 14, 20.5, 5);

    //--------------------------------- SEGUNDA PARTE---------------------------------------------
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');

    const pageWidth8 = 370;
    const titleText8 = 'Condición física del equipo';
    const rectWidth8 = 130; // ancho del fondo igual a la primera tabla
    const rectHeight8 = 5.2;

    doc.setFillColor(245, 212, 59);
    doc.rect((pageWidth8 - rectWidth8) / 2, 40, rectWidth8, rectHeight8, 'F');

    // Escribir texto centrado sobre el fondo
    doc.text(titleText8, pageWidth8 / 2, 44, { align: 'center' });

    // ── Segunda tabla igual a la primera ──
    const rows2 = [[equipo.grado ?? '']];

    // ── Primera tabla ──
    autoTable(doc, {
      head: [['Grado']],
      body: rows2,
      theme: 'plain',
      startY: 45,
      styles: {
        fontSize: 26,
        cellPadding: 1,
        halign: 'center',
      },
      headStyles: {
        fontSize: 12,
        textColor: [0, 0, 0],
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 50 },
      },
      tableWidth: 'wrap',
      margin: { left: 113 },
    });

    doc.rect(120, lastY - 10, 130, 32);
    doc.rect(120, lastY - 5, 25, 27); /*<----es de Grado */
    doc.rect(120, lastY - 5, 130, 27);

    /*----------------------------------- */
    doc.setFontSize(8);
    const pageWidth9 = doc.internal.pageSize.getWidth(); // ancho de página
    const textY = 55; // posición vertical inicial
    const textWidth = pageWidth9 - 195; // márgenes laterales (20px a cada lado)

    const text: string = equipo.condicionfisica ?? '';

    // 🔹 Divide el texto en varias líneas dentro del ancho permitido
    const lines: string[] = doc.splitTextToSize(text, textWidth) as string[];

    // 🔹 Calcula el centro horizontal
    const xCentered = 195;

    let currentY = textY;
    for (const line of lines) {
      doc.text(line, xCentered, currentY, { align: 'center' });
      currentY += 5; // espacio entre líneas
    }

    doc.setFontSize(12);
    const pageWidth10 = 370;
    const titleText10 = 'Interpretación de los Resultados';
    const rectWidth10 = 130; // ancho del fondo igual a la primera tabla
    const rectHeight10 = 5.2;

    doc.setFillColor(245, 212, 59);
    doc.rect((pageWidth10 - rectWidth10) / 2, 80.2, rectWidth10, rectHeight10, 'F');

    doc.rect(120, lastY + 30, 130, 85);
    // Escribir texto centrado sobre el fondo
    doc.text(titleText10, pageWidth10 / 2, 84, { align: 'center' });
    //---------------------------------------------------------------------------------------------------------------------
    doc.setFontSize(8);
    const pageWidth11 = doc.internal.pageSize.getWidth(); // ancho de página
    const textX2 = 122; // posición horizontal del texto
    let currentY2 = 91; // posición vertical inicial

    const text2: string = equipo.interpretacion ?? '';

    // 🔹 Dividir el texto en párrafos usando el punto y espacio como separador
    const paragraphs: string[] = text2.split(/\. /);

    for (const para of paragraphs) {
      // 🔹 Añadir el punto al final de cada párrafo si no lo tiene
      const paragraphText = para.trim().endsWith('.') ? para.trim() : para.trim() + '.';

      // 🔹 Dividir el párrafo en líneas que entren en el ancho permitido
      const lines2: string[] = doc.splitTextToSize(paragraphText, pageWidth11 - 153);

      // 🔹 Escribir cada línea
      for (const line2 of lines2) {
        doc.text(line2, textX2, currentY2, { align: 'justify' });
        currentY2 += 5; // espacio entre líneas
      }

      currentY2 += 1; // espacio extra entre párrafos
    }

    const formatearFecha = (fechaIso: string | null | undefined): string => {
      if (!fechaIso) return ''; // si viene nulo o vacío
      const fecha = new Date(fechaIso);
      if (isNaN(fecha.getTime())) return ''; // si la fecha no es válida

      const dia = String(fecha.getDate()).padStart(2, '0');
      const mes = String(fecha.getMonth() + 1).padStart(2, '0');
      const anio = fecha.getFullYear();
      return `${dia}/${mes}/${anio}`;
    };

    // Usar la función antes de la tabla
    const fechaFormateada = formatearFecha(equipo.fechaprueba);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const specsRows16 = [['Encargado de Pruebas: ', equipo.encargado ?? '']];
    const specsRows17 = [['Fecha de las Pruebas: ', fechaFormateada]];
    autoTable(doc, {
      // head: [['','', '']],
      body: specsRows16,
      theme: 'grid',
      startY: 103 + 63, // deja un espacio entre título y tabla
      styles: {
        fontSize: 9,
        cellPadding: 1,
        textColor: [0, 0, 0],
        halign: 'center',
      },
      headStyles: {
        fontSize: 8,
        fillColor: [0, 0, 0],
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 50 }, // misma proporción que la primera tabla
        1: { cellWidth: 80 },
      },
      tableWidth: 'wrap', // ajusta al contenido como la primera
      margin: { left: 120 },
    });
    autoTable(doc, {
      // head: [['','', '']],
      body: specsRows17,
      theme: 'grid',
      startY: 109 + 63, // deja un espacio entre título y tabla
      styles: {
        fontSize: 9,
        cellPadding: 1,
        textColor: [0, 0, 0],
        halign: 'center',
      },
      headStyles: {
        fontSize: 8,
        fillColor: [0, 0, 0],
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 50 }, // misma proporción que la primera tabla
        1: { cellWidth: 80 },
      },
      tableWidth: 'wrap', // ajusta al contenido como la primera
      margin: { left: 120 },
    });

    doc.setFontSize(8);
    const pageWidth18 = doc.internal.pageSize.getWidth(); // ancho de página
    const textY18 = 195; // posición vertical inicial
    const textWidth18 = pageWidth18 - 225; // márgenes laterales (20px a cada lado)

    const titleText18: string = '"Acepto las condiciones en las que me fue entregado el equipo"';

    // 🔹 Divide el texto en varias líneas dentro del ancho permitido
    const lines18: string[] = doc.splitTextToSize(titleText18, textWidth18) as string[];

    // 🔹 Calcula el centro horizontal
    const xCentered18 = 185;

    let currentY18 = textY18;
    for (const line18 of lines18) {
      doc.text(line18, xCentered18, currentY18, { align: 'center' });
      currentY18 += 5; // espacio entre líneas
    }
    doc.setLineWidth(1); // más gruesa
    doc.setDrawColor(0, 0, 0); // color rojo
    doc.line(150, 190, 220, 190); // desde (20,100) hasta (190,100)

    // Crear Blob y URL para mostrar
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);

    // Abrir en nueva ventana
    window.open(pdfUrl, '_blank');
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
