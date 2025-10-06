import { Component, OnInit } from '@angular/core';
import { PageResponse } from 'src/app/core/models/response/page-response';
import { UserResponse } from 'src/app/core/models/response/user-response';
import { UserService } from 'src/app/core/services/users/user.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  users: UserResponse[] = [];
  totalPages = 0;
  totalElements = 0;
  currentPage = 0; // backend pageNumber bắt đầu từ 0
  pageSize = 5;
  loading = false;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers(0);
  }

  loadUsers(page: number): void {
    this.loading = true;
    this.userService.getAllUsers(page, this.pageSize).subscribe({
      next: (res) => {
        if (res.success) {
          const data: PageResponse<UserResponse> = res.data;
          this.users = data.content;
          this.currentPage = data.pageNumber;
          this.totalPages = data.totalPages;
          this.totalElements = data.totalElements;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading users', err);
        this.loading = false;
      }
    });
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.loadUsers(this.currentPage + 1);
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.loadUsers(this.currentPage - 1);
    }
  }

  goToPage(page: number) {
    this.loadUsers(page);
  }

  viewUser(user: any) {
  console.log('Xem chi tiết:', user);
  // Có thể mở modal hoặc điều hướng sang trang chi tiết
}

editUser(user: any) {
  console.log('Cập nhật:', user);
  // Có thể mở form update hoặc điều hướng sang trang edit
}

deleteUser(user: any) {
  if (confirm(`Bạn có chắc muốn xóa người dùng "${user.username}" không?`)) {
    console.log('Đã xóa:', user);
    // Gọi API xóa tại đây
  }
}

}
