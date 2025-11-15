import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SunshineInternalService } from '../../sunshine-services/sunshine-internal.service';
import { SessionService } from '../../sunshine-services/session.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl } from '@angular/forms';
import { Observable, of, startWith, map } from 'rxjs';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { FilePreviewDialogComponent } from './file-preview-dialog/file-preview-dialog.component';

interface UploadedFile {
  file_upload_id: number;
  file_name: string;
  file_url: string;
  file_type: string;
  company_id: number;
  bank_name: string;
  user_name: string;
  email_address: string;
  upload_date: string;
}

interface User {
  user_id: number;
  full_name: string;
  email_address: string;
  role_name: string;
}

interface Company {
  company_id: number;
  company_name: string;
}

@Component({
  selector: 'app-uploaded-files',
  templateUrl: './uploaded-files.component.html',
  styleUrls: ['./uploaded-files.component.css'],
  providers: [SessionService]
})
export class UploadedFilesComponent implements OnInit {
  displayedColumns: string[] = [
    'bank_name', 'user_name', 'email_address', 'file_name', 'upload_date', 'actions'
  ];
  dataSource: MatTableDataSource<UploadedFile>;
  allFiles: UploadedFile[] = [];
  isLoading = false;
  error: string | null = null;
  showTable = false;

  // Filter fields
  allUsersArr: User[] = [];
  userFilteredOptions!: Observable<User[]>;
  bankArr: Company[] = [];
  bankFilteredOptions!: Observable<Company[]>;
  userControl = new FormControl();
  bankControl = new FormControl();
  searchText = '';
  startDate: Date;
  endDate: Date;
  loggedInUserId: any;
  loggedInUserRoleName: any = '';
  showUserFilter: boolean = true;
  associatedUsers: User[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private sunshineService: SunshineInternalService,
    private sessionService: SessionService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.dataSource = new MatTableDataSource<UploadedFile>([]);
    const today = new Date();
    this.startDate = today;
    this.endDate = today;
  }

  ngOnInit() {
    let usrDetails: any = sessionStorage.getItem('userDetails');
    let parsedUsrDetails = JSON.parse(usrDetails);
    this.loggedInUserId = parsedUsrDetails.user_id;
    this.loggedInUserRoleName = parsedUsrDetails.role_name;

    if (this.loggedInUserRoleName === 'AGENT') {
      this.showUserFilter = false;
    }

    // Initialize filters first
    this.initializeUserFilter();
    this.initializeBankFilter();
    
    // Then load users
    this.getAllUsers();

    // Keep results area hidden until the user intentionally generates a search
    this.showTable = false;
  }

  private initializeUserFilter() {
    console.log('Initializing user filter');
    this.userFilteredOptions = this.userControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        console.log('User filter value changed:', value);
        const stringValue = typeof value === 'string' ? value : value?.full_name || '';
        return stringValue;
      }),
      map(fullName => {
        console.log('Filtering users with:', fullName);
        const filteredResults = fullName ? this._filterUsers(fullName) : this.associatedUsers.slice();
        console.log('Filtered results:', filteredResults);
        return filteredResults;
      })
    );
  }

  private initializeBankFilter() {
    this.bankFilteredOptions = this.bankControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const stringValue = typeof value === 'string' ? value : value?.company_name || '';
        return stringValue;
      }),
      map(companyName => {
        const filteredResults = companyName ? this._filterBanks(companyName) : this.bankArr.slice();
        return filteredResults;
      })
    );
  }

  getAllUsers() {
    console.log('Fetching all users...');
    this.isLoading = true;
    this.sunshineService.fetchAllUsers().then((res: any) => {
      console.log('Users API response:', res);
      if (res && res.data && res.data[0]) {
        this.allUsersArr = res.data[0];
        
        if (this.loggedInUserRoleName === 'ADMIN') {
          this.associatedUsers = this.allUsersArr;
        } else {
          this.getAssociatedUsers();
          // Add logged-in user to the list if not already present
          const loggedInUser = this.allUsersArr.find(user => user.user_id === this.loggedInUserId);
          if (loggedInUser && !this.associatedUsers.some(user => user.user_id === this.loggedInUserId)) {
            this.associatedUsers.push(loggedInUser);
          }
        }
        
        // Re-initialize user filter after getting users
        this.initializeUserFilter();
      } else {
        console.error('Invalid response format:', res);
        this.error = 'Invalid response format from server';
      }
      this.isLoading = false;
    }).catch(error => {
      console.error('Error fetching users:', error);
      this.isLoading = false;
      this.error = 'Failed to load users';
    });
  }

  getAssociatedUsers() {
    console.log('Fetching associated users for:', this.loggedInUserId);
    let params = { reporting_to_id: this.loggedInUserId };
    this.sunshineService.fetchAllAssociatedAgents(params).then((res: any) => {
      console.log('Associated users response:', res);
      if (res && res.data && res.data[0]) {
        this.associatedUsers = res.data[0];
        // Add logged-in user to the list if not already present
        const loggedInUser = this.allUsersArr.find(user => user.user_id === this.loggedInUserId);
        if (loggedInUser && !this.associatedUsers.some(user => user.user_id === this.loggedInUserId)) {
          this.associatedUsers.push(loggedInUser);
        }
        // Re-initialize user filter after getting associated users
        this.initializeUserFilter();
      } else {
        console.error('Invalid associated users response:', res);
        this.associatedUsers = [];
        // Even if no associated users, add logged-in user
        const loggedInUser = this.allUsersArr.find(user => user.user_id === this.loggedInUserId);
        if (loggedInUser) {
          this.associatedUsers.push(loggedInUser);
          this.initializeUserFilter();
        }
      }
    }).catch(error => {
      console.error('Error fetching associated users:', error);
      this.associatedUsers = [];
      // Add logged-in user even if there's an error
      const loggedInUser = this.allUsersArr.find(user => user.user_id === this.loggedInUserId);
      if (loggedInUser) {
        this.associatedUsers.push(loggedInUser);
        this.initializeUserFilter();
      }
    });
  }

  onUserSelected(event: MatAutocompleteSelectedEvent) {
    const user = event.option.value as User;
    if (user && user.user_id) {
      this.getUserBanks(user.user_id);
      this.userControl.setValue(user);
      this.bankControl.setValue('');
     
    }
  }

  getUserBanks(user_id: number) {
    this.isLoading = true;
    this.sunshineService.fectchUserCompany({ user_id }).then((res: any) => {
      this.bankArr = res.data[0] || [];
      this.initializeBankFilter();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.error = 'Failed to load banks';
      console.error(error);
    });
  }

  private _filterUsers(fullName: string): User[] {
    console.log('Filtering users with name:', fullName);
    console.log('Available users:', this.associatedUsers);
    const filterValue = fullName.toLowerCase();
    const filtered = this.associatedUsers.filter((option: User) =>
      option.full_name.toLowerCase().includes(filterValue)
    );
    console.log('Filtered results:', filtered);
    return filtered;
  }

  private _filterBanks(companyName: string): Company[] {
    const filterValue = companyName.toLowerCase();
    return this.bankArr.filter((option: Company) =>
      option.company_name.toLowerCase().includes(filterValue)
    );
  }

  displayUserFn(user: User): string {
    return user && user.full_name ? user.full_name : '';
  }

  displayBankFn(bank: Company): string {
    return bank && bank.company_name ? bank.company_name : '';
  }

  clearUserSelection() {
    this.userControl.setValue('');
    this.bankControl.setValue('');
    this.bankArr = [];
    if (this.loggedInUserRoleName !== 'ADMIN') {
      this.getAssociatedUsers();
    } else {
      this.getAllUsers();
    }
  }

  clearBankSelection() {
    this.bankControl.setValue('');
    if (this.userControl.value) {
      this.getUserBanks(this.userControl.value.user_id);
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    // Only filter by the four specified columns
    this.dataSource.filterPredicate = (data: UploadedFile, filter: string) => {
      const dataStr = [
        data.bank_name,
        data.user_name,
        data.email_address,
        data.file_name
      ].join(' ').toLowerCase();
      return dataStr.includes(filter);
    };
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  loadFiles() {
    this.isLoading = true;
    this.error = null;
    this.showTable = true;

    // Prepare filter parameters
    const params: any = {
      start_date: this.startDate ? this.formatDateForAPI(this.startDate) : null,
      end_date: this.endDate ? this.formatDateForAPI(this.endDate) : null
    };

    // Add user filter if selected
    if (this.userControl.value) {
      params.user_id = this.userControl.value.user_id;
      params.user_name = this.userControl.value.full_name;
    }

    // Add company/bank filter if selected
    if (this.bankControl.value) {
      params.company_id = this.bankControl.value.company_id;
      params.bank_name = this.bankControl.value.company_name;
    }

    console.log('Fetching files with params:', params);

    this.sunshineService.getAccountFiles(params).subscribe({
      next: (response) => {
        console.log('Files API response:', response);
        
        if (response && response.data) {
          // Map the response data to match our table structure
          let files = response.data.map((file: any) => ({
            file_upload_id: file.file_upload_id,
            file_name: file.file_name,
            file_url: file.file_url,
            file_type: file.file_type,
            company_id: file.company_id,
            bank_name: file.bank_name,
            user_name: file.user_name,
            email_address: file.email_address,
            upload_date: file.created_dtm || file.upload_date
          }));

          // Apply AND-based filtering on the frontend
          function toYMD(date: Date | string): string {
            const d = new Date(date);
            return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
          }

          files = files.filter((file: UploadedFile) => {
            const userMatch = !this.userControl.value || file.user_name === this.userControl.value.full_name;
            const bankMatch = !this.bankControl.value || file.bank_name === this.bankControl.value.company_name;
            const fileDate = toYMD(file.upload_date);
            const startDate = this.startDate ? toYMD(this.startDate) : null;
            const endDate = this.endDate ? toYMD(this.endDate) : null;
            const startDateMatch = !startDate || fileDate >= startDate;
            const endDateMatch = !endDate || fileDate <= endDate;
            return userMatch && bankMatch && startDateMatch && endDateMatch;
          });

          this.allFiles = files;
          this.dataSource = new MatTableDataSource<UploadedFile>(this.allFiles);
          
          // Set up sorting and pagination
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
          
          // Set up custom sorting for date column
          this.dataSource.sortingDataAccessor = (item: UploadedFile, property: string) => {
            switch(property) {
              case 'upload_date': return new Date(item.upload_date).getTime();
              default: return item[property as keyof UploadedFile] || '';
            }
          };

          // Reset paginator to first page after fetching new data
          if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
          }
        } else {
          // Initialize empty data source without error message
          this.dataSource = new MatTableDataSource<UploadedFile>([]);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching files:', err);
        this.dataSource = new MatTableDataSource<UploadedFile>([]);
        this.isLoading = false;
      }
    });
  }

  private formatDateForAPI(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  clearFilters() {
    this.userControl.setValue('');
    this.bankControl.setValue('');
    this.searchText = '';
    const today = new Date();
    this.startDate = today;
    this.endDate = today;
    this.dataSource = new MatTableDataSource<UploadedFile>([]);
    this.allFiles = [];
    this.error = null;
    this.showTable = false;
  }

  // Update the date handlers to properly set the dates
  fromDateHandler(event: any) {
    if (event.value) {
      this.startDate = event.value;
    }
  }

  toDateHandler(event: any) {
    if (event.value) {
      this.endDate = event.value;
    }
  }

  // Add a method to validate dates
  validateDates(): boolean {
    if (this.startDate && this.endDate) {
      return this.startDate <= this.endDate;
    }
    return true;
  }

  // Update the generate button click handler
  onGenerateClick() {
    // Require at least one filter (date, user, or bank)
    const validStart = this.startDate instanceof Date && !isNaN(this.startDate as any);
    const validEnd = this.endDate instanceof Date && !isNaN(this.endDate as any);

    const noFilters =
      (!validStart || !validEnd || (this.startDate!.toDateString() === this.endDate!.toDateString())) &&
      (!this.userControl.value || this.userControl.value === '') &&
      (!this.bankControl.value || this.bankControl.value === '');

    if (noFilters) {
      this.snackBar.open('Please select at least one filter before generating results.', 'Close', {
        duration: 3000
      });
      this.dataSource = new MatTableDataSource<UploadedFile>([]);
      this.showTable = false;
      return;
    }
    if (!this.validateDates()) {
      this.snackBar.open('End date must be greater than or equal to start date', 'Close', {
        duration: 3000
      });
      return;
    }
    this.loadFiles();
  }

  // Add a method to check if any filter is set (for button disable)
  isAnyFilterSet(): boolean {
    const validStart = this.startDate instanceof Date && !isNaN(this.startDate as any);
    const validEnd = this.endDate instanceof Date && !isNaN(this.endDate as any);

    // Check if dates are different (indicating a date range filter is applied)
    const dateFilterApplied = validStart && validEnd && this.startDate!.toDateString() !== this.endDate!.toDateString();
    
    // Check if user filter is applied
    const userFilterApplied = this.userControl.value && this.userControl.value !== '';
    
    // Check if bank filter is applied
    const bankFilterApplied = this.bankControl.value && this.bankControl.value !== '';

    return dateFilterApplied || userFilterApplied || bankFilterApplied;
  }

  previewFile(file: UploadedFile) {
    if (file.file_url) {
      this.dialog.open(FilePreviewDialogComponent, {
        width: '900px',
        data: { fileUrl: file.file_url, fileName: file.file_name }
      });
    } else {
      this.snackBar.open('Preview not available for this file', 'Close', {
        duration: 3000
      });
    }
  }

  downloadFile(file: UploadedFile) {
    this.isLoading = true;
    this.error = null;

    this.sunshineService.downloadAccountFile(file.file_name).subscribe({
      next: (response) => {
        if (response && response.downloadUrl) {
          // Fetch the file as a blob and trigger download
          fetch(response.downloadUrl)
            .then(res => res.blob())
            .then(blob => {
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = file.file_name;
              document.body.appendChild(a);
              a.click();
              a.remove();
              window.URL.revokeObjectURL(url);
              this.isLoading = false;
            })
            .catch(() => {
              this.snackBar.open('Failed to download file.', 'Close', { duration: 3000 });
              this.isLoading = false;
            });
        } else {
          this.snackBar.open('Download URL not available', 'Close', {
            duration: 3000
          });
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Error downloading file:', err);
        this.snackBar.open('Failed to download file. Please try again.', 'Close', {
          duration: 3000
        });
        this.isLoading = false;
      }
    });
  }
} 