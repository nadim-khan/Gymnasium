import { Component, ViewChild, HostListener, OnInit, OnDestroy, HostBinding, Inject } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { of, Subscription } from 'rxjs';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormBuilder, Validators, UntypedFormGroup, UntypedFormControl, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import {OverlayContainer} from '@angular/cdk/overlay';

import { User } from './auth/user';
import { AuthService } from './auth/auth.service';
import { GeneralService } from './services/general.service';
import * as moment from 'moment';
import { Broadcast } from './services/broadcast';
import { HttpClient, HttpErrorResponse, HttpEventType, HttpRequest } from '@angular/common/http';
import { catchError, last, map, tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { DateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit, OnDestroy {
  [x: string]: any;
  opened = true;
  isDark = false;
  userValues: User;
  userExist = false;
  isAdmin = false;
  hide = true;
  mode = 'dark';
  username;
  userProfilePic;
  email;
  error;
  role;
  browserLang;
  languageSet = [];
  broadcastMsgData;
  allBroadcastMsgs: Broadcast[] = [];
  userSubscription: Subscription;
  notification;
  pendingNoti = 0;

  @HostBinding('class')
  get themeMode() {
    return this.isDark ? 'theme-dark' : 'theme-light';
  }
  @HostBinding('class')
  get theme() {
    return this.mode;
  }
  @ViewChild('sidenav', { static: true }) sidenav: MatSidenav;

  constructor(
    private authService: AuthService,
    private router: Router,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private general: GeneralService,
    public overlayContainer: OverlayContainer,
    public translate: TranslateService,
    private dateAdapter: DateAdapter<Date>
  ) {
    this.refreshAll();
    translate.addLangs(['en', 'hi', 'ar']);
    translate.setDefaultLang('en');
    this.browserLang = translate.getBrowserLang();
    translate.use(this.browserLang.match(/en|hi/) ? this.browserLang : 'en');
    this.generateLanguageSet();
  }

  selectAll($event: any) {
    console.log($event);
    this.notification = this.notification.map(val => {
      if (val.checked === 'true') {
        val.checked = 'false';


      } else {
        val.checked = 'true';
      }
      return val;
    });
  }



  refreshAll() {
    this.getUserDetails();
    this.getBroadcastMsg();
  }

  generateLanguageSet() {
    const langs = this.translate.getLangs();
    const set = [
      {code: 'en', name: 'English', nativeName: 'English'},
      {code: 'hi', name: 'Hindi', nativeName: 'हिन्दी'},
      {code: 'ar', name: 'Arabic', nativeName: 'العربية'},
    ];
    set.forEach(data => {
      if (langs.includes(data.code)) {
        this.languageSet.push(data);
      }
    });
    const localStorageLang = localStorage.getItem('selectedLanguage');
    console.log('this.languageSet', this.languageSet);
    if (localStorageLang) {
      this.translate.use(localStorageLang);
      this.dateAdapter.setLocale( localStorageLang);
      this.browserLang = localStorageLang;
    }
  }

  setLanguage(value) {
    localStorage.setItem('selectedLanguage', value);
  }

  ngOnInit() {
    if (window.innerWidth < 768) {
      this.sidenav.fixedTopGap = 55;
      this.opened = false;
    } else {
      this.sidenav.fixedTopGap = 55;
      this.opened = true;
    }
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  getBroadcastMsg() {
    this.general.getAllBroadcast().subscribe(msgs => {
      this.allBroadcastMsgs = (msgs as unknown as Broadcast[]);
      if (this.allBroadcastMsgs && this.allBroadcastMsgs.length > 0) {
        this.authService.broadcastAvailable.next(true);
        this.broadcastMsgData = this.allBroadcastMsgs[this.allBroadcastMsgs.length - 1];
      } else {
        this.authService.broadcastAvailable.next(false);
      }
    });
  }

  getUserDetails() {
    this.authService.checkLoginStatus().subscribe(userData => {
      this.userValues = userData;
      if (this.userValues === null) {
        this.authService.User.subscribe(user => {
          this.userValues = user;
          this.checkUserDetails();
        });
      } else {
        this.checkUserDetails();
      }
    });
  }

  // Set user properties to display
  checkUserDetails() {
    if (this.userValues && this.userValues.user) {
      this.username = this.userValues.user.username;
      this.email = this.userValues.user.email;
      this.userProfilePic = this.userValues.user.fileSource;
      if (this.userValues.user.roles.length > 0) {
        this.role = this.userValues.user.roles[0];
        if (this.role === 'admin') {
          this.isAdmin = true;
        } else {
          this.isAdmin = false;
        }
      } else {
        this.isAdmin = false;
      }
      if (this.username && this.email && this.username !== '' && this.email !== '') {
        this.userExist = true;
      } else {
        this.userExist = false;
      }
      this.general.getAllMails().subscribe(mails => {
        this.notification =  mails;
        this.notification = this.notification.sort((a, b) => {
          return new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf();
        });
        this.pendingNoti = this.notification.length;
      });
    } else {
      this.userExist = false;
      this.isAdmin = false;
      this.notification = [];
    }
  }

  shortName(name){
    console.log('shortname : ',name)
    // if(name.split(' ').length>1) {
    //   return (name.split(' ')[0].substring(0,1)+name.split(' ')[1].substring(0,1)).toUpperCase();
    // } else if(name.length > 2) {
    //   return name.substring(0, 2).toUppercase();
    // } else {
      return (name.charAt(0)+name.charAt(1)).toUpperCase();
    // }
  }

  // Login to Users account
  onLogin() {
    const dialogRef = this.dialog.open(LoginDialogComponent, { panelClass: 'custom-dialog-container' });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action && result.action === 'login') {
        console.log('Login result : ', result);
        this.authService.login(result.email, result.password).subscribe(res => {
          if (res) {
            this.snackBar.open('Succesfully logged in.', 'Close', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
            // this.router.navigateByUrl('/');
            this.refreshAll();
          }
        }, e => {
          this.error = e;
          this.snackBar.open('Oops! Something went wrong. Please try again.', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
              verticalPosition: 'top',
          });
        });
      } else if (result && result.action && result.action === 'register') {
        this.onRegister();
      }
    });
  }

  // Register new User
  onRegister() {
    const dialogRef = this.dialog.open(RegisterDialogComponent, { panelClass: 'custom-dialog-container' });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action && result.action === 'register') {
        this.authService.register(result.data).subscribe(res => {
          if (res) {
            this.snackBar.open('User has been registered succesfully.', 'Close', {
              duration: 2000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
            this.refreshAll();
          }
          // this.router.navigate(['']);
        });
      } else if (result && result.action && result.action === 'invalid') {
        this.snackBar.open('Invalid values! please re-register', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
              verticalPosition: 'top',
        });
      } else if (result && result.action && result.action === 'login') {
        this.onLogin();
      }
    });
  }

  // Switch mode
  onModeSwitch(isDarkMode) {
    this.isDark = !this.isDark;
  }

  // Choose theme
  themeOptions(option) {
    this.overlayContainer.getContainerElement().classList.value = 'cdk-overlay-container';
    this.overlayContainer.getContainerElement().classList.add(option.value);
    switch (option.value) {
      case 'dark':
        this.mode = 'dark';
        break;
      case 'blue':
        this.mode = 'blue';
        break;
      case 'green':
        this.mode = 'green';
        break;
      case 'orange':
        this.mode = 'orange';
        break;
      default:
        this.mode = 'dark';
    }
  }

  getAlertClass(type) {
    if (type === 'general') {
      return 'bg-green';
    } else if (type === 'warning') {
      return 'bg-yellow';
    } else if (type === 'danger') {
      return 'bg-red';
    }
  }

  // Broadcast a message
  broadcast() {
    const dialogRef = this.dialog.open(BroadcastDialogComponent, { panelClass: 'custom-dialog-container' });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action && result.action === 'broadcast') {
        const formattedData = {
          message: result.data.message,
          type: result.data.type,
          fromDate: moment(new Date(result.data.fromDate)).format('YYYY-MM-DD[T00:00:00.000Z]'),
          toDate: moment(new Date(result.data.toDate)).format('YYYY-MM-DD[T00:00:00.000Z]')
        };
        this.general.newBroadcast(formattedData).subscribe(response => {
          if (response) {
            this.snackBar.open('Message will be displayed to everyone.', 'Close', {
              duration: 2000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
            this.refreshAll();
          }
        });
      }
    });
  }

  // Show notification
  showNotification(id) {
    const dialogRef = this.dialog.open(ShowNotificationComponent,  { panelClass: 'custom-dialog-container-notification',
    data: {mailid: id, allMails: this.notification}
   });
  }

  // Check screen width and size
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (event.target.innerWidth < 768) {
      this.sidenav.fixedTopGap = 55;
      this.opened = false;
    } else {
      this.sidenav.fixedTopGap = 55;
      this.opened = true;
    }
  }

  isBiggerScreen() {
    const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    if (width < 768) {
      return true;
    } else {
      return false;
    }
  }

  // logout user
  logout() {
    this.authService.logout();
    this.refreshAll();
    this.snackBar.open('Logged out successfully.', 'Close', {
      duration: 4000,
      horizontalPosition: 'center',
              verticalPosition: 'top',
    });
    this.userExist = false;
    this.router.navigate(['']);
  }

  // theme check
  changeTheme() {
    this.otherTheme = !this.otherTheme;
  }
}

// Login form inside popup
@Component({
  selector: 'app-dialog-login',
  templateUrl: './popups/login.html',
})
export class LoginDialogComponent {
  hide = true;
  email: string | null = null;
  password: string | null = null;
  error: string;
  constructor(
    public dialogRef: MatDialogRef<LoginDialogComponent>,
    private router: Router,
    private authService: AuthService
  ) {
    this.dialogRef.disableClose = true;
  }

  loginData = new UntypedFormGroup({
    email: new UntypedFormControl('', [Validators.required, Validators.email]),
    password: new UntypedFormControl('', [Validators.required]),
  });
  get f() {
    return this.loginData.controls;
  }

  login(): void {
    if (!this.loginData.valid) {
      this.dialogRef.close({ action: 'invalid' });
      return;
    }
    const loginCreds = this.loginData.getRawValue();
    this.dialogRef.close({ action: 'login', email: loginCreds.email, password: loginCreds.password });
  }

  register() {
    this.dialogRef.close({ action: 'register' });
  }

  onNoClick(): void {
    this.dialogRef.close({ action: 'close' });
  }

}

// Login form inside popup
@Component({
  selector: 'app-dialog-register',
  templateUrl: './popups/register.html',
})
export class RegisterDialogComponent {
  hide = true;
  rehide = true;
  files = [];
  selectedFile;
  imageSrc: string;

  constructor(
    private router: Router,
    private fb: UntypedFormBuilder,
    private authService: AuthService,
    public dialogRef: MatDialogRef<RegisterDialogComponent>,
    private http: HttpClient
  ) {
    this.dialogRef.disableClose = true;
  }

  registrationData = new UntypedFormGroup({
    profilePic: new UntypedFormControl(''),
    fileSource: new UntypedFormControl(''),
    file: new UntypedFormControl(''),
    username: new UntypedFormControl('', [Validators.required, Validators.minLength(3), this.cannotContainSpace]),
    email: new UntypedFormControl('', [Validators.required, Validators.email]),
    password: new UntypedFormControl('', [Validators.required]),
    repeatPassword: new UntypedFormControl('', [Validators.required, this.passwordMatch]),
  });

  get f() {
    return this.registrationData.controls;
  }

  cannotContainSpace(control: UntypedFormControl) {
    //    if ((control.value).indexOf(' ') >= 0) {
    //      return {
    //        cannotContainSpace: true
    //       };
    //  }
    return null;
  }

  passwordMatch(control: UntypedFormControl) {
    const password = control.root.get('password');
    return password && control.value !== password.value ? {
      passwordMatch: true
    } : null;
  }

  onUploadClick() {
    const fileUpload = document.querySelector('fileUpload') as HTMLInputElement;
    console.log(fileUpload);
    fileUpload.onchange = () => {
      // tslint:disable-next-line:prefer-for-of
      for (let index = 0; index < fileUpload.files.length; index++) {
        const file = fileUpload.files[index];
        this.files.push({
          data: file, state: 'in',
          inProgress: false, progress: 0, canRetry: false, canCancel: true
        });
      }
    };
  }

  onFileChanged(event) {
    console.log(event);
    console.log(event.target.files[0])
    this.registrationData.patchValue({
      file: event.target.files[0]
    });
    const reader = new FileReader();
    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);
      reader.onload = () => {
        console.log(event);
        this.imageSrc = reader.result as string;
        console.log(this.imageSrc);
        this.registrationData.patchValue({
          fileSource: reader.result
        });
      };
    }
  }


  register() {
    if (!this.registrationData.valid) {
      this.dialogRef.close({ action: 'invalid' });
      return;
    }
    const regCreds = this.registrationData.getRawValue();
    // console.log('registrationData data', this.registrationData.value);
    this.authService.regUser = regCreds;
    this.dialogRef.close({ action: 'register', data: regCreds });

    this.registrationData.reset();
  }

  login() {
    this.dialogRef.close({ action: 'login' });
  }

  clearForm() {
    this.registrationData.reset();
    this.dialogRef.close({ action: 'close' });
  }


}

// BroadcastDialogComponent

@Component({
  selector: 'app-dialog-broadcast',
  templateUrl: './popups/broadcast.html',
})
export class BroadcastDialogComponent {
  hide = true;
  rehide = true;
  minDate = new Date();
  type = [
    { id: 1, name: 'General', value: 'general' },
    { id: 2, name: 'Warning', value: 'warning' },
    { id: 3, name: 'Danger', value: 'danger' }
  ];

  constructor(
    private router: Router,
    private fb: UntypedFormBuilder,
    private authService: AuthService,
    public dialogRef: MatDialogRef<BroadcastDialogComponent>
  ) {
    this.dialogRef.disableClose = true;
   }

  broadcastData = new UntypedFormGroup({
    message: new UntypedFormControl('', [Validators.required, Validators.minLength(3)]),
    type: new UntypedFormControl('', [Validators.required]),
    fromDate: new UntypedFormControl('', [Validators.required]),
    toDate: new UntypedFormControl('', [Validators.required]),
  });

  get f() {
    return this.broadcastData.controls;
  }

  broadcastNow() {
    if (!this.broadcastData.valid) {
      this.dialogRef.close({ action: 'invalid' });
      return;
    }
    const broadcast = this.broadcastData.getRawValue();
    this.dialogRef.close({ action: 'broadcast', data: broadcast });
  }

  clearForm() {
    this.broadcastData.reset();
    this.dialogRef.close({ action: 'close' });
  }

}


// BroadcastDialogComponent

@Component({
  selector: 'app-dialog-notification',
  templateUrl: './popups/notificationt.html',
})
export class ShowNotificationComponent {
  notification;
  allSelected = false;
  showSelect = false;
  isChecked = false;
  currentMailDetails;
  constructor(
    private router: Router,
    private fb: UntypedFormBuilder,
    private authService: AuthService,
    private general: GeneralService,
    public dialogRef: MatDialogRef<BroadcastDialogComponent>, @Inject(MAT_DIALOG_DATA) public data
  ) {
    console.log(data);
    data.allMails.filter(val => {
      if (val._id === data.mailid) {
        this.currentMailDetails = val;
      }
    });
    console.log(this.currentMailDetails);

    // this.general.checkMail(data.mailid).subscribe(res => {
    //   console.log('mail checked : ', res);
    // });
    this.notification = this.data.allMails;
    this.dialogRef.disableClose = false;
   }
   markAll(val) {
    this.allSelected = !val;
    this.selectAll(this.allSelected);
   }

   currentMail(val) {
     console.log(val);
     this.currentMailDetails = val;
   }

   selectAll(value: any) {
    console.log(value);
    this.notification = this.data.allMails.map(val => {
        if (value) {
          val.checked = true;
        } else {
          val.checked = false;
        }
        this.allSelected = value;
        return val;
    });
  }


}

