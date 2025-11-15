import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import {
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
  MatSnackBar,
} from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { CustomFunctionsService } from 'src/app/sunshine-services/custom-functions.service';
import { SunshineInternalService } from 'src/app/sunshine-services/sunshine-internal.service';

@Component({
  selector: 'app-address-tab',
  templateUrl: './address-tab.component.html',
  styleUrls: ['./address-tab.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed, void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class AddressTabComponent implements OnInit {
  columnsToDisplayWithExpand: string[] = [
    'contact_mode_list',
    'current_location',
    'address_name',
    'city',
    'state',
    'country',
    'zipcode',
    'office_address',
    'is_primary',
    'expand',
  ];
  dataSource: any;
  expandedElement: any | null = null;
  myDataArray: any[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  resultsLength: number = 0;
  showProgressBar: boolean = false;

  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  durationInSeconds = 5;
  leadId: number = 0;
  paginatedData: any[] = [];
  pageSize = 5;

  createPrivilegeName: string = 'CREATE';
  uploadPrivilegeName: string = 'UPLOAD';
  readPrivilegeName: string = 'READ';
  editPrivilegeName: string = 'EDIT';
  moduleName: string = 'ADDRESS';
  isCreatePrivilegedModule: any;
  isUploadPrivilegedModule: any;
  isReadPrivilegedModule: any;
  isEditPrivilegedModule: any;

  constructor(
    private _sunshineAPI: SunshineInternalService,
    private _snackBar: MatSnackBar,
    private _aR: ActivatedRoute,
    private customFn: CustomFunctionsService,
    private _datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.isCreatePrivilegedModule =
      this.customFn.checkForAllowedModuleAndPrivilegesForCreate(
        this.createPrivilegeName,
        this.moduleName
      );
    this.isUploadPrivilegedModule =
      this.customFn.checkForAllowedModuleAndPrivilegesForUpload(
        this.uploadPrivilegeName,
        this.moduleName
      );
    this.isReadPrivilegedModule =
      this.customFn.checkForAllowedModuleAndPrivilegesForRead(
        this.readPrivilegeName,
        this.moduleName
      );
    this.isEditPrivilegedModule =
      this.customFn.checkForAllowedModuleAndPrivilegesForEdit(
        this.editPrivilegeName,
        this.moduleName
      );

    this.captureRouteParams();
  }

  captureRouteParams() {
    const usrParams = this._aR.snapshot.params;
    //console.log(usrParams);
    const lead_id = parseInt(usrParams['leadId']);
    this.leadId = lead_id;
    this.getAllAddress(lead_id);
  }

  getAllAddress(leadId: number) {
    this.showProgressBar = true;

    const leadParams = {
      lead_id: leadId,
    };

    this._sunshineAPI
      .fetchLeadAddress(leadParams)
      .then((res: any) => {
        const resData = res.data[0];
        this.myDataArray = resData.reverse();
        this.dataSource = new MatTableDataSource(this.myDataArray);
        console.log('fetchLeadAddress-->', this.myDataArray);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.resultsLength = resData.length;
        // this.paginateData();
        this.showProgressBar = false;
      })
      .catch((error) => {
        this.showProgressBar = false;
        console.error(error);
      });
  }

  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.paginator.pageIndex = event.pageIndex;
    this.paginateData();
  }

  paginateData() {
    const startIndex = this.paginator.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedData = this.myDataArray.slice(startIndex, endIndex);
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, 'Okay', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds * 1000,
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
