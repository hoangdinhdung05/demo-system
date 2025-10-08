import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/core/services/users/user.service';
import { AdminCreateUserRequest } from 'src/app/core/models/request/Users/AdminCreateUserRequest';
import { ToastrService } from 'ngx-toastr';

declare var bootstrap: any;

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  @ViewChild('createUserModal') createUserModal!: ElementRef;

  users: any[] = [];
  filteredUsers: any[] = [];
  totalPages = 0;
  totalElements = 0;
  currentPage = 0;
  pageSize = 5;
  loading = false;

  createUserForm!: FormGroup;
  modalInstance: any;

  searchText = '';
  roleOptions: string[] = ['USER', 'ADMIN'];
  backendErrors: { [key: string]: string } = {};


  constructor(private userService: UserService, 
    private fb: FormBuilder, 
    private toastr: ToastrService) {}

  ngOnInit(): void {
    this.loadUsers(0);

    this.createUserForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)]],
      roles: [[]] // mảng chứa các role được chọn
    });
  }

  onRoleChange(event: any) {
    const roles: string[] = this.createUserForm.get('roles')?.value || [];
    if (event.target.checked) {
      roles.push(event.target.value);
    } else {
      const index = roles.indexOf(event.target.value);
      if (index >= 0) roles.splice(index, 1);
    }
    this.createUserForm.get('roles')?.setValue(roles);
  }

  // === API load users ===
  loadUsers(page: number) {
    this.loading = true;
    this.userService.getAllUsers(page, this.pageSize).subscribe({
      next: res => {
        if (res.success) {
          this.users = res.data.content;
          this.filteredUsers = [...this.users]; // filter search
          this.currentPage = res.data.pageNumber;
          this.totalPages = res.data.totalPages;
          this.totalElements = res.data.totalElements;
        }
        this.loading = false;
      },
      error: err => {
        console.error('Error loading users', err);
        this.loading = false;
      }
    });
  }

  nextPage() { if (this.currentPage < this.totalPages - 1) this.loadUsers(this.currentPage + 1); }
  previousPage() { if (this.currentPage > 0) this.loadUsers(this.currentPage - 1); }
  goToPage(page: number) { this.loadUsers(page); }

  // === Modal create user ===
  openCreateModal() {
    this.modalInstance = new bootstrap.Modal(this.createUserModal.nativeElement);
    this.createUserForm.reset({ roles: [] });
    this.modalInstance.show();
  }

  closeCreateModal() {
    if (this.modalInstance) this.modalInstance.hide();
  }

submitCreateUser() {
  if (this.createUserForm.invalid) return;

  const request: AdminCreateUserRequest = this.createUserForm.value;
  this.backendErrors = {}; // reset lỗi cũ

  this.userService.adminCreateUser(request).subscribe({
    next: res => {
      this.toastr.success('Tạo user thành công!', 'Thành công');
      this.loadUsers(this.currentPage); // reload bảng
      this.closeCreateModal();
    },
    error: err => {
      // Reset form validation
      Object.keys(this.createUserForm.controls).forEach(key => {
        this.createUserForm.get(key)?.markAsTouched();
      });

      if (err.error) {
        // 1. Nếu backend trả về errors object
        if (err.error.errors) {
          this.backendErrors = err.error.errors;

          // Hiển thị toast chi tiết từng field
          Object.entries(err.error.errors).forEach(([field, msg]: any) => {
            this.toastr.error(msg, `Lỗi ${field}`);
          });

        } 
        // 2. Nếu backend trả về message hoặc list
        else if (err.error.message) {
          this.toastr.error(err.error.message, 'Lỗi');
        } else if (err.error.details) {
          err.error.details.forEach((d: string) => this.toastr.error(d, 'Lỗi'));
        } else {
          this.toastr.error('Có lỗi xảy ra, vui lòng thử lại!', 'Lỗi');
        }
      } else {
        this.toastr.error('Có lỗi xảy ra, vui lòng thử lại!', 'Lỗi');
      }
    }
  });
}

  // === Search client-side ===
  filterUsers() {
    const text = this.searchText.toLowerCase();
    this.filteredUsers = this.users.filter(u =>
      u.username.toLowerCase().includes(text) ||
      (u.email?.toLowerCase().includes(text))
    );
  }

  // === Action buttons ===
  viewUser(user: any) { console.log('View', user); }
  editUser(user: any) { console.log('Edit', user); }
  deleteUser(user: any) {
    if (confirm(`Bạn có chắc muốn xóa người dùng "${user.username}" không?`)) {
      console.log('Delete', user);
    }
  }

  exportUserReport() {
    this.loading = true;
    this.userService.exportUserReport().subscribe({
      next: (blob) => {
        const file = new Blob([blob], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);

        // Tự động mở PDF trong tab mới
        window.open(fileURL, '_blank');

        // Nếu muốn download thẳng thay vì mở tab:
        // const link = document.createElement('a');
        // link.href = fileURL;
        // link.download = 'users_report.pdf';
        // link.click();
        // URL.revokeObjectURL(fileURL);

        this.toastr.success('Xuất báo cáo PDF thành công!', 'Thành công');
        this.loading = false;
      },
      error: (err) => {
        console.error('Export report error:', err);
        this.toastr.error('Không thể xuất báo cáo PDF!', 'Lỗi');
        this.loading = false;
      }
    });
  }
}
