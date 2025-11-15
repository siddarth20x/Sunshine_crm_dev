import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CountriesService, Country } from '../../services/countries.service';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { SunshineInternalService } from 'src/app/sunshine-services/sunshine-internal.service';

@Component({
  selector: 'app-contact-dialog',
  templateUrl: './contact-dialog.component.html',
  styleUrls: ['./contact-dialog.component.css'],
})
export class ContactDialogComponent implements OnInit {
  showProgressBar: boolean = false;
  dialogTitle: string = '';
  dialogText: string = '';
  dialogData: any = {};
  contactsForm: any;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  contactMode: Array<string> = [
    'CALL',
    'MESSAGE',
    'EMAIL',
    'VISIT',
    'GAS CHECK',
    'BLO CHECK',
    'POST OFFICE CHECK',
  ];
  durationInSeconds: number = 5;
  relationshipArr: Array<string> = [
    'FAMILY',
    'FRIENDS',
    'COMPANY',
    'NEIGHBOUR',
  ];
  empStatusArr: Array<string> = ['EMPLOYED', 'UNEMPLOYED'];
  empTypeArr: Array<string> = ['SALARIED', 'BUSINESS'];
  WIDTH = 640;
  HEIGHT = 480;
  
  // Add properties for required fields
  requiredFields: string[] = [];
  selectedModeOfContact: string = '';
  
  // Country and phone formatting properties
  countries: Country[] = [];
  selectedCountry: Country | null = null;
  phonePattern: string = '';

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
    public dialogRef: MatDialogRef<ContactDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _sunshineAPI: SunshineInternalService,
    private _snackBar: MatSnackBar,
    private countriesService: CountriesService
  ) {
    this.contactsForm = new FormGroup({
      app_user_id: new FormControl(null, [Validators.required]),
      lead_id: new FormControl(null, [Validators.required]),
      task_id: new FormControl(null),
      contact_mode_list: new FormControl(null),
      // customer_name: new FormControl(null, [Validators.required]),
      email: new FormControl(null),
      phone: new FormControl(null, [Validators.required]),
      phone_ext: new FormControl(null, [Validators.required]),
      alternate_phone: new FormControl(null),
      contact_name: new FormControl(null),
      relationship: new FormControl(null),
      contact_name_ph_no: new FormControl(null),
      employment_status: new FormControl(null),
      employment_type: new FormControl(null),
      photo: new FormControl(null),
      is_primary: new FormControl(null),
    });
  }

  ngOnInit(): void {
    this.loadCountries();
    this.receiveInjectedData();
  }
  
  // Load countries from service
  loadCountries() {
    this.countriesService.loadCountries().subscribe({
      next: (countries) => {
        this.countries = countries;
        console.log('Countries loaded:', countries);
      },
      error: (error) => {
        console.error('Error loading countries:', error);
        // Fallback to hardcoded data if CSV fails
        this.initializeFallbackCountries();
      }
    });
  }
  
  // Fallback countries data if CSV loading fails
  initializeFallbackCountries() {
    this.countries = [
      { name: 'United Arab Emirates', code: 'AE', phoneCode: '+971', pattern: '^[0-9]{9}$', placeholder: '501234567' },
      { name: 'India', code: 'IN', phoneCode: '+91', pattern: '^[0-9]{10}$', placeholder: '9876543210' },
      { name: 'Pakistan', code: 'PK', phoneCode: '+92', pattern: '^[0-9]{10}$', placeholder: '3001234567' },
      { name: 'Bangladesh', code: 'BD', phoneCode: '+880', pattern: '^[0-9]{10}$', placeholder: '1712345678' },
      { name: 'Sri Lanka', code: 'LK', phoneCode: '+94', pattern: '^[0-9]{9}$', placeholder: '771234567' },
      { name: 'Nepal', code: 'NP', phoneCode: '+977', pattern: '^[0-9]{10}$', placeholder: '9841234567' },
      { name: 'Philippines', code: 'PH', phoneCode: '+63', pattern: '^[0-9]{10}$', placeholder: '9171234567' },
      { name: 'Egypt', code: 'EG', phoneCode: '+20', pattern: '^[0-9]{10}$', placeholder: '1012345678' },
      { name: 'Jordan', code: 'JO', phoneCode: '+962', pattern: '^[0-9]{8}$', placeholder: '77123456' },
      { name: 'Lebanon', code: 'LB', phoneCode: '+961', pattern: '^[0-9]{8}$', placeholder: '71123456' },
      { name: 'Saudi Arabia', code: 'SA', phoneCode: '+966', pattern: '^[0-9]{9}$', placeholder: '501234567' },
      { name: 'Kuwait', code: 'KW', phoneCode: '+965', pattern: '^[0-9]{8}$', placeholder: '90012345' },
      { name: 'Qatar', code: 'QA', phoneCode: '+974', pattern: '^[0-9]{8}$', placeholder: '30012345' },
      { name: 'Bahrain', code: 'BH', phoneCode: '+973', pattern: '^[0-9]{8}$', placeholder: '30012345' },
      { name: 'Oman', code: 'OM', phoneCode: '+968', pattern: '^[0-9]{8}$', placeholder: '90012345' },
      { name: 'Australia', code: 'AU', phoneCode: '+61', pattern: '^[23478][0-9]{8}$', placeholder: '412345678' },
      { name: 'United Kingdom', code: 'GB', phoneCode: '+44', pattern: '^[0-9]{10}$', placeholder: '7123456789' }
    ];
  }
  // async ngAfterViewInit() {
  //   // await this.setupDevices();
  // }

  //! Web-cam photo capture WIP
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
  // capture() {
  //   this.drawImageToCanvas(this.video.nativeElement);
  //   this.captures.push(this.canvas.nativeElement.toDataURL('image/png'));
  //   console.log('captured-image:::::>>>', this.captures);
  //   this.isCaptured = true;
  // }
  // removeCurrent() {
  //   console.log('captured-image-another:::::>>>', this.captures);
  //   this.isCaptured = false;
  // }
  // setPhoto(idx: number) {
  //   this.isCaptured = true;
  //   var image = new Image();
  //   image.src = this.captures[idx];
  //   this.drawImageToCanvas(image);
  // }
  // drawImageToCanvas(image: any) {
  //   this.canvas.nativeElement
  //     .getContext('2d')
  //     .drawImage(image, 0, 0, this.WIDTH, this.HEIGHT);
  //   // console.log('canvas:::',this.canvas)
  // }
  // uploadFileToBucket() {
  //   this.showProgressBar = true;
  //   // event?.preventDefault();
  //   //// // console.log(this.file);
  //   const fileName = 'image.png';
  //   const mimeType = 'image/png';
  //   const file = new File([this.captures[0]], fileName, { type: mimeType });
  //   let fd: any = new FormData();
  //   fd.append('files', file);
  //   console.log('fd:::', fd);
  //   if (fd) {
  //     this._sunshineAPI
  //       .uploadTaskDocs(fd)
  //       .then((res: any) => {
  //         let resData = res.data;
  //         console.log('customer-photo-mediaLink:::', resData);
  //         const mediaLink = resData.data.files[0].mediaLink;

  //         this.contactsForm.patchValue({
  //           photo: mediaLink,
  //         });
  //         // console.log('newTask_obj:;;medialLink::', this.newTaskObj);
  //         // // console.log(`edit-task-obj-document_url::`, this.editTaskObj);

  //         this.openSnackBar(resData.msg);
  //         // this.docUrlDisable = false;
  //         // this.docUploadDisable = true;
  //         this.showProgressBar = false;
  //       })
  //       .catch((error) => {
  //         this.openSnackBar(error);
  //         this.showProgressBar = false;
  //         console.error('customer-photo-upoad-server-err:::', error);
  //       });
  //   }
  // }

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
          // this.contactsForm.controls['photo'].setValidators([
          //   Validators.required,
          // ]);
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
      // this.contactsForm.controls['photo'].clearValidators();
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
    let construtedFilename =
      this.contactsForm.value.contact_name == null
        ? this.contactsForm.value.lead_id
        : this.contactsForm.value.contact_name;
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

          this.contactsForm.patchValue({
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
    
    // Set required fields and mode of contact from parent dialog first
    if (this.dialogData != undefined) {
      this.requiredFields = this.dialogData.required_fields || [];
      this.selectedModeOfContact = this.dialogData.contact_mode_list || '';
      // Apply dynamic validation based on required fields from parent
      this.applyDynamicValidation();
      
      // Then reset form and set values
      this.contactsForm.reset();
      this.contactsForm.patchValue({
        lead_id: this.dialogData.lead_id,
        app_user_id: this.dialogData.app_user_id,
        task_id: this.dialogData.task_id,
        contact_mode_list: this.dialogData.contact_mode_list
      });

      // Handle existing contact data if available
      if (this.dialogData.email || this.dialogData.phone || this.dialogData.phone_ext || this.dialogData.alternate_phone) {
        this.contactsForm.patchValue({
          email: this.dialogData.email,
          phone: this.dialogData.phone,
          alternate_phone: this.dialogData.alternate_phone
        });

        // If there's existing phone_ext data, find and set the corresponding country
        if (this.dialogData.phone_ext && this.countries.length > 0) {
          const existingCountry = this.countries.find(country => country.phoneCode === this.dialogData.phone_ext);
          if (existingCountry) {
            this.selectedCountry = existingCountry;
            this.phonePattern = existingCountry.pattern;
            this.contactsForm.patchValue({
              phone_ext: existingCountry
            });
            this.updatePhoneValidation();
          }
        }
      }
    } else {
      // If no dialog data, reset form and clear required fields
      this.contactsForm.reset();
      this.requiredFields = [];
      this.selectedModeOfContact = '';
    }
  }

  // Method to apply dynamic validation based on required fields
  applyDynamicValidation() {
    // Clear validators for email and alternate_phone only
    this.contactsForm.get('email')?.clearValidators();
    this.contactsForm.get('alternate_phone')?.clearValidators();
    
    // Phone and phone_ext are always required, so set their validators
    this.contactsForm.get('phone')?.setValidators([Validators.required]);
    this.contactsForm.get('phone_ext')?.setValidators([Validators.required]);
    
    // Map required fields to actual form fields
    const fieldMapping: { [key: string]: string[] } = {
      'email': ['email'],
      'phone': ['phone_ext', 'phone'], // phone_ext is now country selection, alternate_phone is optional
      'contact': ['phone_ext', 'phone'] // contact means phone details, alternate_phone is optional
    };
    
    // Apply validators based on required fields
    this.requiredFields.forEach(requiredField => {
      const formFields = fieldMapping[requiredField] || [requiredField];
      
      formFields.forEach(field => {
        if (field === 'email') {
          this.contactsForm.get(field)?.setValidators([Validators.required, Validators.email]);
        } else if (field === 'phone_ext') {
          // Country selection is always required (already set above)
          this.contactsForm.get(field)?.setValidators([Validators.required]);
        } else if (field === 'phone') {
          // Phone is always required (already set above)
          this.contactsForm.get(field)?.setValidators([Validators.required]);
        }
      });
    });
    
    // Update form validation
    this.contactsForm.get('email')?.updateValueAndValidity();
    this.contactsForm.get('phone')?.updateValueAndValidity();
    this.contactsForm.get('phone_ext')?.updateValueAndValidity();
    this.contactsForm.get('alternate_phone')?.updateValueAndValidity();
  }

  // Method to check if mandatory fields are filled based on required fields
  areMandatoryFieldsFilled(): boolean {
    // Phone fields are always mandatory
    const phoneExtValue = this.contactsForm.get('phone_ext')?.value;
    const phoneValue = this.contactsForm.get('phone')?.value;
    
    const phoneExtFilled = phoneExtValue !== null && phoneExtValue !== undefined && typeof phoneExtValue === 'object' && phoneExtValue.phoneCode;
    const phoneFilled = phoneValue !== null && phoneValue !== undefined && phoneValue !== '';
    
    // If phone fields are not filled, return false
    if (!phoneExtFilled || !phoneFilled) {
      return false;
    }
    
    // If no additional required fields specified, enable save button
    if (!this.requiredFields || this.requiredFields.length === 0) {
      return true;
    }
    
    // Map required fields to actual form fields
    const fieldMapping: { [key: string]: string[] } = {
      'email': ['email'],
      'phone': ['phone_ext', 'phone'], // phone_ext is now country selection, alternate_phone is optional
      'contact': ['phone_ext', 'phone'] // contact means phone details, alternate_phone is optional
    };
    
    // Check only the additional required fields
    const allRequiredFieldsFilled = this.requiredFields.every(requiredField => {
      const formFields = fieldMapping[requiredField] || [requiredField];
      const allFieldsFilled = formFields.every(field => {
        const value = this.contactsForm.get(field)?.value;
        let isFilled = false;
        
        if (field === 'phone_ext') {
          // For country selection, check if a country object is selected
          isFilled = value !== null && value !== undefined && typeof value === 'object' && value.phoneCode;
        } else {
          // For other fields, check if value is not empty
          isFilled = value !== null && value !== undefined && value !== '';
        }
        
        return isFilled;
      });
      return allFieldsFilled;
    });
    return allRequiredFieldsFilled;
  }
  // Compare function for mat-select to properly handle country objects
  compareCountries(country1: Country | null, country2: Country | null): boolean {
    if (!country1 || !country2) return false;
    return country1.code === country2.code;
  }

  // Handle country selection
  onCountryChange(event: any) {
    this.selectedCountry = event.value;
    if (this.selectedCountry) {
      this.phonePattern = this.selectedCountry.pattern;
      
      // Update phone_ext with country object (for display) but store phone code for API
      this.contactsForm.patchValue({
        phone_ext: this.selectedCountry
      });
      
      // Update phone validation
      this.updatePhoneValidation();
      
      console.log('Country selected:', this.selectedCountry);
      console.log('Phone ext updated to:', this.selectedCountry.phoneCode);
    }
  }

  
  // Update phone validation based on selected country
  updatePhoneValidation() {
    if (this.selectedCountry) {
      const phoneControl = this.contactsForm.get('phone');
      const alternatePhoneControl = this.contactsForm.get('alternate_phone');
      
      // Phone is always required
      const validators = [Validators.required];
      if (this.phonePattern) {
        // Custom validator that strips spaces before pattern matching
        const customPatternValidator = (control: any) => {
          if (!control.value) return null;
          // Strip all non-digit characters before validation
          const digitsOnly = control.value.replace(/\D/g, '');
          const pattern = new RegExp(this.phonePattern);
          return pattern.test(digitsOnly) ? null : { pattern: { value: control.value } };
        };
        validators.push(customPatternValidator);
      }
      
      phoneControl?.setValidators(validators);
      
      // Alternate phone is optional, only add pattern validator if it has value
      alternatePhoneControl?.clearValidators();
      
      // Update validation
      phoneControl?.updateValueAndValidity();
      alternatePhoneControl?.updateValueAndValidity();
    }
  }
  
  // Format phone number as user types
  onPhoneInput(event: any, fieldName: string) {
    let value = event.target.value;
    
    // Remove any non-digit characters
    value = value.replace(/\D/g, '');
    
    // Limit input length based on country
    if (this.selectedCountry) {
      const maxLength = this.getMaxPhoneLength(this.selectedCountry.code);
      if (value.length > maxLength) {
        value = value.substring(0, maxLength);
      }
      
      // Apply formatting based on country
      const formattedValue = this.formatPhoneNumber(value, this.selectedCountry.code);
      this.contactsForm.patchValue({
        [fieldName]: formattedValue
      });
    } else {
      // If no country selected, limit to 15 digits (international standard)
      if (value.length > 15) {
        value = value.substring(0, 15);
      }
      this.contactsForm.patchValue({
        [fieldName]: value
      });
    }
  }
  
  // Get maximum phone length for a country
  getMaxPhoneLength(countryCode: string): number {
    switch (countryCode) {
      case 'AE': return 9;  // UAE
      case 'IN': return 10; // India
      case 'PK': return 10; // Pakistan
      case 'BD': return 10; // Bangladesh
      case 'LK': return 9;  // Sri Lanka
      case 'NP': return 10; // Nepal
      case 'PH': return 10; // Philippines
      case 'EG': return 10; // Egypt
      case 'JO': return 8;  // Jordan
      case 'LB': return 8;  // Lebanon
      case 'SA': return 9;  // Saudi Arabia
      case 'KW': return 8;  // Kuwait
      case 'QA': return 8;  // Qatar
      case 'BH': return 8;  // Bahrain
      case 'OM': return 8;  // Oman
      case 'AU': return 9;  // Australia
      case 'GB': return 10; // United Kingdom
      default: return 15;   // International standard
    }
  }

  // Format phone number based on country
  formatPhoneNumber(phone: string, countryCode: string): string {
    if (!phone) return '';
    
    switch (countryCode) {
      case 'AE': // UAE - 9 digits
        return phone.replace(/(\d{2})(\d{3})(\d{4})/, '$1 $2 $3');
      case 'IN': // India - 10 digits
        return phone; // No formatting for India - keep as continuous digits
      case 'PK': // Pakistan - 10 digits
        return phone.replace(/(\d{3})(\d{7})/, '$1 $2');
      case 'BD': // Bangladesh - 10 digits
        return phone.replace(/(\d{4})(\d{6})/, '$1 $2');
      case 'LK': // Sri Lanka - 9 digits
        return phone.replace(/(\d{2})(\d{3})(\d{4})/, '$1 $2 $3');
      case 'NP': // Nepal - 10 digits
        return phone.replace(/(\d{4})(\d{6})/, '$1 $2');
      case 'PH': // Philippines - 10 digits
        return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
      case 'EG': // Egypt - 10 digits
        return phone.replace(/(\d{2})(\d{4})(\d{4})/, '$1 $2 $3');
      case 'JO': // Jordan - 8 digits
        return phone.replace(/(\d{2})(\d{3})(\d{3})/, '$1 $2 $3');
      case 'LB': // Lebanon - 8 digits
        return phone.replace(/(\d{2})(\d{3})(\d{3})/, '$1 $2 $3');
      case 'SA': // Saudi Arabia - 9 digits
        return phone.replace(/(\d{2})(\d{3})(\d{4})/, '$1 $2 $3');
      case 'KW': // Kuwait - 8 digits
        return phone.replace(/(\d{4})(\d{4})/, '$1 $2');
      case 'QA': // Qatar - 8 digits
        return phone.replace(/(\d{4})(\d{4})/, '$1 $2');
      case 'BH': // Bahrain - 8 digits
        return phone.replace(/(\d{4})(\d{4})/, '$1 $2');
      case 'OM': // Oman - 8 digits
        return phone.replace(/(\d{4})(\d{4})/, '$1 $2');
      case 'AU': // Australia - 9 digits (mobile format: 4XX XXX XXX)
        return phone.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
      case 'GB': // United Kingdom - 10 digits (mobile format: 7XXX XXXXXX)
        return phone.replace(/(\d{4})(\d{6})/, '$1 $2');
      default:
        return phone;
    }
  }

  // Contact mode is passed from parent dialog, no need for local selection
  saveContact() {
    console.log('save-contact::', this.contactsForm.value);
    this.showProgressBar = true;

    // Prepare form data for API - convert country object to phone code
    const formData = { ...this.contactsForm.value };
    if (formData.phone_ext && typeof formData.phone_ext === 'object') {
      formData.phone_ext = formData.phone_ext.phoneCode;
    }

    this._sunshineAPI
      .postNewContact(formData)
      .then((res: any) => {
        console.log('NEW-CONTACT-RES::>>', res);
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

  cancelContact() {
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
