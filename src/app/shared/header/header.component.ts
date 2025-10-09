import { Component, OnInit } from '@angular/core';
import { UserDetailsResponse } from 'src/app/core/models/response/User/UserDetailsRespomse';
import { UserService } from 'src/app/core/services/users/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  user?: UserDetailsResponse;
  userInitial: string = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    const userId = 1; // hoặc lấy từ token/localStorage
    this.userService.getUserDetails(userId).subscribe({
      next: (res) => {
        this.user = res.data;
        this.userInitial = this.getUserInitial(this.user.username);
      },
      error: (err) => {
        console.error('Lỗi khi lấy thông tin user', err);
      }
    });
  }

  private getUserInitial(username: string): string {
    return username ? username.charAt(0).toUpperCase() : '?';
  }
}
