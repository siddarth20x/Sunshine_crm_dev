import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SunshineInternalService } from 'src/app/sunshine-services/sunshine-internal.service';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { FormControl } from '@angular/forms';
import { Observable, startWith, map, of } from 'rxjs';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

@Component({
  selector: 'app-contactable-non-contactable-reports',
  templateUrl: './contactable-non-contactable-reports.component.html',
  styleUrls: ['./contactable-non-contactable-reports.component.css'],
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
export class ContactableNonContactableReportsComponent implements OnInit {
  loggedInUserId: any;
  fromDate: string = '';
  toDate: string = '';
  disableGenerateBtn: boolean = true;

  dataSource: any;
  expandedElement: any | null = null;
  myDataArray: any[] = [];
  myDataArrayCopy: any[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  resultsLength: number = 0;
  tableTxt: string = '';
  showProgressBar: boolean = false;
  columnsToDisplayWithExpand: string[] = [
    'lead_id',
    'company_name',
    'product_type',
    'customer_id',
    'account_number',
    'contacble_non_contactable',
    'agreement_id',
    'customer_name',
    'total_outstanding_amount',
    'tracing_source_type_name',
    'visa_status',
    'mol_status',
    'note',
    'stage_status_code',
    'assigned_to_full_name',
    'assigned_by_full_name',
    'team_manager_full_name',
    'senior_manager_full_name',
    // 'date',
  ];

  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  durationInSeconds = 5;
  paginatedData: any[] = [];
  pageSize = 5;

  stageArr: Array<string> = ['CONTACTED', 'NON CONTACTED', 'ALL'];
  dailyRepParams: any = {
    app_user_id: null,
    lead_id: null,
    agent_id: null,
    company_id: null,
    start_dtm: null,
    end_dtm: null,
    stage: null,
    stage_status_code: null,
    contact_mode_list: null,
    report_name: 'contactable-non-contactable-report',
  };

  disableExportBtn: boolean = true;
  showCNCTBLBtn: boolean = false;

  allUsersArr: any[] = [];
  agentFullName = new FormControl();
  agentFilteredOptions!: Observable<any[]>;

  companyName = new FormControl();
  companyNameFilteredOptions!: Observable<any[]>;
  companyArr: any[] = [];
  associatedUsers: any = [];
  assignedCompanies: any = [];
  selectedStage: string = '';
  loggedInUserRoleName: any = '';
  showUserFilter: boolean = true;
  constructor(
    private _sunshineAPI: SunshineInternalService,
    private _datePipe: DatePipe,
    private _snackBar: MatSnackBar
  ) {}

  // Function to format contact info for display
  formatContactInfo(contactInfo: string): string {
    if (!contactInfo || contactInfo.trim() === '') {
      return 'No contact information available';
    }

    // Split by semicolon to handle multiple contact entries
    const contactEntries = contactInfo.split(';').filter(entry => entry.trim() !== '');
    const formattedEntries: string[] = [];

    contactEntries.forEach(entry => {
      const trimmedEntry = entry.trim();
      if (!trimmedEntry) return;

      // Extract date/time from the beginning
      const dateMatch = trimmedEntry.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/);
      let dateStr = '';
      let contactData = trimmedEntry;

      if (dateMatch) {
        dateStr = dateMatch[1];
        contactData = trimmedEntry.substring(dateMatch[0].length).trim();
      }

      // Parse the key-value pairs
      const details: string[] = [];
      
      // Extract email
      const emailMatch = contactData.match(/email-([^\s]+)/);
      if (emailMatch && emailMatch[1].trim() && emailMatch[1] !== '') {
        details.push(`📧 ${emailMatch[1]}`);
      }

      // Extract phone
      const phoneMatch = contactData.match(/phone-([^\s]+)/);
      if (phoneMatch && phoneMatch[1].trim() && phoneMatch[1] !== '') {
        details.push(`📞 ${phoneMatch[1]}`);
      }

      // Extract phone extension
      const phoneExtMatch = contactData.match(/phone_ext-([^\s]+)/);
      if (phoneExtMatch && phoneExtMatch[1].trim() && phoneExtMatch[1] !== '') {
        details.push(`📞 Ext: ${phoneExtMatch[1]}`);
      }

      // Extract alternate phone
      const altPhoneMatch = contactData.match(/alternate_phone-([^\s]+)/);
      if (altPhoneMatch && altPhoneMatch[1].trim() && altPhoneMatch[1] !== '') {
        details.push(`📱 ${altPhoneMatch[1]}`);
      }

      // Extract contact name
      const contactNameMatch = contactData.match(/contact_name-([^\s]+)/);
      if (contactNameMatch && contactNameMatch[1].trim() && contactNameMatch[1] !== '') {
        details.push(`👤 ${contactNameMatch[1]}`);
      }

      // Extract relationship
      const relationshipMatch = contactData.match(/relationship-([^\s]+)/);
      if (relationshipMatch && relationshipMatch[1].trim() && relationshipMatch[1] !== '') {
        details.push(`🔗 ${relationshipMatch[1]}`);
      }

      // Extract employment status
      const empStatusMatch = contactData.match(/employment_status-([^\s]+)/);
      if (empStatusMatch && empStatusMatch[1].trim() && empStatusMatch[1] !== '') {
        details.push(`💼 ${empStatusMatch[1]}`);
      }

      // Extract employment type
      const empTypeMatch = contactData.match(/employment_type-([^\s]+)/);
      if (empTypeMatch && empTypeMatch[1].trim() && empTypeMatch[1] !== '') {
        details.push(`🏢 ${empTypeMatch[1]}`);
      }

      if (details.length > 0) {
        let formattedEntry = details.join(' | ');
        if (dateStr) {
          formattedEntry = `[${dateStr}] ${formattedEntry}`;
        }
        formattedEntries.push(formattedEntry);
      }
    });

    return formattedEntries.length > 0 ? formattedEntries.join('\n') : 'No valid contact information';
  }

  ngOnInit(): void {
    let usrDetails: any = sessionStorage.getItem('userDetails');
    let parsedUsrDetails = JSON.parse(usrDetails);
    this.loggedInUserId = parsedUsrDetails.user_id;
    this.loggedInUserRoleName = parsedUsrDetails.role_name;
    // this.generateCNCReport(this.loggedInUserId);
    this.getAllUsers();
    this.getAllClients();
    this.getAssociatedUsers();
    this.fromDate = this.calculateCurrentDate();
    console.log(this.fromDate);

    this.dailyRepParams.start_dtm = this.fromDate;
    this.toDate = this.calculateCurrentDate();
    this.dailyRepParams.end_dtm = this.toDate;
    this.dailyRepParams.to_dtm = this.toDate;
    console.log(this.dailyRepParams);

    if (this.loggedInUserRoleName == 'AGENT') {
      this.dailyRepParams.agent_id = this.loggedInUserId;
      this.getUserCompany(this.loggedInUserId);
      this.showUserFilter = false;
    }
    
    // Check initial state of generate button
    this.checkGenerateButtonState();
  }

  private calculateCurrentDate(): string {
    let now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const day = String(now.getDate()).padStart(2, '0');
    const adjustedDate = `${year}-${month}-${day}`;
    return adjustedDate;
  }

  getAssociatedUsers() {
    let params = { reporting_to_id: this.loggedInUserId };
    this._sunshineAPI
      .fetchAllAssociatedAgents(params)
      .then((res: any) => {
        let response = res.data[0];
        this.associatedUsers = response;
        console.log(response);
        this.agentFilteredOptions = this.agentFullName.valueChanges.pipe(
          startWith(''),
          //   tap((value) =>
          //     console.log('Initial value:', value)
          // ),
          map((value) => {
            const stringValue =
              typeof value === 'string' ? value : value.full_name;
            // console.log('Mapped value:', stringValue);
            return stringValue;
          }),
          map((fullName) => {
            const filteredResults = fullName
              ? this._filterAssignedBy(fullName)
              : response.slice();
            // console.log('Filtered results:', filteredResults);
            return filteredResults;
          })
        );
      })
      .catch((error) => {
        this.showProgressBar = false;
        console.error(error);
      });
  }
  getAllUsers() {
    this.showProgressBar = true;
    this._sunshineAPI
      .fetchAllUsers()
      .then((res: any) => {
        let resData = res.data[0];
        this.allUsersArr = resData;
        // this.allUsersArr = resData.filter((role: any) => {
        //   return role.role_name == 'AGENT';
        // });
        console.log(this.allUsersArr);
        this.showProgressBar = false;
        if (this.loggedInUserRoleName == 'ADMIN') {
          console.log('all users');
          this.associatedUsers = this.allUsersArr;
          this.agentFilteredOptions = this.agentFullName.valueChanges.pipe(
            startWith(''),
            //   tap((value) =>
            //     console.log('Initial value:', value)
            // ),
            map((value) => {
              const stringValue =
                typeof value === 'string' ? value : value.full_name;
              // console.log('Mapped value:', stringValue);
              return stringValue;
            }),
            map((fullName) => {
              const filteredResults = fullName
                ? this._filterAssignedBy(fullName)
                : this.allUsersArr.slice();
              // console.log('Filtered results:', filteredResults);
              return filteredResults;
            })
          );
        } else {
          console.log('associated users');
          this.getAssociatedUsers();
        }
        // this.receiveInjectedData();
      })
      .catch((error) => {
        this.showProgressBar = false;
        console.error(error);
      });
  }
  private _filterAssignedBy(fullName: string): any[] {
    const filterValue = fullName.toLowerCase();
    return this.associatedUsers.filter((option: any) =>
      option.full_name.toLowerCase().includes(filterValue)
    );
  }
  private _filterCompanies(fullName: string): any[] {
    const filterValue = fullName.toLowerCase();
    return this.assignedCompanies.filter((option: any) =>
      option.company_name.toLowerCase().includes(filterValue)
    );
  }
  getAllClients() {
    this.showProgressBar = true;

    this._sunshineAPI
      .fetchAllCompany()
      .then((res: any) => {
        let resData = res.data;
        this.companyArr = resData.reverse();
        console.log('company-res:::', this.companyArr);
        this.showProgressBar = false;
        // this.companyNameFilteredOptions = this.companyName.valueChanges.pipe(
        //   startWith(''),
        //   //   tap((value) =>
        //   //     console.log('Initial value:', value)
        //   // ),
        //   map((value) => {
        //     const stringValue =
        //       typeof value === 'string' ? value : value.company_name;
        //     // console.log('Mapped value:', stringValue);
        //     return stringValue;
        //   }),
        //   map((companyName) => {
        //     const filteredResults = companyName
        //       ? this._filterCompanies(companyName)
        //       : this.companyArr.slice();
        //     // console.log('Filtered results:', filteredResults);
        //     return filteredResults;
        //   })
        // );
      })
      .catch((error) => {
        this.showProgressBar = false;
        console.error(error);
      });
  }
  agentHandler(value: any) {
    console.log(value);
    if (value) {
      console.log(this.allUsersArr);
      const user = this.allUsersArr.find(
        (user: any) => user.full_name === value
      );

      // if (!user) {
      //   this.openSnackBar('User not found');
      //   return;
      // }

      const { user_id, full_name, email_address } = user;
      console.log(user_id);

      this.dailyRepParams.agent_id = user_id;
      
      // Clear company selection when user changes
      this.companyName.setValue('');
      this.dailyRepParams.company_id = null;

      this.checkGenerateButtonState();
      this.getUserCompany(user_id);
    } else {
      this.companyNameFilteredOptions = of([]); // Assigning an observable of an empty array
      this.dailyRepParams.agent_id = null;
      this.checkGenerateButtonState();
    }
  }
  getUserCompany(agent_id: any) {
    let params = { user_id: agent_id };

    this._sunshineAPI
      .fectchUserCompany(params)
      .then((companyRes: any) => {
        const resData = companyRes?.data?.[0] || [];
        this.assignedCompanies = resData;
        this.companyArr = resData; // Keep for backward compatibility
        this.companyNameFilteredOptions = this.companyName.valueChanges.pipe(
          startWith(''),
          //   tap((value) =>
          //     console.log('Initial value:', value)
          // ),
          map((value) => {
            const stringValue =
              typeof value === 'string' ? value : value.company_name;
            // console.log('Mapped value:', stringValue);
            return stringValue;
          }),
          map((companyName) => {
            const filteredResults = companyName
              ? this._filterCompanies(companyName)
              : resData.slice();
            // console.log('Filtered results:', filteredResults);
            return filteredResults;
          })
        );
      })
      .catch((error: any) => {
        console.error('Error fetching user company:', error);
        this.assignedCompanies = [];
        this.companyArr = [];
        this.companyNameFilteredOptions = of([]);
      });
  }
  companyHandler(value: any) {
    console.log(value);
    console.log(this.assignedCompanies);
    const company = this.assignedCompanies.find(
      (company: any) => company.company_name === value
    );

    if (company) {
      const { company_id, company_name } = company;
      console.log(company_id);
      this.dailyRepParams.company_id = company_id;
      this.checkGenerateButtonState();
    } else {
      this.dailyRepParams.company_id = null;
      this.checkGenerateButtonState();
    }
  }
  fromDateHandler(event: any) {
    let inputDate = event.value._i;
    let fromDate = `${inputDate.year}-${inputDate.month + 1}-${inputDate.date}`;
    console.log('from-event', fromDate);
    this.dailyRepParams.start_dtm = fromDate;
    this.checkGenerateButtonState();
  }

  toDateHandler(event: any) {
    let inputDate = event.value._i;
    let toDate = `${inputDate.year}-${inputDate.month + 1}-${inputDate.date}`;
    console.log('to-event', toDate);
    this.dailyRepParams.end_dtm = toDate;
    this.dailyRepParams.to_dtm = toDate;
    this.checkGenerateButtonState();

    // console.log(
    //   'to-event',
    //   this._datePipe.transform(event.value._i, 'yyyy-MM-dd')
    // );
  }

  private uniqueResponseHandler(dailyResponse: any[]) {
    let fieldsTobeUnique = [
      'agreement_id',
      'customer_id',
      'product_type',
      'customer_name',
      'total_outstanding_amount',
      'tracing_source_type_name',
      'visa_status',
      'mol_status',
      'note',
      'stage_status_code',
      'stage',
      'date',
      'assigned_to',
      'assigned_by',
      'team_manager_id',
      'senior_manager_id',
    ];
    // console.log(dailyResponse);
    // Remove objects where "stage" is null
    const filteredResponse = dailyResponse.filter(
      (obj: { stage: null }) => obj.stage !== null
    );

    const uniqueRecords = filteredResponse.filter(
      (value: { [x: string]: any }, index: any, self: any[]) => {
        const identifier = fieldsTobeUnique
          .map((field) => value[field])
          .join('|');
        return (
          index ===
          self.findIndex((obj: { [x: string]: any }) =>
            fieldsTobeUnique.every((field) => obj[field] === value[field])
          )
        );
      }
    );

    // console.log(uniqueRecords);
    return uniqueRecords;
  }

  generateCNCReport(appUserId: number) {
    this.showProgressBar = true;
    this.dailyRepParams.app_user_id = appUserId;

    this._sunshineAPI
      .contactableNonContactableReports(this.dailyRepParams)
      .then((res: any) => {
        const resData = res.data[0] || []; // Handle possible undefined case
        console.log('non-unique-response-CNC-reports::', resData);
        this.myDataArray = this.uniqueResponseHandler(resData);
        console.log('unique-response-CNC-reports::', this.myDataArray);
        this.myDataArrayCopy = [...this.myDataArray]; // Ensure reference safety
        this.dataSource = new MatTableDataSource(this.myDataArray);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.resultsLength = this.myDataArray.length;
        this.showProgressBar = false;
        if (this.myDataArray.length > 0) {
          this.showCNCTBLBtn = true;
          this.disableExportBtn = false;
        }
        this.selectedStage = this.dailyRepParams.stage || 'ALL';
      })
      .catch((error) => {
        console.error(error);
        this.showProgressBar = false;
      });
  }

  contactableHandler(event: any) {
    let selectedStage = event.value;
    this.selectedStage = selectedStage;
    if (selectedStage === 'ALL') {
      this.dailyRepParams.stage = null;
    } else {
      this.dailyRepParams.stage = selectedStage;
    }

    if (selectedStage === 'ALL') {
      this.myDataArray = [...this.myDataArrayCopy]; // Restore original data
      this.dataSource = new MatTableDataSource(this.myDataArray);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      // this.myDataArray = this.myDataArrayCopy.filter(
      //   (stage: any) => stage.stage!== null
      // );
    } else {
      this.myDataArray = this.myDataArrayCopy.filter(
        (stage: any) => stage.stage === selectedStage
      );
      this.dataSource = new MatTableDataSource(this.myDataArray);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    }
  }

  //! TYPE 2 : FUNCTION TO EXPORT THE EXCEL WITH TRANSFORMED HEADERS - SEPARATE ROWS PER DB ENTRY
  exportToExcelFormat(responseData: any[], filename: string) {
    const fileType =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';

    const keyAliases: any = {
      company_name: 'Bank Name',
      agreement_id: 'Aggreement No. / CRN No.',
      customer_id: 'Customer Id / CIF No.',
      product_type: 'Product Type',
      product_account_number: 'Product Account No',
      customer_name: 'Customer Name',
      feedback: 'Feedback',
      field_feedback: 'Field Feedback',
      total_outstanding_amount: 'Outstanding',
      tracing_source_type_name: 'Traced Source',
      traced_details: 'Traced Details',
      visa_status: 'Visa Status',
      mol_status: 'MOL Status',
      allocation_status : 'Allocation-Status',
      visa_passport_no:'Passport-No',
      stage_status_name: 'Sub Code',
      stage: 'Contactable / Non-contactable',
      assigned_to_full_name: 'Agent Id',
      assigned_by_full_name: 'Team Leader Id',
      team_manager_full_name: 'Team Manager Id',
      senior_manager_full_name: 'Senior Manger id',
    };

    // Function to parse address_info field and extract individual records
    const parseAddressInfoRecords = (addressInfoString: string): any[] => {
      if (!addressInfoString || addressInfoString.trim() === '') {
        return [];
      }

      // Split by semicolon to get individual records, filter out empty ones
      const records = addressInfoString.split(';').filter(r => r.trim() !== '');
      
      // Parse each record
      const parsedRecords: any[] = [];
      
      records.forEach(record => {
        const trimmedRecord = record.trim();
        
        // Skip completely empty records
        if (!trimmedRecord) return;
        
        // Extract timestamp (pattern: YYYY-MM-DD HH:MM:SS at the start)
        const timestampMatch = trimmedRecord.match(/^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})/);
        const timestamp = timestampMatch ? timestampMatch[1] : '';
        
        // Remove timestamp from record to get address data
        const addressData = timestamp ? trimmedRecord.substring(timestamp.length).trim() : trimmedRecord;
        
        // The address_info format from DB is: timestamp + address_name + address_line_1 + address_line_2 + address_line_3 + city + state + country + zipcode
        // All concatenated without separators, so we just return the raw address data
        parsedRecords.push({
          address: addressData || null,
          timestamp: timestamp
        });
      });

      return parsedRecords;
    };

    // Function to parse contact_address_log field and extract address information
    const parseContactAddressLogRecords = (contactAddressLogString: string): any[] => {
      if (!contactAddressLogString || contactAddressLogString.trim() === '') {
        return [];
      }

      // First, normalize the string by replacing newlines with spaces
      const normalizedString = contactAddressLogString.replace(/\n/g, ' ').replace(/\r/g, ' ');
      
      // Split by ADDRESS INFO UPDATE and process each section
      const addressSections = normalizedString.split('ADDRESS INFO UPDATE');
      
      const parsedRecords: any[] = [];
      
      // Process each address section (skip the first empty one)
      for (let i = 1; i < addressSections.length; i++) {
        const section = addressSections[i];
        
        // Extract timestamp from the section
        const timestampMatch = section.match(/(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})/);
        const timestamp = timestampMatch ? timestampMatch[1] : '';
        
        // Extract address components
        const addressNameMatch = section.match(/address name was created as ([^;]+)/);
        const addressLine1Match = section.match(/address line 1 was created as ([^;]+)/);
        const addressLine2Match = section.match(/address line 2 was created as ([^;]+)/);
        const addressLine3Match = section.match(/address line 3 was created as ([^;]+)/);
        const cityMatch = section.match(/city was created as ([^;]+)/);
        const stateMatch = section.match(/state was created as ([^;]+)/);
        const countryMatch = section.match(/country was created as ([^;]+)/);
        const zipcodeMatch = section.match(/zipcode was created as ([^;]+)/);
        
        // Build concatenated address
        const addressParts = [
          addressNameMatch ? addressNameMatch[1].trim() : '',
          addressLine1Match ? addressLine1Match[1].trim() : '',
          addressLine2Match ? addressLine2Match[1].trim() : '',
          addressLine3Match ? addressLine3Match[1].trim() : '',
          cityMatch ? cityMatch[1].trim() : '',
          stateMatch ? stateMatch[1].trim() : '',
          countryMatch ? countryMatch[1].trim() : '',
          zipcodeMatch ? zipcodeMatch[1].trim() : ''
        ].filter(part => part && part !== '' && part !== 'NULL');
        
        const concatenatedAddress = addressParts.join(', ');
        
        if (concatenatedAddress.trim()) {
          parsedRecords.push({
            address: concatenatedAddress,
            timestamp: timestamp
          });
        }
      }

      return parsedRecords;
    };

    // Function to parse contact_info field and extract individual records
    const parseContactInfoRecords = (contactInfoString: string): any[] => {
      if (!contactInfoString || contactInfoString.trim() === '') {
        return [];
      }

      // Split by semicolon to get individual records, filter out empty ones
      const records = contactInfoString.split(';').filter(r => r.trim() !== '');
      
      // Parse each record
      const parsedRecords: any[] = [];
      
      records.forEach(record => {
        const trimmedRecord = record.trim();
        
        // Skip completely empty records
        if (!trimmedRecord) return;
        
        // Extract timestamp (pattern: YYYY-MM-DD HH:MM:SS at the start)
        const timestampMatch = trimmedRecord.match(/^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})/);
        const timestamp = timestampMatch ? timestampMatch[1] : '';
        
        // Remove timestamp from record to process fields
        const fieldsString = timestamp ? trimmedRecord.substring(timestamp.length).trim() : trimmedRecord;
        
        // Extract field values using regex
        const extractField = (fieldName: string): string | null => {
          const pattern = new RegExp(`${fieldName}-([^\\s]+(?:\\s+(?!\\w+-)[^\\s]+)*)`, 'i');
          const match = fieldsString.match(pattern);
          if (match && match[1]) {
            const value = match[1].trim();
            // Remove trailing field names if any
            const cleanValue = value.replace(/\s+(email-|phone-|phone_ext-|alternate_phone-|contact_name-|relationship-|other_contact-|employment_status-|employment_type-).*$/, '').trim();
            // Return null if empty, otherwise return the value
            return cleanValue ? cleanValue : null;
          }
          return null;
        };

        const phone = extractField('phone');
        const phone_ext = extractField('phone_ext');
        
        // Concatenate phone_ext with phone if both exist
        const fullPhone = phone_ext && phone ? `${phone_ext} ${phone}` : phone;

        parsedRecords.push({
          email: extractField('email'),
          phone: fullPhone,
          alternate_phone: extractField('alternate_phone'),
          contact_name: extractField('contact_name'),
          relationship: extractField('relationship'),
          other_contact: extractField('other_contact'),
          employment_status: extractField('employment_status'),
          employment_type: extractField('employment_type')
        });
      });

      return parsedRecords;
    };

    // Helper function to extract timestamp from entry string
    const extractTimestamp = (entry: string): { date: string | null, time: string | null } => {
      const timestampMatch = entry?.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})/);
      if (timestampMatch) {
        return {
          date: timestampMatch[1],
          time: timestampMatch[2]
        };
      }
      return { date: null, time: null };
    };

    // Helper function to extract "Updated By" from entry string
    const extractUpdatedBy = (entry: string): string | null => {
      if (!entry) return null;
      // Pattern: " - BY:FirstName LastName" at the end
      const byMatch = entry.match(/-\s*BY:\s*(.+?)$/);
      if (byMatch && byMatch[1]) {
        return byMatch[1].trim();
      }
      return null;
    };

    // Helper function to remove timestamp and "Updated By" from entry string
    const removeTimestampAndBy = (entry: string): string => {
      if (!entry) return entry;
      // Remove pattern: "YYYY-MM-DD HH:MM:SS - " from the beginning
      let cleaned = entry.replace(/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\s*-?\s*/, '').trim();
      // Remove pattern: " - BY:Name" from the end
      cleaned = cleaned.replace(/\s*-\s*BY:\s*.+$/, '').trim();
      return cleaned;
    };

    // Transform the response data - create multiple rows for each entry
    const transformedData: any[] = [];

    responseData.forEach((item) => {
      // Get all entries for fields that need splitting
      const feedbackEntries = item.feedback ? item.feedback.split(';').filter((f: string) => f.trim() !== '') : [];
      const fieldFeedbackEntries = item.field_feedback ? item.field_feedback.split(';').filter((f: string) => f.trim() !== '') : [];
      const tracedSourceEntries = item.tracing_source_type_name ? item.tracing_source_type_name.split(';').filter((f: string) => f.trim() !== '') : [];
      const tracedDetailsEntries = item.traced_details ? item.traced_details.split(';').filter((f: string) => f.trim() !== '') : [];
      
      // Parse contact info entries (returns objects with timestamp)
      const contactInfoEntries = item.contact_info ? parseContactInfoRecords(item.contact_info) : [];
      
      // Parse address info entries (returns objects with timestamp)
      const addressInfoEntries = item.address_info ? parseAddressInfoRecords(item.address_info) : [];
      
      // Parse contact address log entries (returns objects with timestamp)
      const contactAddressLogEntries = item.contact_address_log ? parseContactAddressLogRecords(item.contact_address_log) : [];

      // Find the maximum number of entries across all fields
      const maxEntries = Math.max(
        feedbackEntries.length,
        fieldFeedbackEntries.length,
        tracedSourceEntries.length,
        tracedDetailsEntries.length,
        contactInfoEntries.length,
        addressInfoEntries.length,
        contactAddressLogEntries.length,
        1 // At least one row
      );

      // Create a row for each entry
      for (let i = 0; i < maxEntries; i++) {
        const newObj: any = {};
        
        // Extract timestamp and updated by from the first available field for this row
        let rowDate: string | null = null;
        let rowTime: string | null = null;
        let updatedBy: string | null = null;
        
        // Try to get timestamp and updatedBy from feedback first
        if (feedbackEntries[i]) {
          const ts = extractTimestamp(feedbackEntries[i]);
          rowDate = ts.date;
          rowTime = ts.time;
          updatedBy = extractUpdatedBy(feedbackEntries[i]);
        }
        // If not found, try field_feedback
        if (!rowDate && fieldFeedbackEntries[i]) {
          const ts = extractTimestamp(fieldFeedbackEntries[i]);
          rowDate = ts.date;
          rowTime = ts.time;
          updatedBy = extractUpdatedBy(fieldFeedbackEntries[i]);
        }
        // If not found, try traced_source
        if (!rowDate && tracedSourceEntries[i]) {
          const ts = extractTimestamp(tracedSourceEntries[i]);
          rowDate = ts.date;
          rowTime = ts.time;
          updatedBy = extractUpdatedBy(tracedSourceEntries[i]);
        }
        // If not found, try traced_details
        if (!rowDate && tracedDetailsEntries[i]) {
          const ts = extractTimestamp(tracedDetailsEntries[i]);
          rowDate = ts.date;
          rowTime = ts.time;
          updatedBy = extractUpdatedBy(tracedDetailsEntries[i]);
        }
        // If not found, try contact_info (already parsed)
        if (!rowDate && contactInfoEntries[i]) {
          const contactEntry = item.contact_info.split(';')[i];
          if (contactEntry) {
            const ts = extractTimestamp(contactEntry);
            rowDate = ts.date;
            rowTime = ts.time;
            updatedBy = extractUpdatedBy(contactEntry);
          }
        }
        // If not found, try address_info (already parsed)
        if (!rowDate && addressInfoEntries[i]) {
          const addressEntry = item.address_info.split(';')[i];
          if (addressEntry) {
            const ts = extractTimestamp(addressEntry);
            rowDate = ts.date;
            rowTime = ts.time;
            updatedBy = extractUpdatedBy(addressEntry);
          }
        }
        // If not found, try contact_address_log (already parsed)
        if (!rowDate && contactAddressLogEntries[i]) {
          const contactAddressLogEntry = item.contact_address_log.split(';')[i];
          if (contactAddressLogEntry) {
            const ts = extractTimestamp(contactAddressLogEntry);
            rowDate = ts.date;
            rowTime = ts.time;
            updatedBy = extractUpdatedBy(contactAddressLogEntry);
          }
        }
        
        // Add update date, time, and updated by columns first
        newObj['Update Date'] = rowDate;
        newObj['Update Time'] = rowTime;
        newObj['Updated By'] = updatedBy;
        
        // Add all fields
        for (let key in item) {
          if (item.hasOwnProperty(key) && keyAliases.hasOwnProperty(key)) {
            const newKey = keyAliases[key];
            
            // For split fields, use the specific entry for this row and remove timestamp and BY info
            if (key === 'feedback') {
              newObj[newKey] = feedbackEntries[i] ? removeTimestampAndBy(feedbackEntries[i]) : null;
            } else if (key === 'field_feedback') {
              newObj[newKey] = fieldFeedbackEntries[i] ? removeTimestampAndBy(fieldFeedbackEntries[i]) : null;
            } else if (key === 'tracing_source_type_name') {
              newObj[newKey] = tracedSourceEntries[i] ? removeTimestampAndBy(tracedSourceEntries[i]) : null;
            } else if (key === 'traced_details') {
              newObj[newKey] = tracedDetailsEntries[i] ? removeTimestampAndBy(tracedDetailsEntries[i]) : null;
            } else {
              // For all other fields, repeat the same value
              newObj[newKey] = item[key] || null;
            }
          }
        }
        
        // Add contact info fields for this specific entry
        if (contactInfoEntries.length > 0 && contactInfoEntries[i]) {
          newObj['Phone'] = contactInfoEntries[i].phone;
          newObj['Alternate Phone'] = contactInfoEntries[i].alternate_phone;
          newObj['Email'] = contactInfoEntries[i].email;
          
          // Add address info right after email
          // Priority: contact_address_log first, then address_info
          if (contactAddressLogEntries.length > 0 && contactAddressLogEntries[i]) {
            newObj['Address'] = contactAddressLogEntries[i].address;
          } else if (addressInfoEntries.length > 0 && addressInfoEntries[i]) {
            newObj['Address'] = addressInfoEntries[i].address;
          } else {
            newObj['Address'] = null;
          }
          
          newObj['Reference Contact Name'] = contactInfoEntries[i].contact_name;
          newObj['Relationship'] = contactInfoEntries[i].relationship;
          newObj['Other Contact'] = contactInfoEntries[i].other_contact;
          newObj['Employment Status'] = contactInfoEntries[i].employment_status;
          newObj['Employment Type'] = contactInfoEntries[i].employment_type;
        } else {
          // Add null values if no contact info for this entry
          newObj['Phone'] = null;
          newObj['Alternate Phone'] = null;
          newObj['Email'] = null;
          
          // Add address info right after email even when no contact info
          // Priority: contact_address_log first, then address_info
          if (contactAddressLogEntries.length > 0 && contactAddressLogEntries[i]) {
            newObj['Address'] = contactAddressLogEntries[i].address;
          } else if (addressInfoEntries.length > 0 && addressInfoEntries[i]) {
            newObj['Address'] = addressInfoEntries[i].address;
          } else {
            newObj['Address'] = null;
          }
          
          newObj['Reference Contact Name'] = null;
          newObj['Relationship'] = null;
          newObj['Other Contact'] = null;
          newObj['Employment Status'] = null;
          newObj['Employment Type'] = null;
        }
        
        transformedData.push(newObj);
      }
    });

    // Function to calculate optimal column widths based on content
    const calculateColumnWidths = (data: any[]): any[] => {
      if (!data || data.length === 0) return [];
      
      const keys = Object.keys(data[0]);
      const colWidths: any[] = [];
      
      keys.forEach((key) => {
        let maxWidth = key.length; // Start with header length
        
        data.forEach(row => {
          const cellValue = String(row[key] || '');
            if (cellValue.length > maxWidth) {
              maxWidth = cellValue.length;
          }
        });
        
        // Apply width constraints
          maxWidth = Math.max(10, Math.min(maxWidth, 50));
        
        colWidths.push({ wch: maxWidth });
      });
      
      return colWidths;
    };

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(transformedData);

    // Set column widths
    ws['!cols'] = calculateColumnWidths(transformedData);

    // Enable text wrapping and set alignment for all cells
    if (ws['!ref']) {
      const range = XLSX.utils.decode_range(ws['!ref']);
      
      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          
          if (!ws[cellAddress]) continue;
          
          // Initialize cell style object if it doesn't exist
          if (!ws[cellAddress].s) {
            ws[cellAddress].s = {};
          }
          
          // Enable text wrapping and top alignment for all cells
          ws[cellAddress].s = {
            alignment: {
              wrapText: true,
              vertical: 'top',
              horizontal: 'left'
            }
          };
        }
      }
    }

    // Create workbook
    const wb = { Sheets: { data: ws }, SheetNames: ['data'] };

    // Write workbook to buffer
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    // Save file
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, filename + fileExtension);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  clearFilters() {
    this.showProgressBar = true;
    // this.dailyRepParams.app_user_id = this.loggedInUserId;
    this.generateCNCReport(this.loggedInUserId);
  }

  clearAgentSelection() {
    this.agentFullName.setValue('');
    this.companyName.setValue('');
    this.companyNameFilteredOptions = of([]);
    this.assignedCompanies = [];

    this.dailyRepParams.agent_id = null;
    this.dailyRepParams.company_id = null;
    this.checkGenerateButtonState();
    
    if (this.loggedInUserRoleName != 'ADMIN') {
      this.getAssociatedUsers();
    } else {
      this.getAllUsers();
    }
    // this.agentFullName.reset();
  }
  clearcompanySelection() {
    this.companyName.setValue('');
    this.dailyRepParams.company_id = null;
    this.checkGenerateButtonState();
    if (this.dailyRepParams.agent_id != null) {
      this.getUserCompany(this.dailyRepParams.agent_id);
    }
    // this.companyName.reset();
  }

  private checkGenerateButtonState() {
    // Check if we have the minimum required parameters to generate the report
    const hasStartDate = this.dailyRepParams.start_dtm !== null && this.dailyRepParams.start_dtm !== '';
    const hasEndDate = this.dailyRepParams.end_dtm !== null && this.dailyRepParams.end_dtm !== '';
    
    // For AGENT role, agent_id is automatically set, so we only need dates
    if (this.loggedInUserRoleName === 'AGENT') {
      this.disableGenerateBtn = !(hasStartDate && hasEndDate);
    } else {
      // For other roles, we need either agent_id or both dates
      const hasAgentId = this.dailyRepParams.agent_id !== null;
      this.disableGenerateBtn = !(hasAgentId || (hasStartDate && hasEndDate));
    }
  }
}
