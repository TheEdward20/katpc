import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { CrearFormatoDialog } from '../crear-formato-dialog/crear-formato-dialog';

export interface Formato {
  id: number;
  modelo: string;
  numserie: string;
}


const ELEMENT_DATA: Formato[] = [
  { id: 1, modelo: 'Laptop Dell', numserie: 'ABC123' },
  { id: 2, modelo: 'HP ProBook', numserie: 'XYZ456' },
  { id: 3, modelo: 'Lenovo ThinkPad', numserie: 'LMN789' }
];

@Component({
  selector: 'app-crear-formato',
  standalone: false,
  templateUrl: './crear-formato.html',
  styleUrls: ['./crear-formato.css'],
})
export class CrearFormato implements AfterViewInit {
  displayedColumns: string[] = ['id', 'modelo', 'numserie', 'acciones'];
  dataSource = new MatTableDataSource<Formato>(ELEMENT_DATA);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  constructor(private dialog: MatDialog) { }

  crearNuevo() {
    const dialogRef = this.dialog.open(CrearFormatoDialog, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const nuevo: Formato = {
          id: this.dataSource.data.length + 1,
          modelo: result.modelo,
          numserie: result.numserie
        };
        this.dataSource.data = [...this.dataSource.data, nuevo];
      }
    });
  }

  modificar(row: Formato) {
    alert(`Editar: ${row.modelo}`);
  }

  eliminar(row: Formato) {
    this.dataSource.data = this.dataSource.data.filter(r => r.id !== row.id);
  }


  exportarPDF(row: Formato) {
    //alert(`📄 Exportar a PDF: ${row.id} - ${row.modelo}`);
  }


}

