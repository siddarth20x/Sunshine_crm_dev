import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SunshineInternalService } from '../sunshine-services/sunshine-internal.service';
import { MatTableDataSource } from '@angular/material/table';
import { CustomFunctionsService } from '../sunshine-services/custom-functions.service';

@Component({
  selector: 'app-disposition-code',
  templateUrl: './disposition-code.component.html',
  styleUrls: ['./disposition-code.component.css'],
})
export class DispositionCodeComponent implements OnInit {
  createBtnPrivilegeName: string = 'CREATE';
  createBtnModName: string = 'DISPOSITION_CODE';
  isCreatePrivilegedModule: any;
  loggedInUserRole: string = '';

  showProgressBar: boolean = false;
  displayedClientHoldersColumns: string[] = [];
  dataSource: any;
  myDataArray: any[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  resultsLength: number = 0;
  tableTxt: string = '';
  allDispositionType: any = [];

  displayedDispositionHoldersColumns: any = [
    'disposition_code_id',
    'stage',
    'stage_status',
    'stage_status_name',
    'more',
  ];

  constructor(
    private _sunshineIntService: SunshineInternalService,
    private _customFn: CustomFunctionsService
  ) {}

  ngOnInit(): void {
    let userDetails: any = sessionStorage.getItem('userDetails');
    let parsedUsrDetails = JSON.parse(userDetails);
    this.loggedInUserRole = parsedUsrDetails.role_name;

    this.isCreatePrivilegedModule =
      this._customFn.checkForAllowedModuleAndPrivilegesForCreate(
        this.createBtnPrivilegeName,
        this.createBtnModName
      );
    console.log(this.isCreatePrivilegedModule);
    this.getAllDispositions();
  }

  getAllDispositions() {
    let params = {};
    this.showProgressBar = true;
    this._sunshineIntService
      .fetchAllDispositionCode(params)
      .then((res: any) => {
        if (res.errorCode == 0) {
          console.log('getAllDispositions-->', res);
          this.allDispositionType = res.data[0].reverse();

          this.dataSource = new MatTableDataSource(this.allDispositionType);
          // console.log(this.dataSource)
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
          this.resultsLength = this.allDispositionType.length;
          this.showProgressBar = false;
        } else {
          this.showProgressBar = false;
        }
      })
      .catch((err) => {
        console.log(err);
        this.showProgressBar = false;
      });
  }

  applyFilter(event: any) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
