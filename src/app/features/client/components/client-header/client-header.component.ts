import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth.service';
import { UserService } from '../../../../core/services/users/user.service';
import { UserDetailsResponse } from '../../../../core/models/response/User/UserDetailsRespomse';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-client-header',
  templateUrl: './client-header.component.html',
  styleUrls: ['./client-header.component.css']
})
export class ClientHeaderComponent implements OnInit {
  isLoggedIn = false;
  user: UserDetailsResponse | null = null;
  isMenuOpen = false;
  avatarUrl: string | null = null;
  userInitial = '';
  isLoadingUser = false;
  
  // Search functionality
  searchSuggestions: string[] = [];

  constructor(
    private authService: AuthService,
    private userService: UserService,
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
      this.loadCurrentUser();
    }
  }

  loadCurrentUser(): void {
    this.isLoadingUser = true;
    this.userService.getCurrentUser().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.user = response.data;
          this.avatarUrl = this.getAvatarUrl(this.user.avatarUrl);
          this.userInitial = this.user.firstName?.charAt(0) || this.user.username?.charAt(0) || 'U';
        }
        this.isLoadingUser = false;
      },
      error: (error) => {
        console.error('Error loading current user:', error);
        // Fallback to basic user info from token
        const userId = this.authService.getUserId();
        const roles = this.authService.getRoles();
        if (userId) {
          this.user = { 
            id: userId, 
            username: 'User',
            firstName: 'User',
            lastName: '',
            email: '',
            status: '',
            verifyEmail: false,
            avatarUrl: ''
          };
          this.userInitial = 'U';
        }
        this.isLoadingUser = false;
      }
    });
  }

  getAvatarUrl(avatarUrl?: string): string | null {
    if (!avatarUrl) {
      return null;
    }
    
    // Use the same approach as admin page
    return `${environment.assetBase}${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
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

  navigateToCategoryById(categoryId: number): void {
    this.router.navigate(['/client/category', categoryId]);
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

  // Search functionality
  performSearch(query: string): void {
    if (query.trim()) {
      console.log('Searching for:', query);
      // TODO: Implement search functionality
      // this.router.navigate(['/client/search'], { queryParams: { q: query } });
    }
  }

  selectSuggestion(suggestion: string): void {
    this.performSearch(suggestion);
    this.searchSuggestions = [];
  }
}