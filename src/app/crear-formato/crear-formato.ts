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
    const logo = new Image();
    logo.src = './Logo KatPC 2022.png'; // asegúrate que el archivo exista en src/assets

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'letter',
    });
    // 🔲 Fondo negro detrás del título
    doc.setFillColor(0, 0, 0); // RGB: negro
    doc.rect(10, 15, 190, 15, 'F'); // x, y, ancho, alto, "F" = fill

    // 📝 Texto en blanco sobre el fondo
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255); // blanco
    doc.text('FORMATO DE CONDICIÓN DE EQUIPO', 50, 25); // centrado un poco a la derecha

    // Imagen a la izquierda
    doc.addImage(logo, 'PNG', 14, 17, 20, 10);

    const rows = [[equipo.modelo ?? '', equipo.numserie ?? '']];

    // ── Primera tabla ──
    autoTable(doc, {
      head: [['Modelo', 'Número de serie']],
      body: rows,
      theme: 'grid',
      startY: 40,
      styles: {
        fontSize: 7,
        cellPadding: 1,
        halign: 'center',
      },
      headStyles: {
        fontSize: 8,
        fillColor: [179, 181, 33],
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
    doc.setFillColor(179, 181, 33);
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
    doc.setFillColor(179, 181, 33);
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
        fontSize: 7,
        cellPadding: 1,
        halign: 'center',
      },
      headStyles: {
        fontSize: 8,
        fillColor: [179, 181, 33],
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
    });
    const specsRows14 = [['']];
    autoTable(doc, {
      //head: [['','', '']],
      body: specsRows14,
      startY: 40 + 58, // deja un espacio entre título y tabla
      styles: {
        fontSize: 7,
        cellPadding: 1,
        halign: 'center',
      },
      headStyles: {
        fontSize: 8,
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 26.5, fillColor: [179, 181, 33], minCellHeight: 19 },
      },
      tableWidth: 'wrap', // ajusta al contenido como la primera
    });

    doc.setFontSize(5);
    const titleText3 = 'Condición de Batería';
    doc.text(titleText3, 55 / 2, lastY + 51, { align: 'center' });

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

    // ── Tercera tabla igual a la primera ──

    const specsRows4 = [['']];
    autoTable(doc, {
      // head: [['','', '']],
      body: specsRows4,
      startY: 45 + 58, // deja un espacio entre título y tabla
      styles: {
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
    const specsRows15 = [['']];
    autoTable(doc, {
      body: specsRows15,
      startY: 40 + 92.5, // deja un espacio entre título y tabla
      styles: {
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
    // Crear Blob y URL para mostrar
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);

    // Abrir en nueva ventana
    window.open(pdfUrl, '_blank');
  }
}
