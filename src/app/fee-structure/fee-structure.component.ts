import { Component, Input, OnChanges, OnInit, ViewChild, ChangeDetectorRef  } from '@angular/core';
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { Validators, UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { MatLegacyPaginator as MatPaginator } from '@angular/material/legacy-paginator';
import { MatSort } from '@angular/material/sort';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';

import { AuthService } from '../auth/auth.service';
import { Fees } from '../services/fees';
import { GeneralService } from '../services/general.service';

@Component({
  selector: 'app-fee-structure',
  templateUrl: './fee-structure.component.html',
  styleUrls: ['./fee-structure.component.scss']
})
export class FeeStructureComponent implements OnInit, OnChanges {
  fieldArray: MatTableDataSource<Fees>;

  displayedColumns =
      ['id', 'subscription', 'description', 'amount', 'action'];
  disableAdd = true;
  showSpinner = true;
  isAdmin = false;
  isLoader = true;
  @Input() userInfo;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private general: GeneralService,
    private authService: AuthService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private breakpointObserver: BreakpointObserver
  ) {
    this.isAdmin = this.authService.isAdmin;
    breakpointObserver.observe(['(max-width: 420px)']).subscribe(result => {
      this.displayedColumns = result.matches ?
          ['subscription', 'amount'] :
          ['id', 'subscription', 'description', 'amount', 'action'];
    });
   }

  ngOnChanges() {
    this.isAdmin = this.authService.isAdmin;
  }


  ngOnInit() {
    this.getFeeStructure();
  }

  getFeeStructure() {
    this.general.getFeeStructure().subscribe(data => {
      this.isLoader = false;
      for (let i = 0; i < data.length; i ++) {
        data[i] = Object.assign({}, data[i], {index : i + 1});
      }
      // this.fieldArray = (data as unknown as Fees[]);
      this.fieldArray = new MatTableDataSource(data);
      this.showSpinner = false;
      this.cdr.detectChanges();
      this.fieldArray.paginator = this.paginator;
      this.fieldArray.sort = this.sort;
    });
  }

  addNew() {
    const dialogRef = this.dialog.open(AddFeeDialogComponent, { panelClass: 'custom-dialog-container' });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action && result.action === 'addFee') {
        this.general.postNewFeeDetails(result.data).subscribe(resp => {
          if (resp) {
            this.getFeeStructure();
          }
        });
      } else {
        return;
      }
    });
  }

  deleteFieldValue(id) {
    this.showSpinner = true;
    const feeId = id;
    this.general.feeDelete({ _id: feeId }).subscribe(response => {
      console.log('Delete Response : ', response);
      this.getFeeStructure();
    });
  }


}

// Add new fee detail inside popup
@Component({
  selector: 'app-dialog-login',
  templateUrl: '../popups/addFee.html',
})
export class AddFeeDialogComponent {
  hide = true;
  description: string | null = null;
  amount: number | null = null;
  error: string;
  constructor(
    public dialogRef: MatDialogRef<AddFeeDialogComponent>,
    private authService: AuthService
  ) {
    this.dialogRef.disableClose = true;
  }

  feeData = new UntypedFormGroup({
    subscription: new UntypedFormControl('', [Validators.required, Validators.minLength(3)]),
    description: new UntypedFormControl(''),
    amount: new UntypedFormControl('', [Validators.required, Validators.min(0)]),
  });

  get f() {
    return this.feeData.controls;
  }

  addFeeNow(): void {
    if (!this.feeData.valid) {
      this.dialogRef.close({ action: 'invalid' });
      return;
    }
    const feeDetails = this.feeData.getRawValue();
    // console.log('registrationData data', this.registrationData.value);
    this.authService.regUser = feeDetails;
    this.dialogRef.close({ action: 'addFee', data: feeDetails });

    this.feeData.reset();
  }


  onNoClick(): void {
    this.dialogRef.close({ action: 'close' });
    this.feeData.reset();
  }

}
