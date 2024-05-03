import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard  {
  canActivate() {
    return true;
  }
  canActivateChild() {
    return true;
  }
}
