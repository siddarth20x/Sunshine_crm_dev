import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
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

@Component({
  selector: 'app-final-feedback-reports',
  templateUrl: './final-feedback-reports.component.html',
  styleUrls: ['./final-feedback-reports.component.css'],
})
export class FinalFeedbackReportsComponent implements OnInit {
  loggedInUserId: any;
  fromDate: string = '';
  toDate: string = '';
  disableGenerateBtn: boolean = true;

  dataSource: any;
  expandedElement: any | null = null;
  myDataArray: any[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  resultsLength: number = 0;
  tableTxt: string = '';
  showProgressBar: boolean = false;
  columnsToDisplayWithExpand: string[] = [
    'customer_name',
    'company_name',
    'product_type',
    'customer_id',
    'account_number',
    'stage_status_code',
    'total_outstanding_amount',
    'contacble_non_contactable',
    'tracing_source_type_name',
    'feedback',
    'field_feedback',
    // 'stage',
    'contact_contact_mode',
    'contact_info',
    'address_contact_mode',
    'address_info',
    'visa_status',
    'visa_company_name',
    'visa_expiry_date',
    'visa_contact_no',
    'mol_status',
    'mol_company_name',
    'mol_expiry_date',
    'mol_salary',
    'last_activity_dtm',
    'next_follow_up_dtm',
    'assigned_to_full_name',
    'assigned_by_full_name',
    'team_manager_full_name',
    'senior_manager_full_name',
    // 'expand',
  ];

  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  durationInSeconds = 5;
  paginatedData: any[] = [];
  pageSize = 5;

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
    report_name: 'final-feedback-report',
  };

  disableExportBtn: boolean = true;
  showCNCTBLBtn: boolean = false;
  myDataArrayCopy: any[] = [];

  allUsersArr: any[] = [];
  agentFullName = new FormControl();
  agentFilteredOptions!: Observable<any[]>;

  companyName = new FormControl();
  companyNameFilteredOptions!: Observable<any[]>;
  companyArr: any[] = [];

  codesList: string[] = ['CALL', 'EMAIL', 'VISIT', 'MESSAGE'];
  codes = new FormControl([...this.codesList]);
  // deault contact mode assigned to filter record from DB
  defaultContactModeList: string = 'CALL,EMAIL,VISIT,MESSAGE';

  associatedUsers: any = [];
  assignedCompanies: any = [];
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
    
    // Hide user filter for AGENT role
    if (this.loggedInUserRoleName == 'AGENT') {
      this.showUserFilter = false;
    }
    
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

    this.dailyRepParams.contact_mode_list = this.defaultContactModeList;
    console.log(this.dailyRepParams);
  }
  private calculateCurrentDate(): string {
    let now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const day = String(now.getDate()).padStart(2, '0');
    this.disableGenerateBtn = false;

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
        // this.agentFilteredOptions = this.agentFullName.valueChanges.pipe(
        //   startWith(''),
        //   //   tap((value) =>
        //   //     console.log('Initial value:', value)
        //   // ),
        //   map((value) => {
        //     const stringValue =
        //       typeof value === 'string' ? value : value.full_name;
        //     // console.log('Mapped value:', stringValue);
        //     return stringValue;
        //   }),
        //   map((fullName) => {
        //     const filteredResults = fullName
        //       ? this._filterAssignedBy(fullName)
        //       : this.allUsersArr.slice();
        //     // console.log('Filtered results:', filteredResults);
        //     return filteredResults;
        //   })
        // );

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
      this.disableGenerateBtn = false;
      this.getUserCompany(user_id);
    } else {
      this.companyNameFilteredOptions = of([]); // Assigning an observable of an empty array
    }
  }

  getUserCompany(agent_id: any) {
    let params = { user_id: agent_id };

    this._sunshineAPI
      .fectchUserCompany(params)
      .then((companyRes: any) => {
        const resData = companyRes?.data?.[0] || [];
        this.assignedCompanies = resData;
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
        const errorMessage =
          error?.message ||
          'An error occurred while fetching user company details.';
        // this.openSnackBar(errorMessage);
      });
  }
  companyHandler(value: any) {
    console.log(value);
    console.log(this.companyArr);
    const company = this.companyArr.find(
      (user: any) => user.company_name === value
    );

    // if (!user) {
    //   this.openSnackBar('User not found');
    //   return;
    // }

    const { company_id, company_name } = company;
    console.log(company_id);
    this.dailyRepParams.company_id = company_id;
    this.disableGenerateBtn = false;
  }
  codesHandler(event: any) {
    let code = event.value;
    if (Array.isArray(code)) {
      // Convert array of strings to a comma-separated string
      code = code.join(',');
    }
    console.log(code);
    this.dailyRepParams.contact_mode_list = code;
    this.disableGenerateBtn = false;
  }
  fromDateHandler(event: any) {
    let inputDate = event.value._i;
    let fromDate = `${inputDate.year}-${inputDate.month + 1}-${inputDate.date}`;
    console.log('from-event', fromDate);
    this.dailyRepParams.start_dtm = fromDate;
    this.disableGenerateBtn = false;
  }

  toDateHandler(event: any) {
    let inputDate = event.value._i;
    let toDate = `${inputDate.year}-${inputDate.month + 1}-${inputDate.date}`;
    console.log('to-event', toDate);
    this.dailyRepParams.end_dtm = toDate;
    this.dailyRepParams.to_dtm = toDate;
    this.disableGenerateBtn = false;

    // console.log(
    //   'to-event',
    //   this._datePipe.transform(event.value._i, 'yyyy-MM-dd')
    // );
  }
  private uniqueResponseHandler(dailyResponse: any) {
    let fieldsTobeUnique = [
      'agreement_id',
      'customer_id',
      'product_type',
      'customer_name',
      'total_outstanding_amount',
      'tracing_source_type_name',
      'visa_status',
      'visa_company_name',
      'visa_expiry_date',
      'visa_contact_no',
      'visa_passport_no',
      'mol_status',
      'mol_company_name',
      'mol_salary',
      'mol_expiry_date',
      'sql_details',
      'email',
      'phone',
      'phone_ext',
      'alternate_phone',
      'address_name',
      'address_line_1',
      'address_line_2',
      'address_line_3',
      'city',
      'state',
      'country',
      'zipcode',
      'activity_dtm',
      'target_dtm',
      'last_paid_amount',
      'note',
      'stage_status_name',
      'stage_status_code',
      'stage_status',
      'stage',
      'date',
      'assigned_to',
      'assigned_by',
      'team_manager_id',
      'senior_manager_id',
      'contact_contact_mode'
    ];
    const uniqueRecords = dailyResponse.filter(
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
    return uniqueRecords;
  }
  generateCNCReport(appUserId: number) {
    this.showProgressBar = true;
    this.dailyRepParams.app_user_id = appUserId;
    this._sunshineAPI
      .contactableNonContactableReports(this.dailyRepParams)
      .then((res: any) => {
        let resData = res.data[0];
        console.log('non-unique-response-final-feedback-reports::', resData.length);
        this.myDataArray = this.uniqueResponseHandler(resData);
        console.log(
          'unique-response-final-feedback-reports::',
          this.myDataArray.length
        );
        this.myDataArrayCopy = [...this.myDataArray]; // Store a reference-safe copy
        this.dataSource = new MatTableDataSource(this.myDataArray);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.resultsLength = this.myDataArray.length;
        // this.paginateData();
        this.showProgressBar = false;
        if (resData.length > 0) {
          this.showCNCTBLBtn = true;
          this.disableExportBtn = false;
        } else {
          this.showCNCTBLBtn = false;
          this.disableExportBtn = true;
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  contactableHandler(event: any) {
    let tnt = event.value;
    this.disableGenerateBtn = false;

    if (tnt === 'UNTOUCHED') {
      this.myDataArray = this.myDataArrayCopy.filter(
        (item: any) => item.last_activity_dtm == null
      );
    } else if (tnt === 'TOUCHED') {
      this.myDataArray = this.myDataArrayCopy.filter(
        (item: any) => item.last_activity_dtm !== null
      );
    } else {
      this.myDataArray = this.myDataArrayCopy;
    }
  }

  //! TYPE 2 : FUNCTION TO EXPORT THE EXCEL WITH TRANSFORMED HEADERS AND PARSED CONTACT INFO
  exportToExcelFormat(responseData: any[], filename: string) {
    const fileType =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';

    const keyAliases: any = {
      company_name: 'Bank Name',
      agreement_id: 'Aggreement No. / CRN No.',
      customer_id: 'Customer Id / CIF No.',
      product_type: 'Product Type',
      customer_name: 'Customer Name',
      feedback: 'Feedback',
      field_feedback: 'Field Feedback',
      total_outstanding_amount: 'Outstanding',
      tracing_source_type_name: 'Traced Source',
      traced_details: 'Traced Details',
      stage: 'Contactable / Non-contactable',
      contact_contact_mode: 'Contact Mode',
      // contact_info: 'Contact Info', // Removed - now using separate columns
      address_contact_mode: 'Address Contact Mode',
      address_info: 'Address Info',
      visa_status: 'Visa Status',
      visa_company_name: 'Visa Company Name',
      visa_expiry_date: 'Visa Expiry Date',
      visa_contact_no: 'Visa Contact No.',
      mol_status: 'MOL Status',
      mol_company_name: 'MOL Company Name',
      mol_expiry_date: 'MOL Expiry Date',
      mol_salary: 'Salary',
      last_activity_dtm: 'Last Worked On',
      next_follow_up_dtm: 'Next Follow-up Date',
      assigned_to_full_name: 'Agent Id',
      assigned_by_full_name: 'Team Leader Id',
      team_manager_full_name: 'Team Manager Id',
      senior_manager_full_name: 'Senior Manger id',
    };

    // Helper function to extract timestamp from a string
    const extractTimestamp = (str: string): { date: string | null, time: string | null } => {
      if (!str) return { date: null, time: null };
      const match = str.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})/);
      if (match) {
        return { date: match[1], time: match[2] };
      }
      return { date: null, time: null };
    };

    // Helper function to extract updated by from a string
    const extractUpdatedBy = (str: string): string | null => {
      if (!str) return null;
      
      // Try different patterns for updated_by
      const patterns = [
        /updated_by-([^\s]+)/i,
        /updated_by:([^\s]+)/i,
        /updated_by\s+([^\s]+)/i,
        /by-([^\s]+)/i,
        /by:([^\s]+)/i,
        /by\s+([^\s]+)/i,
        /user-([^\s]+)/i,
        /user:([^\s]+)/i,
        /user\s+([^\s]+)/i
      ];
      
      for (const pattern of patterns) {
        const match = str.match(pattern);
        if (match && match[1]) {
          return match[1].trim();
        }
      }
      
      return null;
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

        const updatedBy = extractUpdatedBy(fieldsString);
        
        // Debug logging to see what data we're working with
        if (fieldsString && !updatedBy) {
          console.log('Contact Info - No updated_by found in:', fieldsString);
        }
        
        parsedRecords.push({
          email: extractField('email'),
          phone: fullPhone,
          alternate_phone: extractField('alternate_phone'),
          contact_name: extractField('contact_name'),
          relationship: extractField('relationship'),
          other_contact: extractField('other_contact'),
          employment_status: extractField('employment_status'),
          employment_type: extractField('employment_type'),
          timestamp: timestamp,
          updated_by: updatedBy,
          raw_fields: fieldsString // Keep raw fields for debugging
        });
      });
      
      return parsedRecords;
    };

    // Function to parse address_info field and extract individual records
    const parseAddressInfoRecords = (addressInfoString: string): any[] => {
      if (!addressInfoString || addressInfoString.trim() === '') {
        return [];
      }

      // First, normalize the data by replacing newlines with spaces and cleaning up
      let normalizedData = addressInfoString.replace(/\n/g, ' ').replace(/\r/g, ' ');
      
      const records = normalizedData.split(';').filter((r: string) => r.trim() !== '');
      const parsedRecords: any[] = [];
      
      records.forEach(record => {
        const trimmedRecord = record.trim();
        if (!trimmedRecord) return;
        
        const timestampMatch = trimmedRecord.match(/^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})/);
        const timestamp = timestampMatch ? timestampMatch[1] : '';
        
        // Remove timestamp from the beginning of the record
        let fieldsString = trimmedRecord;
        if (timestamp) {
          fieldsString = trimmedRecord.substring(timestamp.length).trim();
        }
        
        // Additional cleanup: remove any remaining timestamp patterns
        fieldsString = fieldsString.replace(/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/, '');
        fieldsString = fieldsString.replace(/^[;\s]+/, ''); // Remove leading semicolon and spaces
        
        // For address info, the fields might not have explicit field names
        // Let's try to extract common address patterns
        const extractField = (fieldName: string): string | null => {
          const pattern = new RegExp(`${fieldName}-([^\\s]+(?:\\s+(?!\\w+-)[^\\s]+)*)`, 'i');
          const match = fieldsString.match(pattern);
          if (match && match[1]) {
            const value = match[1].trim();
            const cleanValue = value.replace(/\s+(address_line_1-|address_line_2-|city-|state-|country-|pincode-|landmark-|address_type-).*$/, '').trim();
            return cleanValue ? cleanValue : null;
          }
          return null;
        };

        // If no explicit field names found, treat the entire string as address_line_1
        let addressLine1 = extractField('address_line_1');
        if (!addressLine1 && fieldsString.trim()) {
          // Just remove field patterns and trailing commas, keep everything else as is
          let cleanFieldsString = fieldsString.replace(/(address_line_1-|address_line_2-|city-|state-|country-|pincode-|landmark-|address_type-)/gi, '').trim();
          cleanFieldsString = cleanFieldsString.replace(/[,]+$/, ''); // Remove trailing commas only
          addressLine1 = cleanFieldsString;
        }

        parsedRecords.push({
          address_line_1: addressLine1,
          address_line_2: extractField('address_line_2'),
          city: extractField('city'),
          state: extractField('state'),
          country: extractField('country'),
          pincode: extractField('pincode'),
          landmark: extractField('landmark'),
          address_type: extractField('address_type'),
          timestamp: timestamp,
          updated_by: extractUpdatedBy(fieldsString),
          raw_data: fieldsString // Store cleaned data (timestamp already removed)
        });
      });
      
      return parsedRecords;
    };

    const transformedData: any[] = [];

    // Debug: Log sample data to understand structure
    if (responseData.length > 0) {
      console.log('Sample contact_info:', responseData[0].contact_info);
      console.log('Sample address_info:', responseData[0].address_info);
      console.log('Sample feedback:', responseData[0].feedback);
    }

    responseData.forEach((item) => {
      // Parse contact and address info
      const contactInfoEntries = parseContactInfoRecords(item.contact_info || '');
      const addressInfoEntries = parseAddressInfoRecords(item.address_info || '');
      
      // Get all entries for fields that need splitting
      const feedbackEntries = item.feedback ? item.feedback.split(';').filter((r: string) => r.trim() !== '') : [];
      const fieldFeedbackEntries = item.field_feedback ? item.field_feedback.split(';').filter((r: string) => r.trim() !== '') : [];
      const tracedSourceEntries = item.traced_source ? item.traced_source.split(';').filter((r: string) => r.trim() !== '') : [];
      const tracedDetailsEntries = item.traced_details ? item.traced_details.split(';').filter((r: string) => r.trim() !== '') : [];
      
      // Calculate maximum entries across all fields
      const maxEntries = Math.max(
        contactInfoEntries.length,
        addressInfoEntries.length,
        feedbackEntries.length,
        fieldFeedbackEntries.length,
        tracedSourceEntries.length,
        tracedDetailsEntries.length,
        1 // At least one row
      );

      // Create a row for each entry
      for (let i = 0; i < maxEntries; i++) {
      const newObj: any = {};
        
        // Extract timestamp and updated by from the first available field for this row
        let rowDate: string | null = null;
        let rowTime: string | null = null;
        let updatedBy: string | null = null;
        
        // Try to get timestamp and updatedBy from contact_info first
        if (contactInfoEntries[i]) {
          const ts = extractTimestamp(contactInfoEntries[i].timestamp || '');
          rowDate = ts.date;
          rowTime = ts.time;
          updatedBy = contactInfoEntries[i].updated_by;
        }
        // If not found, try address_info
        if (!rowDate && addressInfoEntries[i]) {
          const ts = extractTimestamp(addressInfoEntries[i].timestamp || '');
          rowDate = ts.date;
          rowTime = ts.time;
          updatedBy = addressInfoEntries[i].updated_by;
        }
        // If not found, try feedback
        if (!rowDate && feedbackEntries[i]) {
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
        
        // Add update date, time, and updated by columns first
        newObj['Update Date'] = rowDate;
        newObj['Update Time'] = rowTime;
        
        // Better fallback logic for Updated By
        let finalUpdatedBy = updatedBy;
        
        // If updatedBy is "App" or similar, try to get the full name from user data
        if (finalUpdatedBy && (finalUpdatedBy.toLowerCase() === 'app' || finalUpdatedBy === 'App')) {
          // Try to get the full name from available user fields
          if (item.assigned_to_full_name && item.assigned_to_full_name.trim() !== 'App') {
            finalUpdatedBy = item.assigned_to_full_name;
          } else if (item.assigned_by_full_name) {
            finalUpdatedBy = item.assigned_by_full_name;
          } else if (item.team_manager_full_name) {
            finalUpdatedBy = item.team_manager_full_name;
          } else if (item.senior_manager_full_name) {
            finalUpdatedBy = item.senior_manager_full_name;
          }
          // If still "App", keep it as is (don't hardcode)
        }
        
        if (!finalUpdatedBy) {
          // Try to construct full name from available fields
          const assignedTo = item.assigned_to_full_name ? item.assigned_to_full_name.trim() : '';
          
          if (assignedTo && assignedTo.toLowerCase() !== 'app') {
            finalUpdatedBy = assignedTo;
          } else if (item.assigned_by_full_name) {
            finalUpdatedBy = item.assigned_by_full_name;
          } else if (item.team_manager_full_name) {
            finalUpdatedBy = item.team_manager_full_name;
          } else if (item.senior_manager_full_name) {
            finalUpdatedBy = item.senior_manager_full_name;
          } else if (assignedTo.toLowerCase() === 'app') {
            // Keep as "App" if no better name found (don't hardcode)
            finalUpdatedBy = assignedTo;
          } else {
            finalUpdatedBy = 'Unknown';
          }
        }
        
        newObj['Updated By'] = finalUpdatedBy;
        
        // Add all fields
        for (let key in item) {
          if (item.hasOwnProperty(key) && keyAliases.hasOwnProperty(key)) {
            let value = item[key];
            
            // Special handling for contact_info - create separate columns
            if (key === 'contact_info' && contactInfoEntries[i]) {
              const contact = contactInfoEntries[i];
              // Instead of combining, we'll add separate columns
              newObj['Contact Email'] = contact.email || 'N/A';
              newObj['Contact Phone'] = contact.phone || 'N/A';
              newObj['Contact Name'] = contact.contact_name || 'N/A';
              newObj['Alternate Phone'] = contact.alternate_phone || 'N/A';
              newObj['Relationship'] = contact.relationship || 'N/A';
              newObj['Employment Status'] = contact.employment_status || 'N/A';
              newObj['Employment Type'] = contact.employment_type || 'N/A';
              // Skip the original contact_info column
              continue;
            } else if (key === 'address_info' && addressInfoEntries[i]) {
              const address = addressInfoEntries[i];
              if (address.address_line_1) {
                value = `${address.address_line_1 || ''} ${address.address_line_2 || ''}, ${address.city || ''}, ${address.state || ''}, ${address.pincode || ''}`.trim();
              } else if (address.raw_data) {
                // Use raw data as is (timestamps already removed during parsing)
                value = address.raw_data || 'No address information';
              } else {
                value = 'No address information';
              }
            } else if (key === 'feedback' && feedbackEntries[i]) {
              value = feedbackEntries[i].replace(/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\s+/, '');
            } else if (key === 'field_feedback' && fieldFeedbackEntries[i]) {
              value = fieldFeedbackEntries[i].replace(/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\s+/, '');
            } else if (key === 'traced_source' && tracedSourceEntries[i]) {
              value = tracedSourceEntries[i].replace(/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\s+/, '');
            } else if (key === 'traced_details' && tracedDetailsEntries[i]) {
              value = tracedDetailsEntries[i].replace(/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\s+/, '');
            } else if (key === 'last_activity_dtm') {
            value = value !== null ? 'Touched' : 'Untouched';
          }
            
          const newKey = keyAliases[key];
          newObj[newKey] = value;
        }
      }
        
        transformedData.push(newObj);
      }
    });

    // Sort by Update Date and Update Time (newest first)
    transformedData.sort((a, b) => {
      if (a['Update Date'] && b['Update Date']) {
        const dateCompare = b['Update Date'].localeCompare(a['Update Date']);
        if (dateCompare !== 0) return dateCompare;
        if (a['Update Time'] && b['Update Time']) {
          return b['Update Time'].localeCompare(a['Update Time']);
        }
      }
      return 0;
    });

    // Create worksheet and workbook
    const ws = XLSX.utils.json_to_sheet(transformedData);
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
    this.agentFullName.setValue(null);
    this.companyName.setValue(null);
    this.companyNameFilteredOptions = of([]);
    this.dailyRepParams.agent_id = null;
    this.dailyRepParams.company_id = null;
    this.getAssociatedUsers();
    // this.agentFullName.reset();
  }
  clearcompanySelection() {
    this.companyName.setValue(null);
    this.dailyRepParams.company_id = null;
    if (this.dailyRepParams.agent_id != null) {
      this.getUserCompany(this.dailyRepParams.agent_id);
    }
  }
}
