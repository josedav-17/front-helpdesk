import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';

import {
  UsersService,
  UserDto,
  UserRole
} from '../../../../../shared/src/lib/users.service';

export interface UsuarioMDA {
  id: string;
  nombre: string;
  correo: string;
  telefono: string;
  rol: 'ADMIN' | 'MESA' | 'AREA' | 'USUARIO';
  area: string;
  estado: 'ACTIVO' | 'INACTIVO';
  is_active: boolean;
}

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value ?? '';
  const confirmPassword = control.get('confirmPassword')?.value ?? '';

  if (!confirmPassword) return null;
  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatInputModule,
    MatSnackBarModule,
    MatMenuModule,
  ],
  templateUrl: './users-management.html',
  styleUrls: ['./users-management.scss']
})
export class UsersManagementComponent implements OnInit {
  private readonly snack = inject(MatSnackBar);
  private readonly usersService = inject(UsersService);
  private readonly fb = inject(FormBuilder);

  public loading = false;
  public savingUser = false;
  public showUserModal = false;
  public editingUserId: string | null = null;

  public displayedColumns: string[] = ['usuario', 'correo', 'area', 'rol', 'estado', 'acciones'];

  public all: UsuarioMDA[] = [];
  public view: UsuarioMDA[] = [];
  public dataSource = new MatTableDataSource<UsuarioMDA>([]);

  public roleOptions: Array<'TODOS' | UserRole> = ['TODOS', 'ADMIN', 'MESA', 'AREA', 'USUARIO'];
  public statusOptions: Array<'TODOS' | 'ACTIVO' | 'INACTIVO'> = ['TODOS', 'ACTIVO', 'INACTIVO'];

  public roleOptionsForm: UserRole[] = ['ADMIN', 'MESA', 'AREA', 'USUARIO'];

  public operationalAreaOptions: string[] = [
    'SISTEMAS',
    'SOPORTE TÉCNICO',
    'REDES',
    'INFRAESTRUCTURA',
    'DESARROLLO',
    'MESA DE AYUDA'
  ];

  public filters = {
    search: '',
    rol: 'TODOS' as 'TODOS' | UserRole,
    estado: 'TODOS' as 'TODOS' | 'ACTIVO' | 'INACTIVO'
  };

  public userForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    correo: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.maxLength(30)]],
    password: ['', [Validators.minLength(6)]],
    confirmPassword: [''],
    rol: ['USUARIO' as UserRole, [Validators.required]],
    area: [''],
    is_active: [true]
  }, { validators: passwordMatchValidator });

  ngOnInit(): void {
    this.loadUsers();

    this.userForm.get('rol')?.valueChanges.subscribe((rol) => {
      this.applyRoleRules(rol as UserRole);
    });
  }

  public loadUsers(): void {
    this.loading = true;

    this.usersService.listUsers().subscribe({
      next: (rows) => {
        this.all = rows.map((u) => this.mapUser(u));
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error('Error cargando usuarios:', err);
        this.snack.open(
          err?.error?.detail || 'No se pudieron cargar los usuarios',
          'Cerrar',
          { duration: 4000 }
        );
      }
    });
  }

  private mapUser(u: UserDto): UsuarioMDA {
    return {
      id: u.id,
      nombre: u.nombre || 'Sin nombre',
      correo: u.email || 'Sin correo',
      telefono: (u as any).telefono || '',
      rol: u.rol,
      area: u.area || 'Sin área',
      estado: u.is_active ? 'ACTIVO' : 'INACTIVO',
      is_active: u.is_active
    };
  }

  public applyFilter(): void {
    const q = this.filters.search.trim().toLowerCase();

    this.view = this.all.filter((u) => {
      const matchSearch =
        !q ||
        u.nombre.toLowerCase().includes(q) ||
        u.correo.toLowerCase().includes(q) ||
        u.telefono.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q);

      const matchRol =
        this.filters.rol === 'TODOS' ||
        u.rol === this.filters.rol;

      const matchEstado =
        this.filters.estado === 'TODOS' ||
        u.estado === this.filters.estado;

      return matchSearch && matchRol && matchEstado;
    });

    this.dataSource.data = [...this.view];
  }

  public clearFilters(): void {
    this.filters = {
      search: '',
      rol: 'TODOS',
      estado: 'TODOS'
    };
    this.applyFilter();
  }

  public openCreateUserModal(): void {
    this.editingUserId = null;
    this.showUserModal = true;

    this.userForm.reset({
      nombre: '',
      correo: '',
      telefono: '',
      password: '',
      confirmPassword: '',
      rol: 'USUARIO',
      area: '',
      is_active: true
    });

    this.applyRoleRules('USUARIO');
  }

  public editUser(user: UsuarioMDA): void {
    this.editingUserId = user.id;
    this.showUserModal = true;

    this.userForm.reset({
      nombre: user.nombre,
      correo: user.correo,
      telefono: user.telefono,
      password: '',
      confirmPassword: '',
      rol: user.rol,
      area: user.area === 'Sin área' ? '' : user.area,
      is_active: user.is_active
    });

    this.applyRoleRules(user.rol);
  }

  public closeUserModal(): void {
    this.showUserModal = false;
    this.editingUserId = null;

    this.userForm.reset({
      nombre: '',
      correo: '',
      telefono: '',
      password: '',
      confirmPassword: '',
      rol: 'USUARIO',
      area: '',
      is_active: true
    });
  }

  private applyRoleRules(rol: UserRole): void {
    const areaCtrl = this.userForm.get('area');
    const passwordCtrl = this.userForm.get('password');
    const confirmPasswordCtrl = this.userForm.get('confirmPassword');

    if (!areaCtrl || !passwordCtrl || !confirmPasswordCtrl) return;

    if (this.editingUserId) {
      passwordCtrl.clearValidators();
      passwordCtrl.setValidators([Validators.minLength(6)]);
      confirmPasswordCtrl.clearValidators();
    } else {
      passwordCtrl.clearValidators();
      passwordCtrl.setValidators([Validators.required, Validators.minLength(6)]);
      confirmPasswordCtrl.setValidators([Validators.required]);
    }

    passwordCtrl.updateValueAndValidity({ emitEvent: false });
    confirmPasswordCtrl.updateValueAndValidity({ emitEvent: false });

    switch (rol) {
      case 'ADMIN':
        areaCtrl.setValue('', { emitEvent: false });
        areaCtrl.clearValidators();
        break;

      case 'MESA':
        areaCtrl.setValue('MESA DE AYUDA', { emitEvent: false });
        areaCtrl.setValidators([Validators.required]);
        break;

      case 'AREA':
        if (!this.operationalAreaOptions.includes(areaCtrl.value || '')) {
          areaCtrl.setValue('SISTEMAS', { emitEvent: false });
        }
        areaCtrl.setValidators([Validators.required]);
        break;

      case 'USUARIO':
        areaCtrl.setValue('', { emitEvent: false });
        areaCtrl.clearValidators();
        break;
    }

    areaCtrl.updateValueAndValidity({ emitEvent: false });
  }

  private normalizeAreaForRole(rol: UserRole, area: string): string | null {
    switch (rol) {
      case 'ADMIN':
        return null;
      case 'MESA':
        return 'MESA DE AYUDA';
      case 'AREA':
        return area?.trim() || 'SISTEMAS';
      case 'USUARIO':
        return null;
      default:
        return null;
    }
  }

  public submitUserForm(): void {
    if (this.userForm.invalid || this.savingUser) {
      this.userForm.markAllAsTouched();
      return;
    }

    const formValue = this.userForm.getRawValue();

    if (!this.isEditMode && formValue.password !== formValue.confirmPassword) {
      this.snack.open('Las contraseñas no coinciden', 'Cerrar', { duration: 3000 });
      return;
    }

    this.savingUser = true;

    const normalizedArea = this.normalizeAreaForRole(
      formValue.rol as UserRole,
      formValue.area || ''
    );

    if (this.editingUserId) {
      const payload: any = {
        nombre: formValue.nombre!.trim(),
        email: formValue.correo!.trim(),
        telefono: formValue.telefono?.trim() || null,
        rol: formValue.rol!,
        area: normalizedArea,
        is_active: !!formValue.is_active
      };

      if (formValue.password && formValue.password.trim()) {
        payload.password = formValue.password.trim();
      }

      this.usersService.updateUser(this.editingUserId, payload).subscribe({
        next: (res) => {
          this.savingUser = false;
          this.snack.open(res?.message || 'Usuario actualizado', 'Cerrar', { duration: 3000 });
          this.closeUserModal();
          this.loadUsers();
        },
        error: (err) => {
          this.savingUser = false;
          console.error('Error actualizando usuario:', err);
          this.snack.open(
            err?.error?.detail || 'No se pudo actualizar el usuario',
            'Cerrar',
            { duration: 4000 }
          );
        }
      });

      return;
    }

    this.usersService.createUser({
      nombre: formValue.nombre!.trim(),
      email: formValue.correo!.trim(),
      telefono: formValue.telefono?.trim() || null,
      password: formValue.password!.trim(),
      rol: formValue.rol!,
      area: normalizedArea
    }).subscribe({
      next: (res) => {
        this.savingUser = false;
        this.snack.open(res?.message || 'Usuario creado', 'Cerrar', { duration: 3000 });
        this.closeUserModal();
        this.loadUsers();
      },
      error: (err) => {
        this.savingUser = false;
        console.error('Error creando usuario:', err);
        this.snack.open(
          err?.error?.detail || 'No se pudo crear el usuario',
          'Cerrar',
          { duration: 4000 }
        );
      }
    });
  }

  public toggleStatus(user: UsuarioMDA): void {
    const nextActive = !user.is_active;

    this.usersService.updateUser(user.id, {
      is_active: nextActive
    }).subscribe({
      next: (res) => {
        this.snack.open(
          res?.message || `Usuario ${nextActive ? 'activado' : 'desactivado'}`,
          'Cerrar',
          { duration: 3000 }
        );
        this.loadUsers();
      },
      error: (err) => {
        console.error('Error cambiando estado:', err);
        this.snack.open(
          err?.error?.detail || 'No se pudo cambiar el estado del usuario',
          'Cerrar',
          { duration: 4000 }
        );
      }
    });
  }

  public blockUser(user: UsuarioMDA): void {
    const ok = confirm(`¿Seguro que deseas eliminar al usuario ${user.nombre}?`);
    if (!ok) return;

    this.usersService.deleteUser(user.id).subscribe({
      next: (res) => {
        this.snack.open(res?.message || 'Usuario eliminado', 'Cerrar', { duration: 3000 });
        this.loadUsers();
      },
      error: (err) => {
        console.error('Error eliminando usuario:', err);
        this.snack.open(
          err?.error?.detail || 'No se pudo eliminar el usuario',
          'Cerrar',
          { duration: 4000 }
        );
      }
    });
  }

  public getRoleClass(rol: string): string {
    if (rol === 'ADMIN') return 'admin';
    if (rol === 'MESA') return 'mesa';
    if (rol === 'AREA') return 'area';
    return 'user';
  }

  public getStatusClass(estado: string): string {
    return estado === 'ACTIVO' ? 'activo' : 'inactivo';
  }

  public get isAreaVisible(): boolean {
    const rol = this.userForm.get('rol')?.value as UserRole;
    return rol === 'MESA' || rol === 'AREA';
  }

  public get isAreaEditable(): boolean {
    const rol = this.userForm.get('rol')?.value as UserRole;
    return rol === 'AREA';
  }

  public get isEditMode(): boolean {
    return !!this.editingUserId;
  }
}