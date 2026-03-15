import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

export interface UsuarioMDA {
  id: string;
  nombre: string;
  correo: string;
  documento: string;
  rol: 'ADMIN' | 'AGENTE' | 'USUARIO';
  area: string;
  estado: 'ACTIVO' | 'INACTIVO' | 'BLOQUEADO';
  ultimoAcceso: string | null;
}

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatInputModule,
    MatSnackBarModule
  ],
  templateUrl: './users-management.html',
  styleUrls: ['./users-management.css'],
})
export class UsersManagementComponent implements OnInit {
  private readonly snack = inject(MatSnackBar);

  public loading = false;

  public displayedColumns: string[] = [
    'usuario',
    'documento',
    'rol',
    'area',
    'estado',
    'ultimoAcceso',
    'acciones'
  ];

  public all: UsuarioMDA[] = [];
  public view: UsuarioMDA[] = [];

  public roleOptions = ['TODOS', 'ADMIN', 'AGENTE', 'USUARIO'];
  public statusOptions = ['TODOS', 'ACTIVO', 'INACTIVO', 'BLOQUEADO'];

  public filters = {
    search: '',
    rol: 'TODOS',
    estado: 'TODOS'
  };

  ngOnInit(): void {
    this.loadUsers();
  }

  public loadUsers(): void {
    this.loading = true;

    // Simulación temporal. Luego aquí conectas tu servicio real.
    setTimeout(() => {
      this.all = [
        {
          id: 'USR-001',
          nombre: 'Jose David Cardona',
          correo: 'jose@email.com',
          documento: '123456789',
          rol: 'ADMIN',
          area: 'Mesa de Ayuda',
          estado: 'ACTIVO',
          ultimoAcceso: '2026-03-15T18:40:00'
        },
        {
          id: 'USR-002',
          nombre: 'Laura Gómez',
          correo: 'laura@email.com',
          documento: '109876543',
          rol: 'AGENTE',
          area: 'Infraestructura',
          estado: 'ACTIVO',
          ultimoAcceso: '2026-03-15T17:15:00'
        },
        {
          id: 'USR-003',
          nombre: 'Carlos Ruiz',
          correo: 'carlos@email.com',
          documento: '111222333',
          rol: 'USUARIO',
          area: 'Admisiones',
          estado: 'INACTIVO',
          ultimoAcceso: '2026-03-14T11:20:00'
        },
        {
          id: 'USR-004',
          nombre: 'Ana Pérez',
          correo: 'ana@email.com',
          documento: '444555666',
          rol: 'AGENTE',
          area: 'Sistemas',
          estado: 'BLOQUEADO',
          ultimoAcceso: null
        }
      ];

      this.applyFilter();
      this.loading = false;
    }, 300);
  }

  public applyFilter(): void {
    const q = this.filters.search.trim().toLowerCase();

    this.view = this.all.filter((u) => {
      const matchSearch =
        !q ||
        u.nombre.toLowerCase().includes(q) ||
        u.correo.toLowerCase().includes(q) ||
        u.documento.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q);

      const matchRol =
        this.filters.rol === 'TODOS' ||
        u.rol === this.filters.rol;

      const matchEstado =
        this.filters.estado === 'TODOS' ||
        u.estado === this.filters.estado;

      return matchSearch && matchRol && matchEstado;
    });
  }

  public clearFilters(): void {
    this.filters = {
      search: '',
      rol: 'TODOS',
      estado: 'TODOS'
    };
    this.applyFilter();
  }

  public createUser(): void {
    this.snack.open('Abrir formulario de creación de usuario', 'Cerrar', {
      duration: 2500
    });
  }

  public editUser(user: UsuarioMDA): void {
    this.snack.open(`Editar usuario: ${user.nombre}`, 'Cerrar', {
      duration: 2500
    });
  }

  public toggleStatus(user: UsuarioMDA): void {
    if (user.estado === 'ACTIVO') {
      user.estado = 'INACTIVO';
      this.snack.open(`Usuario ${user.nombre} desactivado`, 'Cerrar', {
        duration: 2500
      });
    } else {
      user.estado = 'ACTIVO';
      this.snack.open(`Usuario ${user.nombre} activado`, 'Cerrar', {
        duration: 2500
      });
    }

    this.applyFilter();
  }

  public blockUser(user: UsuarioMDA): void {
    user.estado = 'BLOQUEADO';
    this.snack.open(`Usuario ${user.nombre} bloqueado`, 'Cerrar', {
      duration: 2500
    });
    this.applyFilter();
  }

  public getRoleClass(rol: string): string {
    if (rol === 'ADMIN') return 'admin';
    if (rol === 'AGENTE') return 'agent';
    return 'user';
  }

  public getStatusClass(estado: string): string {
    if (estado === 'ACTIVO') return 'activo';
    if (estado === 'INACTIVO') return 'inactivo';
    return 'bloqueado';
  }
}