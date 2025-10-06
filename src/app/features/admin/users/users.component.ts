import { Component, OnInit } from '@angular/core';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  joinDate: string;
}

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  paginatedUsers: User[] = [];
  searchTerm: string = '';

  // Pagination
  currentPage = 1;
  pageSize = 5;
  totalPages = 1;

  ngOnInit(): void {
    this.users = [
      { id: 1, name: 'Mark Otto', email: 'mark@demo.com', role: 'Admin', status: 'Active', joinDate: '2024-05-12' },
      { id: 2, name: 'Jacob Thornton', email: 'jacob@demo.com', role: 'User', status: 'Active', joinDate: '2024-07-01' },
      { id: 3, name: 'Larry Bird', email: 'larry@demo.com', role: 'User', status: 'Inactive', joinDate: '2024-09-15' },
      { id: 4, name: 'Anna Smith', email: 'anna@demo.com', role: 'User', status: 'Active', joinDate: '2024-10-01' },
      { id: 5, name: 'John Doe', email: 'john@demo.com', role: 'User', status: 'Active', joinDate: '2024-11-11' },
      { id: 6, name: 'Eva Green', email: 'eva@demo.com', role: 'Admin', status: 'Inactive', joinDate: '2024-11-15' },
    ];

    this.filteredUsers = [...this.users];
    this.updatePagination();
  }

  onSearch() {
    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(u =>
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term)
    );
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize);
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedUsers = this.filteredUsers.slice(start, end);
  }

  get totalPagesArray() {
    return Array(this.totalPages).fill(0).map((_, i) => i + 1);
  }

  get startItem() {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem() {
    return Math.min(this.currentPage * this.pageSize, this.filteredUsers.length);
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.updatePagination();
  }

  onCreateUser() {
    alert('Chức năng thêm người dùng sắp ra mắt 🚀');
  }
}
