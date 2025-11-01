import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Equipo } from '../model/equipo.model';
import { LoginUser } from '../model/loginuser.model';
import { Servicio } from '../model/servicio.model';
@Injectable({ providedIn: 'root' })
export class EquipoService {
  //private authUrl = 'https://localhost:7066/api/KatPCUsuariosMaster';
  //private apiUrl = 'https://localhost:7066/api/KatPCDatosMaster'; // tu endpoint
  //private apiUrlS = 'https://localhost:7066/api/KatPCServiciosMaster'; // tu endpoint
  private authUrl = 'https://www.katpc.somee.com/api/KatPCUsuariosMaster';
  private apiUrl = 'https://www.katpc.somee.com/api/KatPCDatosMaster'; // tu endpoint
  private apiUrlS = 'https://www.katpc.somee.com/api/KatPCServiciosMaster'; // tu endpoint

  constructor(private http: HttpClient) {}
                //Login
  login(user: LoginUser): Observable<any> {
  return this.http.post<any>(`${this.authUrl}/login`, user);
}

                //DATOS
  getEquipos(): Observable<Equipo[]> {
    return this.http.get<Equipo[]>(this.apiUrl);
  }

  createEquipo(equipo: Equipo): Observable<Equipo> {
    return this.http.post<Equipo>(this.apiUrl, equipo);
  }

  updateEquipo(id: number, equipo: Equipo): Observable<Equipo> {
    return this.http.put<Equipo>(`${this.apiUrl}/${id}`, equipo);
  }

  deleteEquipo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

            //Servicios
  getServicios(): Observable<Servicio[]> {
    return this.http.get<Servicio[]>(this.apiUrlS);
  }

  createServicios(servicio: Servicio): Observable<Servicio> {
    return this.http.post<Servicio>(this.apiUrlS, servicio);
  }

  updateServicios(id: number, servicio: Servicio): Observable<Servicio> {
    return this.http.put<Servicio>(`${this.apiUrlS}/${id}`, servicio);
  }

  deleteServicios(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrlS}/${id}`);
  }
}
