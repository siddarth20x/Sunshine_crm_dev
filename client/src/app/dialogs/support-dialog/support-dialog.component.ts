import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { Observable, startWith, map } from 'rxjs';
import { CustomFunctionsService } from 'src/app/sunshine-services/custom-functions.service';
import { SunshineInternalService } from 'src/app/sunshine-services/sunshine-internal.service';

@Component({
  selector: 'app-support-dialog',
  templateUrl: './support-dialog.component.html',
  styleUrls: ['./support-dialog.component.css'],
})
export class SupportDialogComponent implements OnInit {
  dialogTitle: string = '';
  dialogText: string = '';
  showProgressBar: boolean = false;
  dialogData: any = {};
  ticketForm: any;
  commentsForm: any;
  tktStatusTypeArr: any[] = [];
  tktIssueCatArr: any[] = [];
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  durationInSeconds = 5;
  allUsersCopy: any;
  allUsersArr: any;
  ticketRaisedByFullName = new FormControl();
  assignedByFilteredOptions!: Observable<any[]>;
  commentsArr: any[] = [];
  loggedInUserId: any;
  createTicketEmailNotif: any = {};
  allITManagers: any[] = [];
  disableCreateTaskBtn: boolean = false;
  formEdited: boolean = false;
  appNotifUser: any[] = [];
  isITManager: boolean = false;
  allAdmins: any[] = [];
  deactivatedUsers: any[] = [];

  isNewTicket: boolean = false;

  createPrivilegeName: string = 'CREATE';
  // uploadPrivilegeName: string = 'UPLOAD';
  readPrivilegeName: string = 'READ';
  editPrivilegeName: string = 'EDIT';
  moduleName: string = 'SUPPORT';
  isCreatePrivilegedModule: any;
  // isUploadPrivilegedModule: any;
  isReadPrivilegedModule: any;
  isEditPrivilegedModule: any;

  constructor(
    public dialogRef: MatDialogRef<SupportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _sunshineAPI: SunshineInternalService,
    private _snackBar: MatSnackBar,
    private _datePipe: DatePipe,
    private customFn: CustomFunctionsService
  ) {
    this.ticketForm = new FormGroup({
      app_user_id: new FormControl(null, [Validators.required]),
      ticket_status_type_id: new FormControl(null, [Validators.required]),
      ticket_issue_category_type_id: new FormControl(null, [
        Validators.required,
      ]),
      ticket_raised_by_id: new FormControl(null, [Validators.required]),
      ticket_raised_by_full_name: new FormControl(null),
      ticket_raised_dtm: new FormControl(null, [Validators.required]),
      ticket_resolved_dtm: new FormControl(null),
      ticket_issue_category_type_name: new FormControl(null, [
        Validators.required,
      ]),
      ticket_status_type_name: new FormControl(null, [Validators.required]),
      // comment: new FormControl(null, [Validators.required]),
    });
  }

  ngOnInit(): void {
    let usrDetails: any = sessionStorage.getItem('userDetails');
    let parsedUsrDetails = JSON.parse(usrDetails);
    this.loggedInUserId = parsedUsrDetails.user_id;
    
    // Check if user is IT manager
    this.isITManager = parsedUsrDetails.role_name === 'IT MANAGER';

    // Set create privilege based on role
    if (this.isITManager) {
      this.isCreatePrivilegedModule = true;
    } else {
      this.isCreatePrivilegedModule = this.customFn.checkForAllowedModuleAndPrivilegesForCreate(
        this.createPrivilegeName,
        this.moduleName
      );
    }

    this.isReadPrivilegedModule = this.customFn.checkForAllowedModuleAndPrivilegesForRead(
      this.readPrivilegeName,
      this.moduleName
    );

    this.isEditPrivilegedModule = this.customFn.checkForAllowedModuleAndPrivilegesForEdit(
      this.editPrivilegeName,
      this.moduleName
    );

    this.getAllUsers();
    this.fetchTktStatusType();
    this.fetchTktIssueCategory();
    this.addNewComment();

    // Set default user name for new tickets
    if (this.dialogData && this.dialogData.ticket_raised_by_full_name) {
      this.ticketForm.patchValue({
        ticket_raised_by_id: this.dialogData.ticket_raised_by_id,
        ticket_raised_by_full_name: this.dialogData.ticket_raised_by_full_name
      });
      this.ticketRaisedByFullName.setValue(this.dialogData.ticket_raised_by_full_name);
    }

    this.ticketForm.valueChanges.subscribe(() => {
      this.formEdited = false;
    });
  }

  getAllUsers() {
    this.showProgressBar = true;
    this._sunshineAPI
      .fetchAllUsers()
      .then((res: any) => {
        let resData = res.data[0];
        this.allUsersCopy = resData;
        
        // Store deactivated users for warning messages
        this.deactivatedUsers = resData.filter((user: any) => user.status === 0);
        
        // Filter out deactivated users (status = 0) from dropdown
        this.allUsersArr = resData.filter((user: any) => user.status !== 0);
        
        // Sort by user_id in descending order (highest to lowest)
        this.allUsersArr.sort((a: any, b: any) => {
          return b.user_id - a.user_id;
        });
        
        this.showProgressBar = false;
        this.assignedByFilteredOptions =
          this.ticketRaisedByFullName.valueChanges.pipe(
            startWith(''),
            map((value) => {
              const stringValue =
                typeof value === 'string' ? value : value.full_name;
              return stringValue;
            }),
            map((fullName) => {
              const filteredResults = fullName
                ? this._filterAssignedBy(fullName)
                : this.allUsersArr.slice();
              return filteredResults;
            })
          );

        this.receiveInjectedData();

        // Filter active users for IT managers and admins
        let activeUsers = resData.filter((user: any) => user.status !== 0);
        
        this.allITManagers = activeUsers.filter(
          (role: any) => role.role_name == 'IT MANAGER'
        );

        this.allAdmins = activeUsers.filter(
          (role: any) => role.role_name == 'ADMIN'
        );

        this.appNotifUser = activeUsers.filter(
          (role: any) =>
            role.role_name == 'IT MANAGER' || role.role_name == 'ADMIN'
        );

        console.log(this.allITManagers);
        console.log(this.appNotifUser);
      })
      .catch((error) => {
        this.showProgressBar = false;
        console.error(error);
      });
  }

  // Add method to check if a user is deactivated
  isUserDeactivated(fullName: string): boolean {
    return this.deactivatedUsers.some(user => user.full_name === fullName);
  }

  fetchTktIssueCategory() {
    let params = { ticket_issue_category_type_id: null };
    this._sunshineAPI
      .fetchTicketIssueCategory(params)
      .then((res: any) => {
        let resData = res.data[0];
        // console.log('res-fetchTicketIssueCategory', resData);
        this.tktIssueCatArr = resData;
      })
      .catch((error) => {
        this.openSnackBar(error.response.message);
      });
  }
  fetchTktStatusType() {
    let params = { ticket_status_type_id: null };
    this._sunshineAPI
      .fetchTicketStatusType(params)
      .then((res: any) => {
        let resData = res.data[0];
        // console.log('res-fetchTktStatusType', resData);
        this.tktStatusTypeArr = resData;
      })
      .catch((error) => {
        this.openSnackBar(error.response.message);
      });
  }

  tktStatusTypehandler(event: any) {
    // console.log('handler::', event.value);
    let tktStsVal = event.value;
    let foundStatus = this.tktStatusTypeArr.find(
      (status) => status.ticket_status_type_name === tktStsVal
    );
    console.log(foundStatus.ticket_status_type_name);
    if (foundStatus) {
      this.ticketForm.patchValue({
        ticket_status_type_name: foundStatus.ticket_status_type_name,
        ticket_status_type_id: foundStatus.ticket_status_type_id,
      });
      this.formEdited = true;
    }
    console.log('tkt-sts-hdlr::', this.ticketForm.value);
    this.createTicketEmailNotif.ticket_status_type_name =
      this.ticketForm.value.ticket_status_type_name;
  }
  tktIssueCathandler(event: any) {
    console.log('handler::', event.value);
    // console.log('handler::', event.value);
    let tktIssCatVal = event.value;
    let foundCat = this.tktIssueCatArr.find(
      (category) => category.ticket_issue_category_type_name === tktIssCatVal
    );
    console.log(foundCat.ticket_issue_category_type_name);
    if (foundCat) {
      this.ticketForm.patchValue({
        ticket_issue_category_type_name:
          foundCat.ticket_issue_category_type_name,
        ticket_issue_category_type_id: foundCat.ticket_issue_category_type_id,
      });
      this.formEdited = true;
    }
    console.log('tkt-cat-hdlr::', this.ticketForm.value);
    this.createTicketEmailNotif.ticket_issue_category_type_name =
      this.ticketForm.value.ticket_issue_category_type_name;
  }
  private _filterAssignedBy(fullName: string): any[] {
    const filterValue = fullName.toLowerCase();
    return this.allUsersArr.filter((option: any) =>
      option.full_name.toLowerCase().includes(filterValue)
    );
  }
  assignedByHandler(value: any) {
    console.log(value);
    console.log(this.allUsersArr);
    const user = this.allUsersArr.find((user: any) => user.full_name === value);

    if (!user) {
      this.openSnackBar('User not found');
      return;
    }

    const { user_id, full_name, email_address } = user;
    console.log(user);
    this.ticketForm.patchValue({
      // app_user_id should remain as the logged-in user (who is creating the ticket)
      // Only update ticket_raised_by_id to the selected user (for whom the ticket is being raised)
      ticket_raised_by_id: user_id,
      ticket_raised_by_full_name: full_name,
    });
    console.log(this.ticketForm.value);
    this.createTicketEmailNotif.ticket_raised_by_full_name = this.ticketForm.value.ticket_raised_by_full_name;
    this.formEdited = true;
  }

  assignedDateHandler(event: any) {
    let inputDate = event.value._i;
    let expDate = `${inputDate.year}-${inputDate.month + 1}-${inputDate.date}`;
    this.ticketForm.patchValue({
      ticket_raised_dtm: this._datePipe.transform(
        this.ticketForm.value.ticket_raised_dtm,
        'yyyy-MM-dd'
      ),
    });
    console.log('tkt-raised-dtm-hdlr::', this.ticketForm.value);
    this.createTicketEmailNotif.ticket_raised_dtm =
      this.ticketForm.value.ticket_raised_dtm;
    this.formEdited = true;
  }

  resolvedDateHandler(event: any) {
    let inputDate = event.value._i;
    // console.log(`${inputDate.year}-${inputDate.month + 1}-${inputDate.date}`);
    let expDate = `${inputDate.year}-${inputDate.month + 1}-${inputDate.date}`;

    this.ticketForm.patchValue({
      ticket_resolved_dtm: this._datePipe.transform(
        this.ticketForm.value.ticket_resolved_dtm,
        'yyyy-MM-dd'
      ),
    });

    console.log('tkt-resolved-dtm-hdlr::', this.ticketForm.value);
    this.formEdited = true;
  }
  receiveInjectedData() {
    this.dialogTitle = this.data.dialogTitle;
    this.dialogText = this.data.dialogText;
    this.dialogData = this.data.dialogData;
    console.log(this.dialogData);
    if (this.dialogData != undefined) {
      // For new tickets, app_user_id should be the logged-in user (who is creating the ticket)
      // and ticket_raised_by_id should be the user for whom the ticket is being raised
      let appUserId = this.dialogData.app_user_id;
      let ticketRaisedById = this.dialogData.ticket_raised_by_id;
      
      // If this is a new ticket creation, ensure proper user assignment
      if (!this.dialogData.ticket_id) {
        appUserId = this.loggedInUserId; // The logged-in user is creating the ticket
        ticketRaisedById = this.dialogData.ticket_raised_by_id || this.loggedInUserId; // Default to logged-in user if not specified
        this.isNewTicket = true;
        // Clear resolved date for new tickets
        this.dialogData.ticket_resolved_dtm = null;
      } else {
        this.isNewTicket = false;
      }
      
      this.ticketForm.patchValue({
        app_user_id: appUserId,
        ticket_id: this.dialogData.ticket_id,
        ticket_status_type_id: this.dialogData.ticket_status_type_id,
        ticket_raised_by_full_name: this.dialogData.ticket_raised_by_full_name,
        ticket_issue_category_type_id:
          this.dialogData.ticket_issue_category_type_id,
        ticket_issue_category_type_name:
          this.dialogData.ticket_issue_category_type_name,
        ticket_status_type_name: this.dialogData.ticket_status_type_name,
        ticket_raised_by_id: ticketRaisedById,
        ticket_raised_dtm: this.dialogData.ticket_raised_dtm
          ? this.dialogData.ticket_raised_dtm.split('T')[0]
          : this.dialogData.ticket_raised_dtm,
        ticket_resolved_dtm: this.dialogData.ticket_resolved_dtm
          ? this.dialogData.ticket_resolved_dtm.split('T')[0]
          : this.dialogData.ticket_resolved_dtm,
        status: this.dialogData.status,
      });
      if (
        this.dialogData.ticket_id != null ||
        this.dialogData.ticket_id != undefined
      ) {
        this.getAllComments(this.dialogData.ticket_id);
      }
      this.createTicketEmailNotif.ticket_id = this.dialogData.ticket_id;
      this.createTicketEmailNotif.ticket_issue_category_type_name =
        this.dialogData.ticket_issue_category_type_name;
      this.createTicketEmailNotif.ticket_status_type_name =
        this.dialogData.ticket_status_type_name;
      this.createTicketEmailNotif.ticket_raised_by_full_name =
        this.dialogData.ticket_raised_by_full_name;
      this.createTicketEmailNotif.ticket_raised_dtm = this.dialogData
        .ticket_raised_dtm
        ? this.dialogData.ticket_raised_dtm.split('T')[0]
        : this.dialogData.ticket_raised_dtm;
    }
  }

  // async createNewTicket() {
  //   this.showProgressBar = true;
  //   console.log('create-tkt:::', this.ticketForm.value);
  //   const nullSafetyCheck = this.checkNullKeys(this.ticketForm.value);
  //   if (!nullSafetyCheck.status) {
  //     this.openSnackBar(nullSafetyCheck.msg);
  //     this.showProgressBar = false;
  //     this.disableCreateTaskBtn = true;
  //     return;
  //   }

  //   try {
  //     const res: any = await this._sunshineAPI.postNewTicket(
  //       this.ticketForm.value
  //     );
  //     console.log('create-tkt-res::', res.data[1][0]);
  //     let resData = res.data[1][0];
  //     let lastInsertedTicketId = resData.last_inserted_ticket_id;
  //     this.commentsArr[0].ticket_id = lastInsertedTicketId;
  //     await this.saveComments(undefined, this.commentsArr, 0);
  //     this.showProgressBar = false;
  //     // this.dialogRef.close({
  //     //   message: `Ticket Created`,
  //     //   create: 1,
  //     //   // ticket_id: this.newTaskObj.lead_id,
  //     // });
  //     this.openSnackBar(res.message);

  //     // if (this.allITManagers.length > 0) {
  //     //   // this.createAssignedByNoteNotif(this.createTicketEmailNotif);
  //     //   this.allITManagers.forEach((usr) => {
  //     //     this.emailCreateTicketToAdmin(
  //     //       this.createTicketEmailNotif,
  //     //       'New Ticket Raised',
  //     //       usr.email_address,
  //     //       usr.full_name
  //     //     );
  //     //   });
  //     // }
  //   } catch (error) {
  //     console.error('task-create-err::', error);
  //     this.showProgressBar = false;
  //     this.disableCreateTaskBtn = true;
  //     this.dialogRef.close({
  //       message: `Ticket Creation Failed`,
  //       create: 0,
  //       // leadId: this.newTaskObj.lead_id,
  //     });
  //     this.openSnackBar('Failed to create ticket. Please try again later.');
  //   }
  // }

  async createNewTicket() {
    this.showProgressBar = true;
    console.log('create-tkt:::', this.ticketForm.value);

    const nullSafetyCheck = this.checkNullKeys(this.ticketForm.value);
    if (!nullSafetyCheck.status) {
      this.openSnackBar(nullSafetyCheck.msg);
      this.showProgressBar = false;
      this.disableCreateTaskBtn = true;
      return;
    }

    try {
      const res: any = await this._sunshineAPI.postNewTicket(
        this.ticketForm.value
      );
      console.log('create-tkt-res::', res);

      if (res && res.data && res.data[1] && res.data[1][0]) {
        let resData = res.data[1][0];
        let lastInsertedTicketId = resData.last_inserted_ticket_id;
        console.log('lastInsertedTicketId::', lastInsertedTicketId);

        if (lastInsertedTicketId) {
          this.createTicketEmailNotif.comment = this.commentsArr[0].comment;
          this.commentsArr[0].ticket_id = lastInsertedTicketId;
          console.log(
            'commentsArr after setting ticket_id::',
            this.commentsArr
          );
          await this.saveComments(undefined, this.commentsArr[0], 0);
          this.dialogRef.close({
            message: `Ticket Created`,
            create: 1,
            // ticket_id: this.newTaskObj.lead_id,
          });

          if (
            this.ticketForm.value.ticket_issue_category_type_name !==
              'MANAGEMENT APPROACH' &&
            this.allITManagers.length !== 0
          ) {
            // this.createAssignedByNoteNotif(this.createTicketEmailNotif);
            this.allITManagers.forEach((usr) => {
              this.emailCreateTicketToAdmin(
                this.createTicketEmailNotif,
                'New Ticket Raised',
                usr.email_address,
                usr.full_name
              );
            });
          } else {
            this.allAdmins.forEach((usr) => {
              this.emailCreateTicketToAdmin(
                this.createTicketEmailNotif,
                `New Ticket Raised`,
                usr.email_address,
                usr.full_name
              );
            });
          }

          if (this.appNotifUser.length !== 0) {
            // this.createAssignedByNoteNotif(this.createTicketEmailNotif);
            this.appNotifUser.forEach((usr) => {
              this.createTicketNotif(usr);
            });
          }
        } else {
          console.warn('No lastInsertedTicketId found in the response');
        }

        this.showProgressBar = false;
        this.openSnackBar(res.message);
      } else {
        console.warn('Unexpected response structure', res);
        this.showProgressBar = false;
        this.openSnackBar(
          'Failed to create ticket. Unexpected response structure.'
        );
      }
    } catch (error) {
      console.error('task-create-err::', error);
      this.showProgressBar = false;
      this.disableCreateTaskBtn = true;
      this.dialogRef.close({
        message: `Ticket Creation Failed`,
        create: 0,
      });
      this.openSnackBar('Failed to create ticket. Please try again later.');
    }
  }

  async updateTicket(dialogData: any) {
    this.showProgressBar = true;
    console.log('update-tkt:::', dialogData);

    // Get the current form values
    const formValues = this.ticketForm.value;
    
    // If the raised by name has changed, update the app_user_id
    if (formValues.ticket_raised_by_full_name !== dialogData.ticket_raised_by_full_name) {
      const selectedUser = this.allUsersArr.find(
        (user: any) => user.full_name === formValues.ticket_raised_by_full_name
      );
      if (selectedUser) {
        formValues.app_user_id = selectedUser.user_id;
        formValues.ticket_raised_by_id = selectedUser.user_id;
      }
    }

    formValues.ticket_id = dialogData.ticket_id;

    const nullSafetyCheck = this.checkNullKeys(formValues);
    if (!nullSafetyCheck.status) {
      this.openSnackBar(nullSafetyCheck.msg);
      this.showProgressBar = false;
      this.disableCreateTaskBtn = true;
      return;
    }

    // Format dates if they exist
    if (formValues.ticket_raised_dtm) {
      formValues.ticket_raised_dtm = formValues.ticket_raised_dtm.split('T')[0];
    }
    if (formValues.ticket_resolved_dtm) {
      formValues.ticket_resolved_dtm = formValues.ticket_resolved_dtm.split('T')[0];
    }

    console.log('Updating ticket with values:', formValues);

    try {
      const res: any = await this._sunshineAPI.editTicket(formValues);
      this.showProgressBar = false;
      this.dialogRef.close({
        message: `Ticket Updated`,
        update: 1,
      });
      this.openSnackBar(res.message);

      // Send notifications to IT managers about the update
      if (this.allITManagers.length > 0) {
        console.log(this.createTicketEmailNotif);
        this.allITManagers.forEach((usr) => {
          this.emailCreateTicketToAdmin(
            this.createTicketEmailNotif,
            'Ticket Update',
            usr.email_address,
            usr.full_name
          );
        });
      }
    } catch (error) {
      console.error('task-create-err::', error);
      this.showProgressBar = false;
      this.disableCreateTaskBtn = true;
      this.dialogRef.close({
        message: `Ticket Update Failed`,
        update: 0,
      });
      this.openSnackBar('Failed to update ticket. Please try again later.');
    }
  }

  checkNullKeys(obj: any): any {
    // Additional check for document_url if task_type_name is DOCUMENT UPLOAD
    // if (obj.task_type_name === 'DOCUMENT UPLOAD') {
    //   if (obj.document_url == null || obj.document_url == '') {
    //     this.openSnackBar(
    //       `Please upload document for task type DOCUMENT UPLOAD`
    //     );
    //     this.disableCreateTaskBtn = true;
    //     return {
    //       status: false,
    //       msg: `Please upload document for task type DOCUMENT UPLOAD`,
    //     };
    //   }
    // }
    // // console.log(obj);
    const expectedKeys = [
      'app_user_id',
      // 'ticket_id',
      'ticket_status_type_id',
      'ticket_issue_category_type_id',
      'ticket_issue_category_type_name',
      'ticket_status_type_name',
      'ticket_raised_by_id',
      'ticket_raised_dtm',
      'ticket_raised_by_full_name',
      // 'ticket_resolved_dtm',
    ];

    for (const key of expectedKeys) {
      if (!(key in obj)) {
        this.openSnackBar(`Key '${key}' is not present in the object`);
        // return `Key '${key}' is not present in the object`;
        this.disableCreateTaskBtn = true;
        return {
          status: false,
          msg: `Key '${key}' is not present in the object`,
        };
      }

      if (obj[key] === null) {
        this.openSnackBar(`Key '${key}' cannot be null`);
        // return `Key '${key}' is null`;
        this.disableCreateTaskBtn = true;

        return {
          status: false,
          msg: `Key '${key}' is null`,
        };
      }

      if (obj[key] === '') {
        this.openSnackBar(`Key '${key}' cannot be empty string`);
        // return `Key '${key}' is null`;
        this.disableCreateTaskBtn = true;

        return {
          status: false,
          msg: `Key '${key}' is null`,
        };
      }
    }

    this.disableCreateTaskBtn = false;

    return {
      status: true,
      msg: `Thumbs up!`,
    };
  }

  getAllComments(ticketId: number) {
    console.log(ticketId);
    let params = { ticket_id: ticketId, comment_id: null };
    this._sunshineAPI
      .fetchAllComments(params)
      .then((res: any) => {
        let resData = res.data[0];
        this.commentsArr = resData;
        console.log('comment-by-tkt-id:::', resData);
      })
      .catch((error) => {
        this.openSnackBar(error.response.message);
      });
  }
  addNewComment() {
    this.commentsArr.push({
      app_user_id: this.loggedInUserId,
      ticket_id: this.dialogData.ticket_id,
      comment: '',
      iscommentsDisabled: true,
      isEdited: false,
    });
    console.log('add-new-comment::', this.commentsArr);
  }

  async deletecomments(comments: any, i: number) {
    if (this.commentsArr[i]['comment'] === '') {
      // this.openSnackBar(`Empty commentss cannot be created`);
      // this.commentsArr[i]['iscommentsDisabled'] = true;
      this.commentsArr.splice(i, 1);
      return;
    } else {
      comments.status = 0;
      (comments.app_user_id = this.loggedInUserId), delete comments.created_id;
      delete comments.created_dtm;
      delete comments.modified_id;
      delete comments.modified_dtm;
      // delete comments.ticket_id;
      delete comments.iscommentsDisabled;
      console.log('Deleting comments:', comments);
      this.showProgressBar = true;
      const res = await this._sunshineAPI.editComment(comments);
      this.dialogRef.close({ update: 1 });
      this.showProgressBar = false;
      this.openSnackBar(res.message);
    }
  }

  typeComment(event: any, i: number) {
    let commentTxt = event.target.value;
    if (commentTxt !== '') {
      this.commentsArr[i]['comment'] = commentTxt;
      this.commentsArr[i]['iscommentsDisabled'] = false;
      this.commentsArr[i]['isEdited'] = true;
      this.createTicketEmailNotif.comment = this.commentsArr[i]['comment'];
    } else {
      this.commentsArr[i]['iscommentsDisabled'] = true;
      this.commentsArr[i]['isEdited'] = false;
    }

    console.log('txt::', this.commentsArr);
  }

  async saveComments(commentId: number | undefined, comment: any, i: number) {
    const isEmptyNote = this.commentsArr[i].comment === '';

    if (isEmptyNote) {
      this.openSnackBar(`Empty comment cannot be created`);
      this.commentsArr[i].iscommentsDisabled = true;
      return;
    }

    try {
      if (commentId === undefined) {
        console.log('Creating new COMMENT:', comment);
        delete comment.iscommentsDisabled;
        this.commentsArr[i].iscommentsDisabled = false;
        this.commentsArr[i]['isEdited'] = false;

        // this.openSnackBar(`CREATE NEW COMMENT`);
        this.showProgressBar = true;
        const res = await this._sunshineAPI.postNewComment(comment);
        this.dialogRef.close({ create: 1 });
        this.showProgressBar = false;
        this.openSnackBar(res.message);
        // if (this.createTicketEmailNotif.assigned_by_id) {
        //   // this.createAssignedByNoteNotif(this.createTicketEmailNotif);
        //   this.emailCreateTicketToAdmin(
        //     this.createTicketEmailNotif,
        //     'New Ticket Raised',
        //   );
        // }
        // if (this.createTicketEmailNotif.assigned_to_id) {
        //   this.createAssignedToNoteNotif(this.createTicketEmailNotif);
        //   this.emailCreateNoteAssignedTo(
        //     this.createTicketEmailNotif,
        //     'New Ticket Raised',
        //     this.commentsArr[i]['comment']
        //   );
        // }
      } else {
        console.log('Editing COMMENT:', commentId, comment);
        this.commentsArr[i].iscommentsDisabled = false;
        this.commentsArr[i]['isEdited'] = false;

        // this.openSnackBar(`UPDATE COMMENT`);
        comment.app_user_id = this.loggedInUserId;
        delete comment.created_id;
        delete comment.created_dtm;
        delete comment.modified_id;
        delete comment.modified_dtm;
        // delete comment.task_id;
        delete comment.iscommentsDisabled;
        this.showProgressBar = true;
        const res = await this._sunshineAPI.editComment(comment);
        this.dialogRef.close({ update: 1 });
        this.showProgressBar = false;
        this.openSnackBar(res.message);
        // if (this.createTicketEmailNotif.assigned_by_id) {
        //   this.updateAssignedByNoteNotif(this.createTicketEmailNotif);
        //   this.emailCreateTicketToAdmin(
        //     this.createTicketEmailNotif,
        //     'Ticket Update',
        //     this.commentsArr[i]['comment']
        //   );
        // }
        // if (this.createTicketEmailNotif.assigned_to_id) {
        //   this.updateAssignedToNoteNotif(this.createTicketEmailNotif);
        //   this.emailCreateNoteAssignedTo(
        //     this.createTicketEmailNotif,
        //     'Ticket Update',
        //     this.commentsArr[i]['comment']
        //   );
        // }
      }
    } catch (error) {
      this.showProgressBar = false;
      console.error('An error occurred:', error);

      if (error instanceof HttpErrorResponse) {
        // Handle HTTP errors
        this.openSnackBar(
          'Failed to create or update comment. Please try again later.'
        );
      } else if (error instanceof Error) {
        // Handle other types of errors
        this.openSnackBar(
          'An unexpected error occurred. Please try again later.'
        );
      } else {
        // Handle other types of errors
        this.openSnackBar('An unknown error occurred. Please try again later.');
      }
    }
  }

  cancelTicket() {
    this.dialogRef.close({
      cancel: 1,
    });
  }

  emailCreateTicketToAdmin(
    tkt: any,
    action: string,
    adminEmail: string,
    adminName: string
  ) {
    console.log('new-ticket::::', tkt);
    let emailBody = `
      Hi ${adminName === undefined || adminName === null ? '' : adminName},
      <br><br>
      ${action} by ${
      tkt.ticket_raised_by_full_name === undefined ||
      tkt.ticket_raised_by_full_name === null
        ? ''
        : tkt.ticket_raised_by_full_name
    }:
      <ul>
        <li><strong>Ticket Issue Type:</strong> ${
          tkt.ticket_issue_category_type_name === undefined ||
          tkt.ticket_issue_category_type_name === null
            ? ''
            : tkt.ticket_issue_category_type_name
        }</li>
        <li><strong>Ticket Raised By:</strong> ${
          tkt.ticket_raised_by_full_name === undefined ||
          tkt.ticket_raised_by_full_name === null
            ? ''
            : tkt.ticket_raised_by_full_name
        }</li>
        <li><strong>Ticket Raised At:</strong> ${
          tkt.ticket_raised_dtm === undefined || tkt.ticket_raised_dtm === null
            ? ''
            : tkt.ticket_raised_dtm
        }</li>
        <li><strong>Ticket Status:</strong> ${
          tkt.ticket_status_type_name === undefined ||
          tkt.ticket_status_type_name === null
            ? ''
            : tkt.ticket_status_type_name
        }</li>
        <br>
        <li><strong>Issue:</strong> ${
          tkt.comment === undefined || tkt.comment === null ? '' : tkt.comment
        }</li>
        </ul>
      <br>
      Thank you,<br>
      Team Sunshine Solutions Pvt. Ltd.<br>
      This automated mail was sent by Sunshine Solutions Pvt. Ltd. Please do not reply directly to this email.
      For questions or assistance, please get in touch with info@mailers.codeswift.in.
    `;

    let receiverEmailId = adminEmail;
    let emailSubject = `${action} - "${
      tkt.ticket_issue_category_type_name === undefined ||
      tkt.ticket_issue_category_type_name === null
        ? ''
        : tkt.ticket_issue_category_type_name
    }"`;

    let finalEmail = {
      to: receiverEmailId,
      subject: emailSubject,
      emailBody: emailBody,
    };

    this._sunshineAPI
      .sendEmail(finalEmail)
      .then((res: any) => {
        console.log('ticket-create-email-res::::', res);
        this.openSnackBar(res.message);
        console.log(`Email sent for new ticket to: ${adminEmail}`);
      })
      .catch((error) => {
        this.openSnackBar(error);
      });
  }

  createTicketNotif(notif: any) {
    let notifType: any = sessionStorage.getItem('notifType');
    let parsedNotifType = JSON.parse(notifType);
    console.log(parsedNotifType[20]);
    // console.log(notif.assigned_by_id);

    let createUsrNotifObj = {
      user_id: notif.user_id,
      notification_type_id: parsedNotifType[20].notification_type_id,
      notification_name: parsedNotifType[20].notification_type_name,
      notification_message: `${parsedNotifType[20].notification_type_description} as ${notif.full_name}`,
      notification_effective_from: this.getCurrentTimestamp(),
      notification_effective_to: null,
      notification_lifespan_days: null,
      notification_publish_flag: 1,
      acknowledgment_required: 1,
      notification_acknowledged_on: null,
      app_user_id: this.loggedInUserId,
    };

    console.log('------>', createUsrNotifObj);

    this._sunshineAPI
      .postNewUserNotification(createUsrNotifObj)
      .then((res: any) => {
        console.log('ac-update-app-notif-res;:::', res);
        this.openSnackBar(res.message);
      })
      .catch((error) => {
        console.error('create-use-notif-err::::', error);
        this.openSnackBar(error.response.message);
      });
  }
  getCurrentTimestamp() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const day = String(now.getDate()).padStart(2, '0');

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  openSnackBar(message: string) {
    this._snackBar.open(message, 'Okay', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds * 1000,
    });
    // this._snackBar.open(message);
  }

  // Add method to show warning when deactivated user icon is clicked
  showDeactivatedUserWarning() {
    this._snackBar.open('Warning: The selected Raised By user has been deactivated/deleted from the platform.', 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}
