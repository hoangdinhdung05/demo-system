import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth.service';
import { UserService } from '../../../../core/services/users/user.service';
import { CategoryService } from '../../../../core/services/categories/category.service';
import { UserDetailsResponse } from '../../../../core/models/response/User/UserDetailsRespomse';
import { CategoryResponse } from '../../../../core/models/response/Category/CategoryResponse';
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
  
  // Categories dropdown
  categories: CategoryResponse[] = [];
  isCategoriesOpen = false;
  isLoadingCategories = false;
  
  // Search functionality
  searchSuggestions: string[] = [];

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkAuthStatus();
    this.loadCategories();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    
    // Check if click is outside user menu
    if (this.isMenuOpen && !target.closest('.user-menu')) {
      this.isMenuOpen = false;
    }
    
    // Check if click is outside categories menu
    if (this.isCategoriesOpen && !target.closest('.categories-menu')) {
      this.isCategoriesOpen = false;
    }
  }

  checkAuthStatus(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
    if (this.isLoggedIn) {
      this.loadCurrentUser();
    }
  }

  loadCategories(): void {
    this.isLoadingCategories = true;
    this.categoryService.getAllCategories(0, 20).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.categories = response.data.content;
        }
        this.isLoadingCategories = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.isLoadingCategories = false;
      }
    });
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

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  navigateToCategory(): void {
    this.router.navigate(['/category']);
  }

  navigateToCategoryById(categoryId: number): void {
    this.router.navigate(['/category', categoryId]);
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.user = null;
    this.isMenuOpen = false;
    this.router.navigate(['/']);
  }

  viewProfile(): void {
    this.router.navigate(['/profile']);
    this.isMenuOpen = false;
  }

  editProfile(): void {
    this.router.navigate(['/edit-profile']);
    this.isMenuOpen = false;
  }

  changePassword(): void {
    this.router.navigate(['/change-password']);
    this.isMenuOpen = false;
  }

  viewOrders(): void {
    this.router.navigate(['/orders']);
    this.isMenuOpen = false;
  }

  viewWishlist(): void {
    // TODO: Navigate to wishlist page
    this.isMenuOpen = false;
    console.log('Navigate to wishlist');
  }

  viewAddresses(): void {
    // TODO: Navigate to addresses page
    this.isMenuOpen = false;
    console.log('Navigate to addresses');
  }

  viewPaymentMethods(): void {
    // TODO: Navigate to payment methods page
    this.isMenuOpen = false;
    console.log('Navigate to payment methods');
  }

  viewNotifications(): void {
    // TODO: Navigate to notifications page
    this.isMenuOpen = false;
    console.log('Navigate to notifications');
  }

  viewSettings(): void {
    this.router.navigate(['/settings']);
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

  // Categories dropdown methods
  toggleCategoriesMenu(): void {
    this.isCategoriesOpen = !this.isCategoriesOpen;
  }

  onCategoriesMouseEnter(): void {
    this.isCategoriesOpen = true;
  }

  onCategoriesMouseLeave(): void {
    // Small delay to allow moving to dropdown
    setTimeout(() => {
      this.isCategoriesOpen = false;
    }, 200);
  }

  // === mở/đóng theo hover + click ===
  openUserMenu(): void {
    this.isMenuOpen = true;
  }
  closeUserMenu(): void {
    this.isMenuOpen = false;
  }
  toggleUserMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isMenuOpen = !this.isMenuOpen;
  }

  // Đóng khi click ngoài: bạn đã có HostListener document:click – ok

  // === gom action về 1 chỗ, tự đóng menu sau khi xử lý ===
  onAction(action: string): void {
    switch (action) {
      case 'profile':        this.viewProfile(); break;
      case 'orders':         this.viewOrders(); break;
      case 'wishlist':       this.viewWishlist(); break;
      case 'addresses':      this.viewAddresses(); break;
      case 'payments':       this.viewPaymentMethods(); break;
      case 'notifications':  this.viewNotifications(); break;
      case 'editProfile':    this.editProfile(); break;
      case 'changePassword': this.changePassword(); break;
      case 'settings':       this.viewSettings(); break;
      case 'logout':         this.logout(); break;
    }
    this.isMenuOpen = false;
  }
}