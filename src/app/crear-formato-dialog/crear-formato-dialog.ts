import { HttpClient } from '@angular/common/http';
import { Component, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Equipo } from '../model/equipo.model';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-crear-formato-dialog',
  standalone: false,
  templateUrl: './crear-formato-dialog.html',
  styleUrl: './crear-formato-dialog.css',
})
export class CrearFormatoDialog {
  form: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CrearFormatoDialog>,
    @Inject(MAT_DIALOG_DATA) public data: Equipo,
    private http: HttpClient // <-- inyecta HttpClient
  ) {
    //console.log('Datos recibidos en el dialog:', data);
    this.form = this.fb.group({
      idEquipo: [data?.idEquipo],
      modelo: [data?.modelo],
      numserie: [data?.numserie],
      procesador: [data?.procesador],
      frecueProc: [data?.frecueProc],
      ram: [data?.ram],
      tiporam: [data?.tiporam],
      almacenamiento: [data?.almacenamiento],
      tipoalmacen: [data?.tipoalmacen],
      pantalla: [data?.pantalla],
      frecuepantalla: [data?.frecuepantalla],
      graficos: [data?.graficos],
      tipograficos: [data?.tipograficos],
      usooficina: [data?.usooficina],
      maximaexigencia: [data?.maximaexigencia],
      vidautil: [data?.vidautil],
      arranque: [data?.arranque],
      videoconfe: [data?.videoconfe],
      navegacion: [data?.navegacion],
      excelprograma: [data?.excelprograma],
      escrituradocum: [data?.escrituradocum],
      edicionfotoscad: [data?.edicionfotoscad],
      edicionvideo: [data?.edicionvideo],
      videojuego: [data?.videojuego],
      tecladoilumi: [data?.tecladoilumi],
      windowshello: [data?.windowshello],
      puertosusb: [data?.puertosusb],
      salidavideo: [data?.salidavideo],
      wifi: [data?.wifi],
      puertotipoc: [data?.puertotipoc],
      microfono: [data?.microfono],
      touchpad: [data?.touchpad],
      bluetooth: [data?.bluetooth],
      cd: [data?.cd],
      puertoauxiliar: [data?.puertoauxiliar],
      bocinas: [data?.bocinas],
      pantallatactil: [data?.pantallatactil],
      webcam: [data?.webcam],
      pantallad: [data?.pantallad],
      botones: [data?.pantallad],
      grado: [data?.grado],
      condicionfisica: [data?.condicionfisica],
      interpretacion: [data?.interpretacion],
      encargado: [data?.encargado],
      fechaprueba: [data?.fechaprueba],
    });
    // Observa cambios en los tres campos
  this.form.get('arranque')?.valueChanges.subscribe(() => this.updateInterpretacion());
  this.form.get('videoconfe')?.valueChanges.subscribe(() => this.updateInterpretacion());
  this.form.get('navegacion')?.valueChanges.subscribe(() => this.updateInterpretacion());

  this.form.get('excelprograma')?.valueChanges.subscribe(() => this.updateInterpretacion());
  this.form.get('escrituradocum')?.valueChanges.subscribe(() => this.updateInterpretacion());
  
  this.form.get('edicionfotoscad')?.valueChanges.subscribe(() => this.updateInterpretacion());
  this.form.get('edicionvideo')?.valueChanges.subscribe(() => this.updateInterpretacion());
  
  this.form.get('videojuego')?.valueChanges.subscribe(() => this.updateInterpretacion());
  }
  onGradoChange(grado: string) {
    let descripcion = '';

    switch (grado) {
      case 'A+':
        descripcion = 'El equipo está impacable o como nuevo, funciona todo y está en una condicion similar al que estaria un equipo nuevo.';
        break;
      case 'A':
        descripcion = 'El equipo se encuentra en muy buenas condiciones estéticas y funcionales. Puede presentar ligeros detalles cosméticos únicamente';
        break;
      case 'B':
        descripcion = 'El equipo presenta desgaste de uso normal y moderado por el tiempo de uso, su funcionamiento no presenta detalle alguno.';
        break;
      case 'B-':
        descripcion = 'El equipo presenta degaste de uso normal y moderado. Algún componente no esencial puede tener errores al operar, más adelante se menciona si eso es así.';
        break;
      case 'C':
        descripcion = 'Equipo en condición estética aceptable, al menos la mayoría de las funciones opera con normalidad, abajo se menciona si la funcionalidad no es correcta.';
        break;
      case 'N':
        descripcion = 'Equipo completamente nuevo.'
        break;
      case 'F':
        descripcion = 'Equipo para piezas o refacciones, no opera correctamente o su condición física está comprometida.';
        break;
      default:
        descripcion = '';
        break;
    }

    // Actualiza el FormControl de forma reactiva
    this.form.patchValue({ condicionfisica: descripcion });
  }
  updateInterpretacion() {
  const arranque = Number(this.form.value.arranque);
  const videoconfe = Number(this.form.value.videoconfe);
  const navegacion = Number(this.form.value.navegacion);

  const excelprograma = Number(this.form.value.excelprograma);
  const escrituradocum = Number(this.form.value.escrituradocum);

  const edicionfotoscad = Number(this.form.value.edicionfotoscad);
  const edicionvideo = Number(this.form.value.edicionvideo);

  const videojuego = Number(this.form.value.videojuego);

  let textoArranque = '';
  let textoVideoconfe = '';
  let textoNavegacion = '';

  let textoExcelPrograma = '';
  let textoEscrituradocum = '';

  let textoEdicionFotos = '';
  let textoEdicionVideo = '';
  
  let textoVideojue = '';

  // ---- Escenciales ----
  if (arranque >= 7000) textoArranque = 'Los programas arrancan al instante y el sistema es responsivo desde el momento en el que inicia.';
  else if (arranque >= 5000) textoArranque = 'Los programas abren rápidamente y no demoran mas de unos segundos para iniciar, hay que esperar unos 15 después del arranque para que el sistema esté completamente responsivo. ';
  else if (arranque > 0) textoArranque = 'Puede demorar en iniciar los programas, el sisitema puede tardar más de un minuto en sentirse completamente responsivo.';

  if (videoconfe >= 7000) textoVideoconfe = 'Puede soportar videoconferencias con más de 20 participantes en resolución 4K sin ningun retraso en la transmisión.';
  else if (videoconfe >= 5000) textoVideoconfe = 'Soporta videoconferencias de hasta 10 participantes en resolución Full HD sin retrasos.';
  else if (videoconfe > 0) textoVideoconfe = 'El equipo soporta con fluidez videoconferencias de 1 o 2 participantes en resoluciones bajas, no es recomendado para trabajos que necesitan este tipo de aplicaciones, como un call center.';

  if (navegacion >= 7000) textoNavegacion = 'Puede abrir más de 40 pestañas de navegación sin dificultad alguna y ver contenido de streaming en resoluciones 4K sin retrasos.';
  else if (navegacion >= 5000) textoNavegacion = 'Puede abrir hasta 20 pestañas en el navegador y reproducir contenido via streaming hasta 1080p sin retraso alguno. ';
  else if (navegacion > 0) textoNavegacion = 'Hasta 10 pestañas en el navegador, el contenido por streaming puede llegar a tener retrasos momentáneos.';

  // ---- Productividad ----
  if (excelprograma >= 7000) textoExcelPrograma = 'Soporta trabajo con bases de datos y machine learning, apta para el trabajo de un desarrollador senior.';
  else if (excelprograma >= 5000) textoExcelPrograma = 'Apta para hojas de excel medianamente complejas con scripts y unos miles de datos sin retraso. ';
  else if (excelprograma > 0) textoExcelPrograma = 'Puede elaborar hojas básicas de excel, pero puede presentar retrasos al momento de aplicar fómulas con grandes cantidades de datos.';

  if (escrituradocum >= 7000) textoEscrituradocum = 'Ideal para redactar libros técnicos con más de 200 páginas sin retrasos.';
  else if (escrituradocum >= 5000) textoEscrituradocum = 'Soporta la elaboración de documentos de hasta 100 páginas con gráficos e imágenes. ';
  else if (escrituradocum > 0) textoEscrituradocum = 'Puede redactar documentos básicos sin imágenes ni gráficos sin presentar algún retraso.';
  
  // ----Edicion de contenido digital ----
  if (edicionfotoscad >= 5000) textoEdicionFotos = 'Planos de grán tamaño y edición de imágenes sin retraso alguno. ';
  else if (edicionfotoscad >= 3500) textoEdicionFotos = 'Edición de fotografías profesionales con hasta 20 capas y planos de un tamaño considerable sin retrasos.';
  else if (edicionfotoscad >= 2500) textoEdicionFotos = 'Edición de fotografía con pequeños retoques sin problema y planos de un tamaño reducido (trabajos estudiantiles, por ejemplo).';
  else if (edicionfotoscad > 0) textoEdicionFotos = 'Inviable para la edición de fotos o diseño auxiliado por computadora (CAD).';

  if (edicionvideo >= 4000) textoEdicionVideo = 'Es capaz de editar videos por lo menos a 4K 30FPS con efectos avanzados y un tiempo de renderizado medianamente rápido.';
  else if (edicionvideo >= 2500) textoEdicionVideo = 'Es capaz de editar contenido hasta 1080p 30FPS, incluir transiciones y el tiempo de renderizado puede ser algo prolongado.';
  else if (edicionvideo >= 1500) textoEdicionVideo = 'Puede editar videos cortos en resolución 720p o inferior y podría tener retrasos al agregarle transiciones, el tiempo de renderizado puede ser largo.';
  else if (edicionvideo > 0) textoEdicionVideo = 'Inviable para la edición de contenido multimedia.';
  
  // ---- Gamming y Render ----
  if (videojuego >= 4000) textoVideojue = 'Renderizado 3D de escenas complejas  en cosa de segundos, capaz de jugar videojuegos AAA modernos a por lo menos resolución Full HD 60FPS con al menos calidad gráfica media.';
  else if (videojuego >= 2500) textoVideojue = 'Capaz de jugar títulos AAA no tan modernos a calidades equiparables a una consola (Full HD a 30FPS) y renderizar escenas 3D de tamaño moderado en cosa de minutos.';
  else if (videojuego >= 1500) textoVideojue = 'Trabaja correctamente para juegos retro y emuladores, puede renderizar modelos 3D simples pero puede demorar horas exportando.';
  else if (videojuego > 0) textoVideojue = 'No es viable para videojuegos ni renders 3D.';

  // Combina todo
  const interpretacion = [textoArranque, textoVideoconfe, textoNavegacion, textoExcelPrograma, textoEscrituradocum, textoEdicionFotos, textoEdicionVideo, textoVideojue]
    .filter(t => t) // quita vacíos
    .join(' ');

  this.form.patchValue({ interpretacion }, { emitEvent: false }); // Evita bucles
}
  guardarEquipo() {
    if (this.form.valid) {
      this.loading = true; // <-- comienza loading
      const equipoActualizado: Equipo = {
        // DATOS
        idEquipo: this.form.value.idEquipo,
        modelo: this.form.value.modelo || '',
        numserie: this.form.value.numserie || '',
        procesador: this.form.value.procesador || '',
        frecueProc: this.form.value.frecueproc || this.form.value.frecueProc, // <-- aquí
        ram: this.form.value.ram || '',
        tiporam: this.form.value.tiporam || '',
        almacenamiento: this.form.value.almacenamiento || '',
        tipoalmacen: this.form.value.tipoalmacen || '',
        pantalla: this.form.value.pantalla || '',
        frecuepantalla: this.form.value.frecuepantalla || '',
        graficos: this.form.value.graficos || '',
        tipograficos: this.form.value.tipograficos || '',

        // PC MARCK
        usooficina: this.form.value.usooficina || '',
        maximaexigencia: this.form.value.maximaexigencia || '',
        vidautil: this.form.value.vidautil || '',
        arranque: this.form.value.arranque || '',
        videoconfe: this.form.value.videoconfe || '',
        navegacion: this.form.value.navegacion || '',
        excelprograma: this.form.value.excelprograma || '',
        escrituradocum: this.form.value.escrituradocum || '',
        edicionfotoscad: this.form.value.edicionfotoscad || '',
        edicionvideo: this.form.value.edicionvideo || '',
        videojuego: this.form.value.videojuego || '',
        tecladoilumi: this.form.value.tecladoilumi ?? false,
        windowshello: this.form.value.windowshello ?? false,
        puertosusb: this.form.value.puertosusb ?? false,
        salidavideo: this.form.value.salidavideo ?? false,
        wifi: this.form.value.wifi ?? false,
        puertotipoc: this.form.value.puertotipoc ?? false,
        microfono: this.form.value.microfono ?? false,
        touchpad: this.form.value.touchpad ?? false,
        bluetooth: this.form.value.bluetooth ?? false,
        cd: this.form.value.cd ?? false,
        puertoauxiliar: this.form.value.puertoauxiliar ?? false,
        bocinas: this.form.value.bocinas ?? false,
        pantallatactil: this.form.value.pantallatactil ?? false,
        webcam: this.form.value.webcam ?? false,
        pantallad: this.form.value.pantallad ?? false,
        botones: this.form.value.botones ?? false,

        // INTERPRETACION
        grado: this.form.value.grado,
        condicionfisica: this.form.value.condicionfisica,
        interpretacion: this.form.value.interpretacion,
        encargado: this.form.value.encargado || '',
        fechaprueba: this.form.value.fechaprueba || '',
      };

      if (equipoActualizado.idEquipo && equipoActualizado.idEquipo > 0) {
        // UPDATE
        this.http
          .put(
            `https://www.katpc.somee.com/api/KatPCDatosMaster/${equipoActualizado.idEquipo}`,
            { ...equipoActualizado, idEquipo: equipoActualizado.idEquipo } // forzar que coincida
          )
          .subscribe({
            next: (response) => {
              //console.log('Equipo actualizado:', response);
              //console.log('PUT payload:', equipoActualizado);
              this.loading = true;
              window.location.reload();
              this.dialogRef.close(this.form.value);
            },
            error: (error) => {
              //console.log('PUT payload:', equipoActualizado);
              console.error('Error al actualizar el equipo:', error);
            },
          });
      } else {
        // CREATE
        this.http.post('https://www.katpc.somee.com/api/KatPCDatosMaster', equipoActualizado).subscribe({
          next: (response) => {
            //console.log('Equipo creado correctamente:', response);
            this.loading = true;
            console.log('POST payload:', equipoActualizado);

            // 👉 LIMPIAR FORMULARIOS
            this.form.reset();

            this.dialogRef.close(this.form.value);

            window.location.reload();
          },
          error: (error) => {
            console.error('Error al guardar el equipo:', error);
          },
        });
      }
    }
  }

  siguiente() {}

  cancelar() {
    this.loading = true;
    this.form.reset();
    this.dialogRef.close();
  }
}
