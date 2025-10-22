import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth.service';

@Component({
  selector: 'app-client-header',
  templateUrl: './client-header.component.html',
  styleUrls: ['./client-header.component.css']
})
export class ClientHeaderComponent implements OnInit {
  isLoggedIn = false;
  user: any = null;
  isMenuOpen = false;
  avatarUrl: string | null = null;
  userInitial = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkAuthStatus();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (this.isMenuOpen) {
      this.isMenuOpen = false;
    }
  }

  checkAuthStatus(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
    if (this.isLoggedIn) {
      // Get user info from token (you may need to fetch from API)
      const userId = this.authService.getUserId();
      const roles = this.authService.getRoles();
      this.user = { 
        id: userId, 
        roles: roles,
        username: 'User', // This should be fetched from API
        firstName: 'User',
        lastName: ''
      };
      this.userInitial = this.user?.firstName?.charAt(0) || 'U';
    }
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  navigateToHome(): void {
    this.router.navigate(['/client']);
  }

  navigateToCategory(): void {
    this.router.navigate(['/client/category']);
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.user = null;
    this.isMenuOpen = false;
    this.router.navigate(['/client']);
  }

  viewProfile(): void {
    // TODO: Implement profile view
    this.isMenuOpen = false;
  }

  editProfile(): void {
    // TODO: Implement profile edit
    this.isMenuOpen = false;
  }

  changePassword(): void {
    // TODO: Implement change password
    this.isMenuOpen = false;
  }
}