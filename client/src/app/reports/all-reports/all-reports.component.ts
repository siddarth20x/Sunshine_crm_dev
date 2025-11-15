import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-all-reports',
  templateUrl: './all-reports.component.html',
  styleUrls: ['./all-reports.component.css']
})
export class AllReportsComponent implements OnInit {
  userId: any;
  userRole: any;

  constructor() { }

  ngOnInit(): void {
    let userDetails: any = sessionStorage.getItem('userDetails');
    let parsedUsrDetails = JSON.parse(userDetails);
    this.userId = parsedUsrDetails.user_id;
    this.userRole = parsedUsrDetails.role_name;
  }

}
