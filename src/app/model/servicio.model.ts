import { DecimalPipe } from "@angular/common";

export interface Servicio {
  idServicio?: number;
  folio?: number;
  marca?: string;
  modelo?: string;
  serie?: string;
  fechaderecepcion?: string;
  nombre?: string;
  telefono?: string;
  
  enciende?: string;
  wifi?: string;
  puertosusb?: string;
  bluetooth?: string;
  bocinas?: string;
  teclado?: string;
  pantalla?: string;
  microfono?: string;
  touchpad?: string;
  webcam?: string;  
  
  observaciones?: string;
  pass?: string;

  descripciondiagnostico?: string;
  costo?: number;

  estado?: string;

}
