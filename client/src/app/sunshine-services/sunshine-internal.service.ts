import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpResponse,
  JsonpClientBackend,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import axios from 'axios';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root',
})
export class SunshineInternalService {
  baseUrl = `http://localhost:8080`;
  // baseUrl = `https://sunshine-dev-server.el.r.appspot.com`;

  private notificationCountSource = new BehaviorSubject<number>(0);
  currentNotificationCount = this.notificationCountSource.asObservable();

  constructor(private _http: HttpClient, private storage: AngularFireStorage) {}
  // adjustTimestamp(capturedTimestamp: string, at: number) {
  //   const now = new Date(capturedTimestamp);
  //   // Subtract 5 hours and 30 minutes
  //   now.setHours(now.getHours() - 5);
  //   now.setMinutes(now.getMinutes() - 30);
  //   const year = now.getFullYear();
  //   const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  //   const day = String(now.getDate()).padStart(2, '0');
  //   const hours = String(now.getHours()).padStart(2, '0');
  //   const minutes = String(now.getMinutes()).padStart(2, '0');
  //   const seconds = String(now.getSeconds()).padStart(2, '0');
  //   const adjustedTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  //   console.log(`timestamp-call-at:${at}`, adjustedTime);
  //   sessionStorage.setItem(`timeAt${at}`, adjustedTime);
  // }
  // startObserving() {
  //   this.startTime = Date.now(); // Ensure the start time is set when starting observation
  //   this.intervalId = setInterval(() => {
  //     this.checkAndObserveIdleTime();
  //   }, 15 * 60 * 1000); // 15 minutes
  // }
  // private checkAndObserveIdleTime() {
  //   const currentTime = Date.now();
  //   const elapsedTime = (currentTime - this.startTime) / (1000 * 60); // Convert to minutes
  //   if (elapsedTime >= 30) {
  //     this.stopObserving();
  //   } else {
  //     const at = Math.floor(elapsedTime / 15) * 15;
  //     this.observeIdleTimeOfUser(at);
  //   }
  // }
  // stopObserving() {
  //   if (this.intervalId) {
  //     clearInterval(this.intervalId);
  //     this.intervalId = null;
  //   }
  // }
  // observeIdleTimeOfUser(at: number): any {
  //   const time1 = sessionStorage.getItem(`timeAt${at}`);
  //   const time2 = sessionStorage.getItem(`timeAt${at + 15}`); // Adjust to next 15 minute interval
  //   if (time1 && time2) {
  //     const params = {
  //       lead_id: null,
  //       start_time: time1,
  //       end_time: time2,
  //     };
  //     return this.fetchLeadsActivityLogs(params);
  //   }
  //   return null;
  // }

  async getClientMac() {
    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/user/mac-address`,
      headers: {
        'Content-Type': 'application/json',
        // Authorization: token,
      },
    };
    const result = await axios(options);
    return result;
  }
  async getIP(): Promise<any> {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const jsonData = await response.json();
      // console.log(jsonData);
      return jsonData;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  updateNotificationCount(count: number) {
    this.notificationCountSource.next(count);
  }

  downloadFile(filePathOrURL: string): Observable<string> {
    let fileRef;
    if (filePathOrURL.startsWith('http')) {
      fileRef = this.storage.refFromURL(filePathOrURL);
    } else {
      fileRef = this.storage.ref(filePathOrURL);
    }
    return fileRef.getDownloadURL();
  }

  async loginUser(data: any) {
    let options = {
      method: 'POST',
      url: `${this.baseUrl}/api/user/login/v1`,
      headers: {
        'Content-Type': 'application/json',
        // Authorization: token,
      },
      data: data,
    };
    const result = await axios(options);
    return result;
  }

  async fetchModules() {
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/user/get/modules`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    };

    const result = await axios(options);
    return result.data;
  }
  newUserSignup(signupData: any) {
    const headers = {
      // Authorization: this.token,
      'Content-Type': 'application/json',
    };
    //console.log('signupDat-service', signupData);

    return this._http.post(`${this.baseUrl}/api/user/create`, signupData, {
      headers,
    });
  }

  async resetPwdUser(resetData: any) {
    // const headers = {
    //   // Authorization: this.token,
    //   'Content-Type': 'application/json',
    // };

    // return this._http.post(`${this.baseUrl}/api/user/create`, resetData, {
    //   headers,
    // });
    let options = {
      method: 'PUT',
      url: `${this.baseUrl}/api/user/reset-password`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: resetData,
    };
    const result = await axios(options);
    return result.data;
  }

  async fetchAllUsers() {
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/user/get`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    };
    const result = await axios(options);
    return result.data;
  }

  async fetchUserById(userData: any) {
    let token = sessionStorage.getItem('token');

    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/user/get`,
      params: userData,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    };
    const result = await axios(options);
    return result.data;
  }

  async fetchUserByIdForForgotPwd(userData: any) {
    let token = sessionStorage.getItem('token');

    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/user/forgot-password`,
      params: userData,
      headers: {
        'Content-Type': 'application/json',
        // Authorization: token,
      },
    };
    const result = await axios(options);
    return result.data;
  }

  async forgotPwdTokenGen(userData: any) {
    let options = {
      method: 'POST',
      url: `${this.baseUrl}/api/user/forgot-password/gen-token`,
      // params: userData,
      headers: {
        'Content-Type': 'application/json',
        // Authorization: token,
      },
      data: userData,
    };
    const result = await axios(options);
    return result.data;
  }

  async fetchRoles() {
    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/user/get/role`,
      // params: userData,
      headers: {
        'Content-Type': 'application/json',
        // Authorization: token,
      },
    };
    const result = await axios(options);
    return result.data;
  }

  async fetchActivityLogs(data: any) {
    let token = sessionStorage.getItem('token');

    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/crm/get/leads-activity-logs`,
      params: data,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    };
    const result = await axios(options);
    return result.data;
  }
  async fetchAllPrivileges() {
    // let token = sessionStorage.getItem('token');

    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/user/get/privilege`,
      headers: {
        'Content-Type': 'application/json',
        // Authorization: token,
      },
    };
    const result = await axios(options);
    return result.data;
  }

  async postNewURC(data: any) {
    let token = sessionStorage.getItem('token');

    let options = {
      method: 'POST',
      url: `${this.baseUrl}/api/user/upsert-urc`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      data: data,
    };
    const result = await axios(options);
    return result.data;
  }

  async fetchURC(data: any) {
    let token = sessionStorage.getItem('token');

    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/user/get/urc`,
      params: data,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      // data: data,
    };
    const result = await axios(options);
    return result;
  }

  async fetchCompany(params: any) {
    let token = sessionStorage.getItem('token');

    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/org/get/company`,
      params: params,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      // data: data,
    };
    const result = await axios(options);
    return result.data;
  }

  async editUser(data: any) {
    let token = sessionStorage.getItem('token');

    let options = {
      method: 'PUT',
      url: `${this.baseUrl}/api/user/edit`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      data: data,
    };
    const result = await axios(options);
    return result.data;
  }

  async uploadToProcessCSV(formData: any) {
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'POST',
      url: `${this.baseUrl}/api/stage/process-csv-file`,
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: token,
      },
      data: formData,
    };
    const result = await axios(options);
    return result.data;
  }

  async uploadToLeadStage(formData: any, params: any) {
    // //console.log(data);

    let token = sessionStorage.getItem('token');
    let options = {
      method: 'POST',
      url: `${this.baseUrl}/api/stage/upload-leads`,
      params: params,
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: token,
      },
      data: formData,
    };
    const result = await axios(options);
    return result.data;
  }

  async transferLeadsFromStage(params: any) {
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/stage/leads-upload-to-main`,
      params: params,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      // data: data,
    };
    const result = await axios(options);
    return result.data;
  }

  async fetchAllCompany() {
    let token = sessionStorage.getItem('token');

    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/org/get/allCompany`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      // data: data,
    };
    const result = await axios(options);
    return result.data;
  }

  async fetchAllCompanyType() {
    let token = sessionStorage.getItem('token');

    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/org/get/companyType`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      // data: data,
    };
    const result = await axios(options);
    return result.data;
  }

  async fetchAllContactDeptType() {
    let token = sessionStorage.getItem('token');

    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/org/get/contactDeptType`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      // data: data,
    };
    const result = await axios(options);
    return result.data;
  }

  async fetchAllLocationType() {
    let token = sessionStorage.getItem('token');

    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/org/get/locationType`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      // data: data,
    };
    const result = await axios(options);
    return result.data;
  }
  // ! today
  async fetchDispositionTypes() {
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/crm/get/disposition-types`,
      // params: params,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      // data: data,
    };
    const result = await axios(options);
    return result.data;
  }

  async fetchTaskTypes() {
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/crm/get/task-types`,
      // params: params,
      headers: {
        'Content-Type': 'application/json',
        // Authorization: token,
      },
      // data: data,
    };
    const result = await axios(options);
    return result.data;
  }

  async fetchTaskStatusTypes() {
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/crm/get/task-status-types`,
      // params: params,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      // data: data,
    };
    const result = await axios(options);
    return result.data;
  }

  async uploadTaskDocs(formData: any) {
    let token = sessionStorage.getItem('token');
    // console.log(formData)
    let options = {
      method: 'POST',
      url: `${this.baseUrl}/api/crm/upload-documents`,
      // params: params,
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: token,
      },
      data: formData,
    };
    // console.log(options)
    const result = await axios(options);
    return result;
  }

  async fetchAllTasks(taskParams: any) {
    // console.log(taskParams);
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/crm/get/tasks`,
      params: taskParams,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      // data: data,
    };
    const result = await axios(options);
    return result.data;
  }

  async fetchAllLeads(leadParams: any) {
    // console.log(leadParams)
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/crm/get/leads`,
      params: leadParams,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      // data: data,
    };
    const result = await axios(options);
    return result.data;
  }

  async fetchAllAddressType() {
    let token = sessionStorage.getItem('token');

    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/org/get/addressType`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      // data: data,
    };
    const result = await axios(options);
    return result.data;
  }
  async postNewOrgCompany(data: any) {
    let token = sessionStorage.getItem('token');

    let options = {
      method: 'POST',
      url: `${this.baseUrl}/api/org/post/company`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      data: data,
    };
    const result = await axios(options);
    return result.data;
  }

  async postNewOrgContact(data: any) {
    let token = sessionStorage.getItem('token');

    let options = {
      method: 'POST',
      url: `${this.baseUrl}/api/org/post/contact`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      data: data,
    };
    const result = await axios(options);
    return result.data;
  }

  async postNewOrgLocation(data: any) {
    let token = sessionStorage.getItem('token');

    let options = {
      method: 'POST',
      url: `${this.baseUrl}/api/org/post/location`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      data: data,
    };
    const result = await axios(options);
    return result.data;
  }

  async fetchContactByCompanyId(params: any) {
    let token = sessionStorage.getItem('token');

    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/org/get/contactById`,
      params: params,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      // data: data,
    };
    const result = await axios(options);
    return result.data;
  }

  async fetchLocationByCompanyId(params: any) {
    let token = sessionStorage.getItem('token');

    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/org/get/locationById`,
      params: params,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      // data: data,
    };
    const result = await axios(options);
    return result.data;
  }

  async putOrgCompany(data: any) {
    let token = sessionStorage.getItem('token');

    let options = {
      method: 'PUT',
      url: `${this.baseUrl}/api/org/put/company`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      data: data,
    };
    const result = await axios(options);
    return result.data;
  }

  async putOrgContact(data: any) {
    let token = sessionStorage.getItem('token');

    let options = {
      method: 'PUT',
      url: `${this.baseUrl}/api/org/put/contact`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      data: data,
    };
    const result = await axios(options);
    return result.data;
  }

  async putOrgLocation(data: any) {
    let token = sessionStorage.getItem('token');

    let options = {
      method: 'PUT',
      url: `${this.baseUrl}/api/org/put/location`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      data: data,
    };
    const result = await axios(options);
    return result.data;
  }

  async postNewTask(data: any) {
    let token = sessionStorage.getItem('token');

    let options = {
      method: 'POST',
      url: `${this.baseUrl}/api/crm/create/tasks`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      data: data,
    };
    const result = await axios(options);
    return result.data;
  }

  async getDocumentsFromBucket() {
    let token = sessionStorage.getItem('token');

    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/crm/get/docs`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      // data: data,
    };
    const result = await axios(options);
    return result.data;
  }

  async editTaskByTaskId(editTaskParams: any) {
    let token = sessionStorage.getItem('token');

    let options = {
      method: 'PUT',
      url: `${this.baseUrl}/api/crm/put/task-by-id`,
      // params:editTaskParams,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      data: editTaskParams,
    };
    const result = await axios(options);
    return result.data;
  }

  async fetchAllNotes(notesParam: any) {
    let token = sessionStorage.getItem('token');

    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/crm/get/notes`,
      params: notesParam,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    };
    const result = await axios(options);
    return result.data;
  }
  async createNewNote(notesData: any) {
    let token = sessionStorage.getItem('token');

    let options = {
      method: 'POST',
      url: `${this.baseUrl}/api/crm/create/note`,
      // params: notesParam,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      data: notesData,
    };
    const result = await axios(options);
    return result.data;
  }

  async editNoteByNoteId(editNoteParam: any) {
    let token = sessionStorage.getItem('token');

    let options = {
      method: 'PUT',
      url: `${this.baseUrl}/api/crm/put/note`,
      params: editNoteParam,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      // data: editNoteParam,
    };
    const result = await axios(options);
    return result.data;
  }

  async fetchLeadsBySearchParams(params: any) {
    let token = sessionStorage.getItem('token');

    // Extract lead_id_list from params and keep other parameters as query params
    const { lead_id_list, ...queryParams } = params;

    // Prepare request body - only include lead_id_list if it's not null/empty
    const requestBody: any = {};
    if (lead_id_list && lead_id_list !== '' && lead_id_list !== '0') {
      requestBody.lead_id_list = lead_id_list;
    }

    let options = {
      method: 'POST',
      url: `${this.baseUrl}/api/crm/get/leadsBySearchParams`,
      params: queryParams, // Other parameters as query params
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      data: requestBody, // lead_id_list in request body (only if valid)
    };
    const result = await axios(options);
    return result.data;
  }

  async updateLeads(editLeadParams: any) {
    let token = sessionStorage.getItem('token');

    let options = {
      method: 'PUT',
      url: `${this.baseUrl}/api/crm/update/lead`,
      // params:editTaskParams,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      data: editLeadParams,
    };
    const result = await axios(options);
    return result.data;
  }

  async postUserCompany(comp: any) {
    let token = sessionStorage.getItem('token');

    let options = {
      method: 'POST',
      url: `${this.baseUrl}/api/user/post/user-company`,
      // params:editTaskParams,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      data: comp,
    };
    const result = await axios(options);
    return result.data;
  }

  async editUserCompany(comp: any) {
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'PUT',
      url: `${this.baseUrl}/api/user/put/user-company`,
      // params:editTaskParams,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      data: comp,
    };
    const result = await axios(options);
    return result.data;
  }
  async fectchUserCompany(params: any) {
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/user/get/user-company`,
      params: params,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      // data: data,
    };
    const result = await axios(options);
    return result.data;
  }

  async fetchLeadsActivityLogs(params: any) {
    let token = sessionStorage.getItem('token');

    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/crm/get/leads-activity-logs`,
      params: params,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      // data: data,
    };
    const result = await axios(options);
    return result.data;
  }

  async fetchInactiveUsers(params: any) {
    let token = sessionStorage.getItem('token');

    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/crm/get/inactive-users`,
      params: params,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      // data: data,
    };
    const result = await axios(options);
    return result.data;
  }

  async fetchAllLeadStatusTypes(leadStatusTypeParams: any) {
    let token = sessionStorage.getItem('token');

    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/crm/get/lead-status-type`,
      params: leadStatusTypeParams,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      // data: data,
    };
    const result = await axios(options);
    return result.data;
  }

  async fetchAllNotifications(params: any) {
    let token = sessionStorage.getItem('token');

    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/user/get/notifications`,
      params: params,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      // data: data,
    };
    const result = await axios(options);
    return result.data;
  }

  async fetchAllNotificationsType() {
    let token = sessionStorage.getItem('token');

    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/user/get/notif-type`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      // data: data,
    };
    const result = await axios(options);
    return result.data;
  }

  async editNotification(payload: any) {
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'PUT',
      url: `${this.baseUrl}/api/user/edit/notifications`,
      // params:editTaskParams,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      data: payload,
    };
    const result = await axios(options);
    return result.data;
  }

  async postNewUserNotification(payload: any) {
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'POST',
      url: `${this.baseUrl}/api/user/create/notifications`,
      // params:editTaskParams,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      data: payload,
    };
    const result = await axios(options);
    return result.data;
  }

  async fetchTicketStatusType(params: any) {
    let token = sessionStorage.getItem('token');

    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/user/get/ticket-status-type`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      // data: data,
    };
    const result = await axios(options);
    return result.data;
  }

  async fetchTicketIssueCategory(params: any) {
    let token = sessionStorage.getItem('token');

    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/user/get/ticket-issue-cateogry`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      // data: data,
    };
    const result = await axios(options);
    return result.data;
  }

  async postNewTicket(payload: any) {
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'POST',
      url: `${this.baseUrl}/api/user/post/new-ticket`,
      // params:editTaskParams,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      data: payload,
    };
    const result = await axios(options);
    return result.data;
  }

  async fetchAllTickets(params: any) {
    let token = sessionStorage.getItem('token');

    let options = {
      method: 'GET',
      params: params,
      url: `${this.baseUrl}/api/user/get/all-tickets`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      // data: data,
    };
    const result = await axios(options);
    return result.data;
  }

  async editTicket(payload: any) {
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'PUT',
      url: `${this.baseUrl}/api/user/put/ticket`,
      // params:editTaskParams,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      data: payload,
    };
    const result = await axios(options);
    return result.data;
  }

  async fetchAllComments(params: any) {
    let token = sessionStorage.getItem('token');

    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/user/get/comments`,
      params: params,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      // data: data,
    };
    const result = await axios(options);
    return result.data;
  }

  async postNewComment(payload: any) {
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'POST',
      url: `${this.baseUrl}/api/user/post/comment`,
      // params:editTaskParams,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      data: payload,
    };
    const result = await axios(options);
    return result.data;
  }
  async editComment(payload: any) {
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'PUT',
      url: `${this.baseUrl}/api/user/put/comment`,
      // params:editTaskParams,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      data: payload,
    };
    const result = await axios(options);
    return result.data;
  }
  async sendEmail(emailBodyPayload: any) {
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'POST',
      url: `${this.baseUrl}/api/send/email`,
      // params:editTaskParams,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      data: emailBodyPayload,
    };
    const result = await axios(options);
    return result.data;
  }

  async sendForgotPwdEmail(emailBodyPayload: any) {
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'POST',
      url: `${this.baseUrl}/api/send/forgot-pwd-email`,
      // params:editTaskParams,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      data: emailBodyPayload,
    };
    const result = await axios(options);
    return result.data;
  }

  async fetchAllDispositionCode(params: any) {
    let token = sessionStorage.getItem('token');

    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/crm/get/disposition-code`,
      params: params,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    };
    const result = await axios(options);
    return result.data;
  }

  async postDispositionCode(payload: any) {
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'POST',
      url: `${this.baseUrl}/api/crm/post/disposition-code`,
      // params:editTaskParams,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      data: payload,
    };
    const result = await axios(options);
    return result.data;
  }

  async editDispositionCode(payload: any) {
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'PUT',
      url: `${this.baseUrl}/api/crm/put/disposition-code`,
      // params:editTaskParams,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      data: payload,
    };
    const result = await axios(options);
    return result.data;
  }

  async fetchDashboardCounts(params: any) {
    let token = sessionStorage.getItem('token');

    // Log the params for debugging
    console.log('Dashboard counts params:', params);

    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/crm/get/dashboard-counts`,
      params: params,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    };
    const result = await axios(options);
    return result.data;
  }

  private getFirstDayOfMonth(): string {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1)
      .toISOString()
      .split('T')[0];
  }

  private getLastDayOfMonth(): string {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth() + 1, 0)
      .toISOString()
      .split('T')[0];
  }

  async fetchTargetCounts(params: any) {
    let token = sessionStorage.getItem('token');
    // console.log(params);
    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/crm/get/target-stats`,
      params: params,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    };
    const result = await axios(options);
    return result.data;
  }

  async fetchSQParamType(params: any) {
    let token = sessionStorage.getItem('token');

    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/crm/get/sq-params-type`,
      params: params,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    };

    const result = await axios(options);
    return result.data;
  }

  async postSQCheckScores(payload: any) {
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'POST',
      url: `${this.baseUrl}/api/crm/post/sq-check`,
      // params:editTaskParams,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      data: payload,
    };
    const result = await axios(options);
    return result.data;
  }

  async postPaymentLedgerEntry(payload: any) {
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'POST',
      url: `${this.baseUrl}/api/crm/post/payment-ledger-entry`,
      // params:editTaskParams,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      data: payload,
    };
    const result = await axios(options);
    return result.data;
  }

  async fetchLeadsPaymentLedger(params: any) {
    let token = sessionStorage.getItem('token');

    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/crm/get/leads-payment-ledger`,
      params: params,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    };

    const result = await axios(options);
    return result.data;
  }

  async editPaymentLedgerEntry(payload: any) {
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'PUT',
      url: `${this.baseUrl}/api/crm/put/leads-payment-ledger`,
      // params:editTaskParams,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      data: payload,
    };
    const result = await axios(options);
    return result.data;
  }

  async fetchLeadContacts(params: any) {
    let token = sessionStorage.getItem('token');

    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/crm/get/lead-contact`,
      params: params,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    };

    const result = await axios(options);
    return result.data;
  }

  async postNewContact(payload: any) {
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'POST',
      url: `${this.baseUrl}/api/crm/post/new-contact`,
      // params:editTaskParams,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      data: payload,
    };
    const result = await axios(options);
    return result.data;
  }

  async fetchLeadAddress(params: any) {
    let token = sessionStorage.getItem('token');

    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/crm/get/lead-address`,
      params: params,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    };

    const result = await axios(options);
    return result.data;
  }

  async postNewAddress(payload: any) {
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'POST',
      url: `${this.baseUrl}/api/crm/post/new-address`,
      // params:editTaskParams,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      data: payload,
    };
    const result = await axios(options);
    return result.data;
  }

  async getSQCheckScores(params: any) {
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/crm/get/sq-check`,
      params: params,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      // data: payload,
    };
    const result = await axios(options);
    return result.data;
  }

  async getVisaCheckByLead(params: any) {
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/crm/get/visa-check`,
      params: params,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      // data: payload,
    };
    const result = await axios(options);
    return result.data;
  }

  async getMOLCheckByLead(params: any) {
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/crm/get/mol-check`,
      params: params,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      // data: payload,
    };
    const result = await axios(options);
    return result.data;
  }

  async postNewVisaCheck(payload: any) {
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'POST',
      url: `${this.baseUrl}/api/crm/post/new-visa-check`,
      // params:editTaskParams,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      data: payload,
    };
    const result = await axios(options);
    return result.data;
  }

  async postNewMOLCheck(payload: any) {
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'POST',
      url: `${this.baseUrl}/api/crm/post/new-mol-check`,
      // params:editTaskParams,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      data: payload,
    };
    const result = await axios(options);
    return result.data;
  }

  async fetchWebTracingDetails(params: any) {
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/crm/get/web-tracing`,
      params: params,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      // data: payload,
    };
    const result = await axios(options);
    return result.data;
  }

  async fetchTracingSourceType(params: any) {
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/crm/get/tracing-source-type`,
      params: params,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      // data: payload,
    };
    const result = await axios(options);
    return result.data;
  }

  async postNewWebTracing(payload: any) {
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'POST',
      url: `${this.baseUrl}/api/crm/post/web-tracing`,
      // params:editTaskParams,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      data: payload,
    };
    const result = await axios(options);
    return result.data;
  }

  async fetchTracingDetails(params: any) {
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/crm/get/tracing-details`,
      params: params,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      // data: payload,
    };
    const result = await axios(options);
    return result.data;
  }
  async postNewTracing(payload: any) {
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'POST',
      url: `${this.baseUrl}/api/crm/post/tracing-details`,
      // params:editTaskParams,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      data: payload,
    };
    const result = await axios(options);
    return result.data;
  }

  async postNewTarget(payload: any) {
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'POST',
      url: `${this.baseUrl}/api/crm/post/new-target`,
      // params:editTaskParams,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      data: payload,
    };
    const result = await axios(options);
    return result.data;
  }
  async fetchTargets(params: any) {
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/crm/get/targets`,
      params: params,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      // data: payload,
    };
    const result = await axios(options);
    return result.data;
  }
  async editTargets(payload: any) {
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'PUT',
      url: `${this.baseUrl}/api/crm/put/target`,
      // params:editTaskParams,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      data: payload,
    };
    const result = await axios(options);
    return result.data;
  }

  //! REPORTS API's

  async dailyReports(params: any) {
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/reports/get/daily-reports`,
      params: params,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      // data: payload,
    };
    const result = await axios(options);
    return result.data;
  }

  async contactableNonContactableReports(params: any) {
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/reports/get/daily-reports`,
      params: params,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      // data: payload,
    };
    const result = await axios(options);
    return result.data;
  }
  async fetchTargetStats(params: any) {
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/crm/get/target-stats`,
      params: params,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    };
    const result = await axios(options);
    return result.data;
  }
  async fetchAllFailedLeads(leadParams: any) {
    // console.log(leadParams)
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/stage/get-failed-records`,
      params: leadParams,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      // data: data,
    };
    const result = await axios(options);
    return result.data;
  }
  async fetchAllAssociatedAgents(params: any) {
    // console.log(leadParams)
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/user/get/associated-users`,
      params: params,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      // data: data,
    };
    const result = await axios(options);
    return result.data;
  }

  async checkEnteriesByTaskId(params: any) {
    // console.log(leadParams)
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/crm/validate-entries-by-task-id`,
      params: params,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      // data: data,
    };
    const result = await axios(options);
    return result.data;
  }
  async uploadAccountFile(formData: FormData): Promise<any> {
    const url = `${this.baseUrl}/api/account/upload`;
    try {
      const response = await axios.post(url, formData, {
        headers: {
          // Do NOT set Content-Type here!
          Accept: 'application/json',
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || 'Upload failed'
      );
    }
  }

  getAccountFiles(params: any): Observable<any> {
    const token = sessionStorage.getItem('token') || '';
    return this._http.get(`${this.baseUrl}/api/account/files`, {
      params: params,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    });
  }

  downloadAccountFile(fileName: string): Observable<any> {
    const token = sessionStorage.getItem('token') || '';
    return this._http.get(`${this.baseUrl}/api/account/download/${fileName}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    });
  }

  async getTodaysTasks(params: any) {
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/crm/get/todays-tasks`,
      params: params,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    };
    const result = await axios(options);
    return result.data;
  }

  async getEscalationTasks(params: any) {
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/crm/get/escalation-tasks`,
      params: params,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    };
    const result = await axios(options);
    return result.data;
  }

  async getTasksCount(filter: any) {
    const params: any = {};
    const userDetails = sessionStorage.getItem('userDetails');
    const user = userDetails ? JSON.parse(userDetails) : {};

    // Set the current user's ID
    if (user.user_id) params.app_user_id = user.user_id;

    // Add other filters
    if (filter.bank) params.company_id = filter.bank;
    if (filter.taskTypeId) params.task_type_id = filter.taskTypeId;

    let token = sessionStorage.getItem('token');
    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/crm/get/tasks-count`,
      params: params,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    };
    const result = await axios(options);
    return result.data;
  }

  async getAssociatedUsers() {
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/crm/get/associated-users`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    };
    const result = await axios(options);
    return result.data;
  }

  async getITManagerDetails() {
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/user/get/it-manager`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    };
    const result = await axios(options);
    return result.data;
  }

  async getAccountEmiratesIds(params: any) {
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/crm/get/account-emirates-ids`,
      params: params,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    };
    const result = await axios(options);
    return result.data;
  }

  async addEmiratesIdToAccount(payload: any) {
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'POST',
      url: `${this.baseUrl}/api/crm/add/emirates-id`,
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    };
    const result = await axios(options);
    return result.data;
  }

  async getFailedEntriesCountOnStage(param: any) {
    let token = sessionStorage.getItem('token');
    let options = {
      method: 'GET',
      url: `${this.baseUrl}/api/stage/getFailedEntriesCount`,
      params: param,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    };
    const result = await axios(options);
    return result.data;
  }
}
