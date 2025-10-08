import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/core/services/users/user.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  totalUsers = 0;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.countUsers();
  }

  countUsers() {
    this.userService.countUser().subscribe({
      next: (count) => this.totalUsers = count,
      error: (err) => console.error('Error counting users:', err)
    });
  }
}
