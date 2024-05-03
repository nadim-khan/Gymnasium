import { Component,  OnDestroy,  OnInit,  ViewChild } from '@angular/core';
import { UsersService } from '../users.service';
import { MatLegacyPaginator as MatPaginator } from '@angular/material/legacy-paginator';
import { MatSort } from '@angular/material/sort';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { AuthService } from '../../auth/auth.service';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';

export interface UserData {
  _id: string;
  index: number;
  username: string;
  email: string;
  colcreatedAt: string;
  hashedPassword: string;
  roles: any;
}

@Component({
  selector: 'app-all-users',
  templateUrl: './all-users.component.html',
  styleUrls: ['./all-users.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})

export class AllUsersComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['profile','username', 'email', 'action'];
  profilepic;
  dataSource: MatTableDataSource<UserData>;
  isAdmin = false;
  expandedElement: UserData | null;
  filterValue;
  currentId;
  currentUser;
  isLoader = true;
  showButton = false;
  type = [
    { id: 1, name: 'Admin', value: 'admin' },
    { id: 2, name: 'Trainer', value: 'trainer' },
    { id: 3, name: 'General', value: 'general' },
  ];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    public userService: UsersService,
    public authService: AuthService,
    public snackBar: MatSnackBar,
    public dialog: MatDialog
  ) {
    this.userService.checkUser();
    this.userService.isAdminBS.subscribe(value => {
      this.isAdmin = value;
      this.currentUser = this.userService.currentUserData;
      console.log('this.currentUserthis.currentUserthis.currentUserthis.currentUser: ', this.currentUser);
    });
    // check if user is admin - Behaviour subject
    this.checkDetails();
  }
  ngOnInit() {
    this.checkDetails();
  }

  checkDetails() {
    this.userService.authService.getAllUsersList().subscribe(listData => {
      this.userService.allUsersList = listData;
      this.isLoader = false;
      const users = listData;
      console.log('users', users);
      for (let i = 0; i < users.length; i ++) {
        users[i] = Object.assign({}, users[i], {index : i + 1});
        console.log(' users4', users);
      }
      // Assign the data to the data source for the table to render
      this.dataSource = new MatTableDataSource(users);
      console.log(' this.dataSource', this.dataSource);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  ngOnDestroy() {
    this.isAdmin = false;
    this.currentUser = null;
  }

  applyFilter(event: Event) {
    this.filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = this.filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  clearFilter() {
    this.filterValue = '';
    this.dataSource.filter = '';
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  changeUserColor(user) {
  if (user === 'admin') {
    return '#56F70B ';
  } else if (user === 'executive') {
    return '#0BDBF7 ';
  } else if (user === 'general') {
    return '#F7DE0B ';
  } else {
    return '#FF0D0D';
  }
  }

  addNew() {
    // const dialogRef = this.dialog.open(RegisterDialogComponent, { panelClass: 'custom-dialog-container' });
  }

  shortName(name){
    let newName;
    if(name.split(' ').length>1) {
      newName = name.split(' ')[0].substring(0,1) + name.split(' ')[1].substring(0,1);
      return newName.toUpperCase();
    } else if(name.length > 2) {
      newName = name.substring(0, 2);
      console.log(name,newName)
      return newName.toUpperCase();
    }
  }

  updateData(data) {
    console.log('Updated data : ', data);
    //this.userService.updateUser(data);
    this.authService.updateUserDetails(data).subscribe(details=>{
      if(details.status === 200) {
        this.snackBar.open('User Details updated for '+ data.username, 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      }
    })
  }

  change(data) {
    console.log('change data : ', data);
  }

  onExpand(value) {
    console.log('===>', value);
    if (value) {
      this.currentId = value._id;
      this.showButton = true;
    } else {
      this.showButton = false;
    }
  }

}
