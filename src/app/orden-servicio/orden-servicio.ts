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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AbrirEditarObsEstatus } from '../abrir-editar-obs-estatus/abrir-editar-obs-estatus';
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
  editarEquipo(elemento: any) {
     const dialogRef = this.dialog.open(AbrirEditarObsEstatus, {
      width: '500px',
      data: {
        observaciones: elemento.observaciones,
        estado: elemento.estado
      }
    });

    // Cuando el modal se cierra
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // ✅ Actualiza los valores en la tabla o en la BD
        elemento.observaciones = result.observaciones;
        elemento.estado = result.estado;

        // Si quieres guardar automáticamente en la base de datos:
        this.guardarCambios(elemento);
      }
    });
  }

  guardarCambios(elemento: any) {
    const url = `https://www.katpc.somee.com/api/KatPCServiciosMaster/${elemento.idServicio}`;

  // Solo toma los campos que vas a actualizar
  const datosActualizados = {
    observaciones: elemento.observaciones,
    estado: elemento.estado
  };

  this.http.put(url, { ...elemento, ...datosActualizados }).subscribe({
    next: (response) => {
      //console.log('✅ Cambios guardados correctamente:', response);
    },
    error: (error) => {
      //console.error('❌ Error al guardar cambios:', error);
    }
  });
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

  exportPDF(servicio: Servicio) {
    const logo = new Image();
    logo.src = './Logo KatPC 2022.png'; // asegúrate que el archivo exista en src/assets

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'letter',
    });
    // Fondo negro detrás del título
    doc.setFillColor(0, 0, 0); // RGB: negro
    doc.rect(14, 10, 237, 25, 'F'); // x, y, ancho, alto, "F" = fill

    // Texto en blanco sobre el fondo
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255); // blanco
    doc.text('ORDEN DE SERVICIO', 110, 25);
    doc.setFontSize(6);
    doc.text('1° Sur Ote #542a', 230, 15);
    doc.setFontSize(6);
    doc.text('Entre 4° Y 5° Oriente', 228, 18);
    doc.setFontSize(6);
    doc.text('Barrio San Roque', 230, 21);
    doc.setFontSize(6);
    doc.text('Col Centro, Tuxtla GTz, Chis.', 222, 24);
    // Facebook
    const fbLogo = './facebook.png'; // ← aquí tu base64 real
    doc.addImage(fbLogo, 'PNG', 208, 25, 3.5, 3.5);
    doc.setFontSize(6);
    doc.text('/KatPCChiapas', 212, 27.5);

    // TikTok
    const instagramLogo = './instagram.png';
    doc.addImage(instagramLogo, 'PNG', 228, 25, 3.5, 3.5);
    doc.text('/Katpcchiapas', 232, 27.5);

    // WhatsApp
    const whatsappLogo = './whatsapp.png';
    doc.addImage(whatsappLogo, 'PNG', 215, 28.5, 3.5, 3.5);
    doc.text('961 281 6142 & 961 229 2634', 220, 31);

    // Imagen a la izquierda
    doc.addImage(logo, 'PNG', 45, 17, 20, 10);

    const rows = [['FOLIO: ', servicio.folio ?? '']];
    autoTable(doc, {
      body: rows,
      theme: 'grid',
      startY: 40,
      styles: {
        font: 'helvetica', // fuente
        fontStyle: 'bold', // negrita
        //textColor: [0, 0, 0], // negro puro
        fontSize: 7,
        cellPadding: 1,
        halign: 'center',
      },
      headStyles: {
        fontSize: 8,
        //fillColor: [245, 212, 59],
        textColor: [0, 0, 0],
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 40, fillColor: [0, 0, 0], textColor: [225, 225, 225] },
        1: { cellWidth: 50, textColor: [232, 2, 2] },
      },
      tableWidth: 'wrap',
    });

    // ── Título centrado de la primera tabla ──
    const lastY = (doc as any).lastAutoTable?.finalY || 60;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    // Dibujar fondo amarillo para el título
    const pageWidth = 264;
    const titleText = 'REGISTRO DE ENTREGA Y RECEPCIÓN DE EQUIPO DE CÓMPUTO';
    const rectWidth = 236; // ancho del fondo igual a la primera tabla
    const rectHeight = 8;
    doc.setFillColor(255, 255, 255);
    doc.rect((pageWidth - rectWidth) / 2, lastY + 5, 237, rectHeight, 'FD');

    // Escribir texto centrado sobre el fondo
    doc.text(titleText, pageWidth / 2, lastY + 10, { align: 'center' });

    // Dibujar fondo negro para el título
    const pageWidth2 = 118;
    const titleText2 = 'Datos Generales';
    const rectWidth2 = 90; // ancho del fondo igual a la primera tabla
    const rectHeight2 = 8;

    doc.setFillColor(0, 0, 0);
    doc.rect((pageWidth2 - rectWidth2) / 2, lastY + 13, rectWidth2, rectHeight2, 'F');

    // Escribir texto centrado sobre el fondo
    doc.setTextColor(225, 225, 225);
    doc.text(titleText2, pageWidth2 / 2, lastY + 18, { align: 'center' });

    const rows1 = [
      ['Marca: ', servicio.marca ?? ''],
      ['Modelo: ', servicio.modelo ?? ''],
      ['Serie: ', servicio.serie ?? ''],
    ];

    // ── Primera tabla ──
    autoTable(doc, {
      //head: [['Datos Generales']],
      body: rows1,
      theme: 'grid',
      startY: 66,
      styles: {
        font: 'helvetica', // fuente
        fontStyle: 'bold', // negrita
        textColor: [0, 0, 0], // negro puro
        fontSize: 7,
        cellPadding: 1,
        halign: 'center',
        lineColor: [0, 0, 0], // borde negro también en el encabezado
        lineWidth: 0.3,
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
        2: { cellWidth: 50 },
      },
      tableWidth: 'wrap',
      margin: { left: 13.8 },
    });

    // Dibujar fondo negro para el título
    const pageWidth3 = 412.2;
    const titleText3 = 'Datos del Cliente';
    const rectWidth3 = 90; // ancho del fondo igual a la primera tabla
    const rectHeight3 = 8;

    doc.setFillColor(0, 0, 0);
    doc.rect((pageWidth3 - rectWidth3) / 2, lastY + 13, rectWidth3, rectHeight3, 'F');

    // Escribir texto centrado sobre el fondo
    doc.setTextColor(225, 225, 225);
    doc.text(titleText3, pageWidth3 / 2, lastY + 18, { align: 'center' });

    const fechaRecepcion = servicio.fechaderecepcion ? new Date(servicio.fechaderecepcion) : null;

    const opcionesFecha: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    const fechaFormateada = fechaRecepcion
      ? fechaRecepcion.toLocaleDateString('es-ES', opcionesFecha)
      : '';
    const rows2 = [
      ['Fecha de Recepcion: ', fechaFormateada],
      ['Nombre del Cliente: ', servicio.nombre ?? ''],
      ['No. de Telefono: ', servicio.telefono ?? ''],
    ];

    // ── Primera tabla ──
    autoTable(doc, {
      //head: [['Datos Generales']],
      body: rows2,
      theme: 'grid',
      startY: 66,
      styles: {
        font: 'helvetica', // fuente
        fontStyle: 'bold', // negrita
        textColor: [0, 0, 0], // negro puro
        fontSize: 7,
        cellPadding: 1,
        halign: 'center',
        lineColor: [0, 0, 0], // borde negro también en el encabezado
        lineWidth: 0.3,
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
        2: { cellWidth: 50 },
      },
      tableWidth: 'wrap',
      margin: { left: 161.1 },
    });

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    // Dibujar fondo amarillo para el título
    const pageWidth4 = 264;
    const titleText4 = 'FUNCIONAMIENTO GENERAL DEL EQUIPO';
    const rectWidth4 = 236; // ancho del fondo igual a la primera tabla
    const rectHeight4 = 8;
    doc.setFillColor(255, 255, 255);
    doc.rect((pageWidth4 - rectWidth4) / 2, lastY + 45, 237, rectHeight4, 'FD');

    // Escribir texto centrado sobre el fondo
    doc.text(titleText4, pageWidth4 / 2, lastY + 50, { align: 'center' });

    // Dibujar fondo negro para el título
    const pageWidth5 = 118;
    const titleText5 = 'Funcionamiento a la recepción';
    const rectWidth5 = 90; // ancho del fondo igual a la primera tabla
    const rectHeight5 = 8;

    doc.setFillColor(0, 0, 0);
    doc.rect((pageWidth5 - rectWidth5) / 2, lastY + 53, rectWidth5, rectHeight5, 'F');

    // Escribir texto centrado sobre el fondo
    doc.setTextColor(225, 225, 225);
    doc.text(titleText5, pageWidth5 / 2, lastY + 58, { align: 'center' });

    doc.setDrawColor(0, 0, 0);
    doc.rect(14, 106, 90, 51, 'S'); //doc.rect(x, y, width, height, style)

    // Tamaño de fuente
    doc.setFontSize(10);

    // Posición base
    const posY = lastY + 61.5; // ajusta según tu diseño

    // Texto y valor
    const textoEtiqueta = 'Enciende';
    const valor = Number(servicio.enciende ?? 0); // convierte a número
    let fillColor: [number, number, number];
    // Determinar color de fondo según valor

    if (valor === 1) {
      fillColor = [80, 245, 39]; // verde
    } else if (valor === 0) {
      fillColor = [229, 255, 51]; // amarillo
    } else {
      fillColor = [245, 73, 39]; // rojo (por si no es 0 ni 1)
    }

    // Dibujar rectángulo de fondo
    doc.setFillColor(...fillColor);
    doc.rect(14, posY, 30, 8.5, 'FD'); // 'F' = relleno

    // Texto encima del rectángulo

    doc.setTextColor(0, 0, 0); // texto negro
    doc.text(`${textoEtiqueta} ${valor === 1 ? '' : ''}`, 28, posY + 5, { align: 'center' });
    //---------------------------------------------------------------------------------------------
    // Tamaño de fuente
    doc.setFontSize(10);

    // Posición base
    const posY2 = lastY + 61.5; // ajusta según tu diseño

    // Texto y valor
    const textoEtiqueta2 = 'Puertos USB';
    const valor2 = Number(servicio.puertosusb ?? 0); // convierte a número
    //let fillColor: [number, number, number];
    // Determinar color de fondo según valor

    if (valor2 === 1) {
      fillColor = [80, 245, 39]; // verde
    } else if (valor2 === 0) {
      fillColor = [229, 255, 51]; // amarillo
    } else {
      fillColor = [245, 73, 39]; // rojo (por si no es 0 ni 1)
    }

    // Dibujar rectángulo de fondo
    doc.setFillColor(...fillColor);
    doc.rect(14, posY2 + 8.5, 30, 8.5, 'FD'); // 'F' = relleno

    // Texto encima del rectángulo

    doc.setTextColor(0, 0, 0); // texto negro
    doc.text(`${textoEtiqueta2} ${valor2 === 1 ? '' : ''}`, 28, posY2 + 13, { align: 'center' });
    -(
      //---------------------------------------------------------------------------------------------
      // Tamaño de fuente
      doc.setFontSize(10)
    );

    // Posición base
    const posY4 = lastY + 61.5; // ajusta según tu diseño

    // Texto y valor
    const textoEtiqueta4 = 'Bocinas';
    const valor4 = Number(servicio.bocinas ?? 0); // convierte a número
    //let fillColor: [number, number, number];
    // Determinar color de fondo según valor

    if (valor4 === 1) {
      fillColor = [80, 245, 39]; // verde
    } else if (valor4 === 0) {
      fillColor = [229, 255, 51]; // amarillo
    } else {
      fillColor = [245, 73, 39]; // rojo (por si no es 0 ni 1)
    }

    // Dibujar rectángulo de fondo
    doc.setFillColor(...fillColor);
    doc.rect(14, posY4 + 17, 30, 8.5, 'FD'); // 'F' = relleno

    // Texto encima del rectángulo

    doc.setTextColor(0, 0, 0); // texto negro
    doc.text(`${textoEtiqueta4} ${valor4 === 1 ? '' : ''}`, 28, posY4 + 22, { align: 'center' });
    //---------------------------------------------------------------------------------------------
    // Tamaño de fuente
    doc.setFontSize(10);

    // Posición base
    const posY5 = lastY + 61.5; // ajusta según tu diseño

    // Texto y valor
    const textoEtiqueta5 = 'Pantalla';
    const valor5 = Number(servicio.pantalla ?? 0); // convierte a número
    //let fillColor: [number, number, number];
    // Determinar color de fondo según valor

    if (valor5 === 1) {
      fillColor = [80, 245, 39]; // verde
    } else if (valor5 === 0) {
      fillColor = [229, 255, 51]; // amarillo
    } else {
      fillColor = [245, 73, 39]; // rojo (por si no es 0 ni 1)
    }

    // Dibujar rectángulo de fondo
    doc.setFillColor(...fillColor);
    doc.rect(14, posY5 + 25.5, 30, 8.5, 'FD'); // 'F' = relleno

    // Texto encima del rectángulo

    doc.setTextColor(0, 0, 0); // texto negro
    doc.text(`${textoEtiqueta5} ${valor5 === 1 ? '' : ''}`, 28, posY5 + 31, { align: 'center' });
    //---------------------------------------------------------------------------------------------
    // Tamaño de fuente
    doc.setFontSize(10);

    // Posición base
    const posY6 = lastY + 61.5; // ajusta según tu diseño

    // Texto y valor
    const textoEtiqueta6 = 'Touchpoad';
    const valor6 = Number(servicio.touchpad ?? 0); // convierte a número
    //let fillColor: [number, number, number];
    // Determinar color de fondo según valor

    if (valor6 === 1) {
      fillColor = [80, 245, 39]; // verde
    } else if (valor6 === 0) {
      fillColor = [229, 255, 51]; // amarillo
    } else {
      fillColor = [245, 73, 39]; // rojo (por si no es 0 ni 1)
    }

    // Dibujar rectángulo de fondo
    doc.setFillColor(...fillColor);
    doc.rect(14, posY5 + 33.5, 30, 8.5, 'FD'); // 'F' = relleno

    // Texto encima del rectángulo

    doc.setTextColor(0, 0, 0); // texto negro
    doc.text(`${textoEtiqueta6} ${valor6 === 1 ? '' : ''}`, 28, posY6 + 38.5, { align: 'center' });

    //---------------------------------------------------------------------------------------------
    // Tamaño de fuente
    doc.setFontSize(10);

    // Posición base
    const posY7 = lastY + 61.5; // ajusta según tu diseño

    // Texto y valor
    const textoEtiqueta7 = 'Webcam';
    const valor7 = Number(servicio.webcam ?? 0); // convierte a número
    //let fillColor: [number, number, number];
    // Determinar color de fondo según valor

    if (valor7 === 1) {
      fillColor = [80, 245, 39]; // verde
    } else if (valor7 === 0) {
      fillColor = [229, 255, 51]; // amarillo
    } else {
      fillColor = [245, 73, 39]; // rojo (por si no es 0 ni 1)
    }

    // Dibujar rectángulo de fondo
    doc.setFillColor(...fillColor);
    doc.rect(14, posY5 + 41.5, 30, 8.5, 'FD'); // 'F' = relleno

    // Texto encima del rectángulo

    doc.setTextColor(0, 0, 0); // texto negro
    doc.text(`${textoEtiqueta7} ${valor7 === 1 ? '' : ''}`, 28, posY7 + 46.5, { align: 'center' });

    //---------------------------------------------------------------------------------------------
    // Tamaño de fuente
    doc.setFontSize(10);

    // Posición base
    const posY8 = lastY + 61.5; // ajusta según tu diseño

    // Texto y valor
    const textoEtiqueta8 = 'WiFi';
    const valor8 = Number(servicio.wifi ?? 0); // convierte a número
    //let fillColor: [number, number, number];
    // Determinar color de fondo según valor

    if (valor8 === 1) {
      fillColor = [80, 245, 39]; // verde
    } else if (valor8 === 0) {
      fillColor = [229, 255, 51]; // amarillo
    } else {
      fillColor = [245, 73, 39]; // rojo (por si no es 0 ni 1)
    }

    // Dibujar rectángulo de fondo
    doc.setFillColor(...fillColor);
    doc.rect(74, posY8, 30, 8.5, 'FD'); // 'F' = relleno

    // Texto encima del rectángulo

    doc.setTextColor(0, 0, 0); // texto negro
    doc.text(`${textoEtiqueta8} ${valor8 === 1 ? '' : ''}`, 90, posY8 + 5, { align: 'center' });

    //---------------------------------------------------------------------------------------------
    // Tamaño de fuente
    doc.setFontSize(10);

    // Posición base
    const posY9 = lastY + 61.5; // ajusta según tu diseño

    // Texto y valor
    const textoEtiqueta9 = 'Bluetooth';
    const valor9 = Number(servicio.bluetooth ?? 0); // convierte a número
    //let fillColor: [number, number, number];
    // Determinar color de fondo según valor

    if (valor9 === 1) {
      fillColor = [80, 245, 39]; // verde
    } else if (valor9 === 0) {
      fillColor = [229, 255, 51]; // amarillo
    } else {
      fillColor = [245, 73, 39]; // rojo (por si no es 0 ni 1)
    }

    // Dibujar rectángulo de fondo
    doc.setFillColor(...fillColor);
    doc.rect(74, posY9 + 8.5, 30, 8.5, 'FD'); // 'F' = relleno

    // Texto encima del rectángulo

    doc.setTextColor(0, 0, 0); // texto negro
    doc.text(`${textoEtiqueta9} ${valor9 === 1 ? '' : ''}`, 90, posY9 + 13, { align: 'center' });

    //---------------------------------------------------------------------------------------------
    // Tamaño de fuente
    doc.setFontSize(10);

    // Posición base
    const posY10 = lastY + 61.5; // ajusta según tu diseño

    // Texto y valor
    const textoEtiqueta10 = 'Bluetooth';
    const valor10 = Number(servicio.bluetooth ?? 0); // convierte a número
    //let fillColor: [number, number, number];
    // Determinar color de fondo según valor

    if (valor10 === 1) {
      fillColor = [80, 245, 39]; // verde
    } else if (valor10 === 0) {
      fillColor = [229, 255, 51]; // amarillo
    } else {
      fillColor = [245, 73, 39]; // rojo (por si no es 0 ni 1)
    }

    // Dibujar rectángulo de fondo
    doc.setFillColor(...fillColor);
    doc.rect(74, posY10 + 8.5, 30, 8.5, 'FD'); // 'F' = relleno

    // Texto encima del rectángulo

    doc.setTextColor(0, 0, 0); // texto negro
    doc.text(`${textoEtiqueta10} ${valor10 === 1 ? '' : ''}`, 90, posY10 + 13, { align: 'center' });

    //---------------------------------------------------------------------------------------------
    // Tamaño de fuente
    doc.setFontSize(10);

    // Posición base
    const posY11 = lastY + 61.5; // ajusta según tu diseño

    // Texto y valor
    const textoEtiqueta11 = 'Teclado';
    const valor11 = Number(servicio.teclado ?? 0); // convierte a número
    //let fillColor: [number, number, number];
    // Determinar color de fondo según valor

    if (valor11 === 1) {
      fillColor = [80, 245, 39]; // verde
    } else if (valor11 === 0) {
      fillColor = [229, 255, 51]; // amarillo
    } else {
      fillColor = [245, 73, 39]; // rojo (por si no es 0 ni 1)
    }

    // Dibujar rectángulo de fondo
    doc.setFillColor(...fillColor);
    doc.rect(74, posY11 + 17, 30, 8.5, 'FD'); // 'F' = relleno

    // Texto encima del rectángulo

    doc.setTextColor(0, 0, 0); // texto negro
    doc.text(`${textoEtiqueta11} ${valor11 === 1 ? '' : ''}`, 90, posY11 + 22, { align: 'center' });

    //---------------------------------------------------------------------------------------------
    // Tamaño de fuente
    doc.setFontSize(10);

    // Posición base
    const posY12 = lastY + 61.5; // ajusta según tu diseño

    // Texto y valor
    const textoEtiqueta12 = 'Micrófono';
    const valor12 = Number(servicio.microfono ?? 0); // convierte a número
    //let fillColor: [number, number, number];
    // Determinar color de fondo según valor

    if (valor12 === 1) {
      fillColor = [80, 245, 39]; // verde
    } else if (valor12 === 0) {
      fillColor = [229, 255, 51]; // amarillo
    } else {
      fillColor = [245, 73, 39]; // rojo (por si no es 0 ni 1)
    }

    // Dibujar rectángulo de fondo
    doc.setFillColor(...fillColor);
    doc.rect(74, posY12 + 25.5, 30, 8.5, 'FD'); // 'F' = relleno

    // Texto encima del rectángulo

    doc.setTextColor(0, 0, 0); // texto negro
    doc.text(`${textoEtiqueta12} ${valor12 === 1 ? '' : ''}`, 90, posY12 + 31, { align: 'center' });

    //------------------------------------------------------------------------------------------------------
     // Dibujar fondo negro para el título
    const pageWidth16 = 118;
    const titleText16 = 'Observacion';
    const rectWidth16 = 90; // ancho del fondo igual a la primera tabla
    const rectHeight16 = 8;
    const offsetX = 147;
    doc.setFillColor(0, 0, 0);
    doc.rect((pageWidth16 - rectWidth16) / 2 + offsetX, lastY + 53, rectWidth16, rectHeight16, 'F');

    // Escribir texto centrado sobre el fondo
    doc.setTextColor(225, 225, 225);
    doc.text(titleText16, pageWidth16 / 2 + offsetX, lastY + 58, { align: 'center' });

    const rows7 = [[servicio.observaciones ?? '']];

    // ── Primera tabla ──
    autoTable(doc, {
      body: rows7,
      theme: 'plain',
      startY: 157,
      styles: {
        fontSize: 10,
        halign: 'center',
        lineColor: [0, 0, 0], // borde negro también en el encabezado
        lineWidth: 0.3,
        cellPadding: { top: 2, bottom: 2 }, // margen vertical
        overflow: 'linebreak',
      },
      headStyles: {
        fontSize: 9,
        textColor: [0, 0, 0],
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 90 },
      },
      tableWidth: 'wrap',
      //margin: { left: 161.1 },
    });

      const rows13 = [['Password: ', servicio.pass ?? '']];
    autoTable(doc, {
      body: rows13,
      theme: 'grid',
      startY: 180,
      styles: {
        font: 'helvetica', // fuente
        fontStyle: 'bold', // negrita
        //textColor: [0, 0, 0], // negro puro
        fontSize: 7,
        cellPadding: 1,
        halign: 'center',
      },
      headStyles: {
        fontSize: 8,
        //fillColor: [245, 212, 59],
        textColor: [0, 0, 0],
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 40, fillColor: [0, 0, 0], textColor: [225, 225, 225] },
        1: { cellWidth: 50, textColor: [232, 2, 2] },
      },
      tableWidth: 'wrap',
    });

    // Dibujar fondo negro para el título
    const pageWidth17 = 118;
    const titleText17 = 'Diagnosticos';
    const rectWidth17 = 90; // ancho del fondo igual a la primera tabla
    const rectHeight17 = 8;
    const offsetX1 = 147;
    doc.setFillColor(0, 0, 0);
    doc.rect((pageWidth17 - rectWidth17) / 2 + offsetX1, lastY + 53, rectWidth17, rectHeight17, 'F');

    // Escribir texto centrado sobre el fondo
    doc.setTextColor(225, 225, 225);
    doc.text(titleText17, pageWidth17 / 2 + offsetX1, lastY + 58, { align: 'center' });

    const rows8 = [[servicio.diagnosticos ?? '']];

    // ── Primera tabla ──
    autoTable(doc, {
      body: rows8,
      theme: 'plain',
      startY: 105,
      styles: {
        fontSize: 10,
        halign: 'center',
        lineColor: [0, 0, 0], // borde negro también en el encabezado
        lineWidth: 0.3,
        cellPadding: { top: 2, bottom: 2 }, // margen vertical
        overflow: 'linebreak',
      },
      headStyles: {
        fontSize: 9,
        textColor: [0, 0, 0],
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 90 },
      },
      tableWidth: 'wrap',
      margin: { left: 161.1 },
    });

    const costoFormateado = servicio.costo
      ? `$${Number(servicio.costo).toFixed(2)} M.N.`
      : '$0.00 M.N.';

    // Crear la fila con el formato deseado
    const rows17 = [['Costo:', costoFormateado]];

    autoTable(doc, {
      body: rows17,
      theme: 'grid',
      startY: 125,
      styles: {
        font: 'helvetica',
        fontStyle: 'bold',
        fontSize: 7,
        cellPadding: 1,
        halign: 'center',
      },
      headStyles: {
        fontSize: 8,
        textColor: [0, 0, 0],
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 40, fillColor: [0, 0, 0], textColor: [225, 225, 225] },
        1: { cellWidth: 50, textColor: [0, 0, 0] },
      },
      tableWidth: 'wrap',
      margin: { left: 161.1 },
    });
    const importante = `
IMPORTANTE:
1.- La información contenida en la computadora es responsabilidad del cliente, KatPC no se hace responsable por información perdida o dañada a causa de virus u otros programas. 
2.- Los programas no se respaldan, la reinstalacion de los mismos es realizadas por responsabilidad del cliente, asi como la información contenida en ellos.
3.- La empresa no se responsabiliza por daños que pudieran surgir raiz del problema de origen, o al realizar la reparación.
4.- En caso de requerir refacciones, y estas no estén en exitencia, se solicitara un anticipo del 50% de su valor para procesar el pedido. Una vez generada la orden no es cancelable.
5.- Es importante revisar el equipo al momento de la entrega ya que KatPC no se hace responsable una vez fuera del establecimiento.
6.- El servicio tiene una garantia de 15 dias que se invalidará si existen alternaciones realizadas por el cliebnte en hardware o software.
7.- La garantía en refacciones es la que especifique el fabricantye, KatPC solo ejerce como intermediario.
8.- El cliente cuenta con 30 días naturales para la recolección de su equipo una vez notificado de poder pasar a recogerlo, una vez vencido el plazo la empresa no se hace responsable de éste.
9.- La orden de servicio es necesaria para pasar a recoger el equipo, en caso de no poder recoger personalmente se solicitará un mensaje con la forto de la identificación de quien recoge para por parte del cliente para validar.
`;
    doc.setTextColor(0, 0, 0);
    // Margen y ancho máximo
    const marginLeft = 161.1;
    const maxWidth = 180; // o el ancho que necesites

    // Divide el texto en líneas automáticas
    const lines = doc.splitTextToSize(importante, maxWidth);

    // Dibuja el texto
    doc.setFontSize(5);
    doc.text(lines, marginLeft, lastY + 85);

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
