import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../core/auth/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './admin-layout.html',
  styleUrls: ['./admin-layout.scss'],
})
export class AdminLayoutComponent implements OnInit {
  private auth = inject(AuthService);

  isCollapsed = false;
  isAdmin = false;

  user: any | null = null;

  displayName = 'Usuario';
  displayRole = 'Administrador';
  displayEmail = '';

  ngOnInit(): void {
    this.loadUser();
    console.log('USER EN LAYOUT:', this.user);
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  logout(): void {
    this.auth.logout();
    location.href = '/login';
  }

  private loadUser(): void {
    this.user = this.auth.getUser();

    const userRole = (this.user?.rol || this.user?.role || '').trim().toUpperCase();
    this.isAdmin = userRole === 'ADMIN';

    this.displayName =
      this.user?.nombreCompleto ||
      this.user?.nombre ||
      this.user?.nombres ||
      this.user?.name ||
      this.user?.usuario ||
      this.user?.username ||
      this.user?.email ||
      'Usuario';

    this.displayRole =
      this.user?.area_nombre ||
      this.user?.areaNombre ||
      this.user?.area ||
      this.user?.rol_nombre ||
      this.user?.rolNombre ||
      this.mapRole(this.user?.rol) ||
      this.mapRole(this.user?.role) ||
      'Administrador';

    this.displayEmail =
      this.user?.correo ||
      this.user?.email ||
      this.user?.mail ||
      '';
  }

  private mapRole(role?: string): string {
    if (!role) return '';

    switch ((role || '').trim().toUpperCase()) {
      case 'ADMIN':
        return 'Administrador';
      case 'SUPERADMIN':
        return 'Superadministrador';
      case 'TECNICO':
        return 'Técnico';
      case 'MESA':
        return 'Mesa de ayuda';
      case 'AREA':
        return 'Área';
      case 'USUARIO':
        return 'Usuario';
      default:
        return role;
    }
  }

  getInitials(value: string): string {
    if (!value) return 'US';

    const parts = value.trim().split(' ').filter(Boolean);

    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
}