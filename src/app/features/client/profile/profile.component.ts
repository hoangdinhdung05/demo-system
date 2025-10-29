import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../core/services/users/user.service';
import { AuthService } from '../../../core/auth.service';
import { UserDetailsResponse } from '../../../core/models/response/User/UserDetailsRespomse';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: UserDetailsResponse | null = null;
  isLoading = false;
  avatarUrl: string | null = null;

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.userService.getCurrentUser().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.user = response.data;
          this.avatarUrl = this.getAvatarUrl(this.user.avatarUrl);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        this.isLoading = false;
      }
    });
  }

  getAvatarUrl(avatarUrl?: string): string | null {
    if (!avatarUrl) {
      return null;
    }
    return `${environment.assetBase}${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'status-active';
      case 'inactive':
        return 'status-inactive';
      case 'blocked':
        return 'status-blocked';
      default:
        return 'status-pending';
    }
  }

  getStatusText(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'Đang hoạt động';
      case 'inactive':
        return 'Không hoạt động';
      case 'blocked':
        return 'Bị khóa';
      default:
        return 'Chờ xác thực';
    }
  }
}