import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GeneralService } from '../services/general.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit, OnChanges {
  @Input() userInfo;
  currentUserName = '';
  currentUserEmail = '';

  constructor(
    private general: GeneralService,
    private snackBar: MatSnackBar
  ) { }

  queryData = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl(this.currentUserEmail, [Validators.required, Validators.email]),
    queryDetail: new FormControl('', [Validators.required, Validators.minLength(10)]),
  });


  ngOnChanges() {
    if (this.userInfo) {
      this.currentUserName = this.userInfo.username;
      this.currentUserEmail = this.userInfo.email;
    }
  }

  ngOnInit(): void {
  }

  get f() {
    return this.queryData.controls;
  }

  sendQuery() {
    const queryToBeSent = this.queryData.getRawValue();
    this.general.newMail(queryToBeSent).subscribe(response => {
      if (response) {
        this.snackBar.open(`Query has been sent successfully. We'll get back to you`, 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      } else {
        this.snackBar.open('Oops! Something went wrong. Please try again.', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      }
    });
    console.log('queryToBeSent data', queryToBeSent);
    this.queryData.reset();
  }

  clearForm() {
    this.queryData.reset();
  }



}
