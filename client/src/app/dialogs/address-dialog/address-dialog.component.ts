import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
  MatSnackBar,
} from '@angular/material/snack-bar';
import { SunshineInternalService } from 'src/app/sunshine-services/sunshine-internal.service';

@Component({
  selector: 'app-address-dialog',
  templateUrl: './address-dialog.component.html',
  styleUrls: ['./address-dialog.component.css'],
})
export class AddressDialogComponent implements OnInit {
  showProgressBar: boolean = false;
  dialogTitle: string = '';
  dialogText: string = '';
  dialogData: any = {};
  addressForm: any;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  durationInSeconds: number = 5;
  contactMode: Array<string> = ['GAS CHECK', 'BLO CHECK', 'WEB TRACE', 'BSNL'];

  addressType: Array<string> = ['RESIDENTIAL', 'OFFICE', 'TRACED ADDRESS'];
  residenceType: Array<string> = ['OWN HOUSE', 'RENTED HOUSE'];
  livingStatusType: Array<string> = ['WELL SETTLED', 'AVERAGE', 'POOR'];
  WIDTH = 640;
  HEIGHT = 480;

  @ViewChild('video')
  public video!: ElementRef;

  @ViewChild('canvas')
  public canvas!: ElementRef;
  // @ViewChild('video', { static: true }) video!: ElementRef<HTMLVideoElement>;
  // @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;

  captures: string[] = [];
  error: any;
  isCaptured: boolean = false;
  file!: File;
  cameraOpened: boolean = false;
  mediaStream: MediaStream | null = null;
  constructor(
    public dialogRef: MatDialogRef<AddressDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _sunshineAPI: SunshineInternalService,
    private _snackBar: MatSnackBar
  ) {
    this.addressForm = new FormGroup({
      app_user_id: new FormControl(null, [Validators.required]),
      lead_id: new FormControl(null, [Validators.required]),
      task_id: new FormControl(null),
      contact_mode_list: new FormControl(null, [Validators.required]),
      address_name: new FormControl(null),
      address_line_1: new FormControl(null),
      address_line_2: new FormControl(null),
      address_line_3: new FormControl(null),
      city: new FormControl(null),
      state: new FormControl(null),
      country: new FormControl(null),
      zipcode: new FormControl(null),
      address_type: new FormControl(null),
      residence_type: new FormControl(null),
      living_status: new FormControl(null),
      photo: new FormControl(null),
      current_location: new FormControl(null),
      is_primary: new FormControl(null),
    });
  }

  ngOnInit(): void {
    this.receiveInjectedData();
  }
  //! web-cam image capture with compression logic
  // async setupDevices() {
  //   if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  //     try {
  //       const stream = await navigator.mediaDevices.getUserMedia({
  //         video: true,
  //       });

  //       if (stream) {
  //         this.video.nativeElement.srcObject = stream;
  //         this.video.nativeElement.play();
  //         this.error = null;
  //       } else {
  //         this.error = 'Camera not found to capture photo.';
  //       }
  //     } catch (e) {
  //       this.error = e;
  //     }
  //   }
  // }

  async setupDevices() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (this.mediaStream) {
          this.video.nativeElement.srcObject = this.mediaStream;
          this.video.nativeElement.play();
          this.error = null;
          this.cameraOpened = true;
        } else {
          this.error = 'Camera not found to capture photo.';
        }
      } catch (e) {
        this.error = e;
      }
    }
  }

  stopDevices() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.video.nativeElement.srcObject = null;
      this.cameraOpened = false;
    }
  }

  toggleCamera() {
    if (this.cameraOpened) {
      this.stopDevices();
    } else {
      this.setupDevices();
    }
  }

  capture() {
    this.drawImageToCanvas(this.video.nativeElement);
    this.captures.push(this.canvas.nativeElement.toDataURL('image/png'));
    // console.log('captured-image:::::>>>', this.captures);
    this.isCaptured = true;
  }

  removeCurrent() {
    console.log('captured-image-another:::::>>>', this.captures);
    this.isCaptured = false;
  }

  setPhoto(idx: number) {
    this.isCaptured = true;
    var image = new Image();
    image.src = this.captures[idx];
    this.drawImageToCanvas(image);
  }

  drawImageToCanvas(image: any) {
    this.canvas.nativeElement
      .getContext('2d')
      .drawImage(image, 0, 0, this.WIDTH, this.HEIGHT);
  }

  async compressImage(imageDataUrl: string, quality: number): Promise<string> {
    return new Promise((resolve) => {
      const image = new Image();
      image.src = imageDataUrl;
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = this.WIDTH; // Adjust as needed
        canvas.height = this.HEIGHT; // Adjust as needed
        const ctx: any = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
    });
  }

  async uploadFileToBucket() {
    this.showProgressBar = true;
    this.openSnackBar('Compressing photo before uploading');
    let construtedFilename = this.addressForm.value.lead_id;
    console.log(construtedFilename);
    const fileName = `${construtedFilename}.jpeg`;
    const mimeType = 'image/jpeg';
    const compressedImageDataUrl = await this.compressImage(
      this.captures[0],
      0.8
    ); // Adjust quality as needed
    const file = this.dataURLToFile(compressedImageDataUrl, fileName, mimeType);
    let fd = new FormData();
    fd.append('files', file);
    console.log('fd:::', fd);

    if (fd) {
      this._sunshineAPI
        .uploadTaskDocs(fd)
        .then((res: any) => {
          let resData = res.data;
          console.log('customer-photo-mediaLink:::', resData);
          const mediaLink = resData.data.files[0].mediaLink;

          this.addressForm.patchValue({
            photo: mediaLink,
          });

          this.openSnackBar(resData.msg);
          this.stopDevices();
          this.showProgressBar = false;
        })
        .catch((error) => {
          this.openSnackBar(error);
          this.showProgressBar = false;
          console.error('customer-photo-upload-server-err:::', error);
        });
    }
  }

  dataURLToFile(dataUrl: string, filename: string, mimeType: string): File {
    const arr = dataUrl.split(',');
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mimeType });
  }
  receiveInjectedData() {
    this.dialogTitle = this.data.dialogTitle;
    this.dialogData = this.data.dialogData;
    console.log(this.dialogData);
    
    // Reset form completely - no pre-populated data
    this.addressForm.reset();
    
    // Only set the required lead_id and app_user_id from the injected data
    if (this.dialogData != undefined) {
      this.addressForm.patchValue({
        lead_id: this.dialogData.lead_id,
        app_user_id: this.dialogData.app_user_id,
        task_id: this.dialogData.task_id
      });
    }
  }

  // Method to check if mandatory fields are filled
  areMandatoryFieldsFilled(): boolean {
    // First check if Source of Address is selected (mandatory)
    const sourceOfAddress = this.addressForm.get('contact_mode_list')?.value;
    if (!sourceOfAddress || sourceOfAddress === null || sourceOfAddress === '') {
      return false;
    }
    
    // Then check if at least one other field is filled
    const otherFields = [
      'city',
      'state', 
      'country',
      'zipcode',
      'address_name',
      'address_line_1',
      'address_line_2',
      'address_line_3',
      'address_type',
      'residence_type',
      'living_status',
      'current_location'
    ];
    
    // Check if at least one other field has a value
    return otherFields.some(field => {
      const value = this.addressForm.get(field)?.value;
      return value !== null && value !== undefined && value !== '';
    });
  }
  selectContactMode(event: any) {
    let contactMode = event.value;
    console.log(contactMode);
    this.addressForm.patchValue({
      contact_mode_list: contactMode,
    });
    // if (contactMode) {
    //   this.hideContactAddress = true;
    // } else {
    //   this.hideContactAddress = false;
    // }
    // // console.log(event.value);
    // this.newTaskObj.mode_of_contact = contactMode;
    // this.editTaskObj.mode_of_contact = contactMode;
    // this.createTaskEmailNotif.mode_of_contact = contactMode;
    // this.selectedContactMode = contactMode;
  }
  saveAddress() {
    console.log('save-contact::', this.addressForm.value);
    this.showProgressBar = true;

    this._sunshineAPI
      .postNewAddress(this.addressForm.value)
      .then((res: any) => {
        console.log('NEW-ADDRESS-RES::>>', res);
        this.showProgressBar = false;
        this.openSnackBar(res.message);
        this.dialogRef.close({
          create: 1,
          // leadId: this.leadId,
        });
      })
      .catch((error) => {
        console.error(error);
        this.showProgressBar = false;
        this.openSnackBar(error.response.data.message);
        this.dialogRef.close({
          create: 0,
        });
      });
  }

  cancelAddress() {
    this.dialogRef.close({
      cancel: 1,
    });
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, 'Okay', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds * 1000,
    });
    // this._snackBar.open(message);
  }
}
