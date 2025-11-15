import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})

export class CustomFunctionsService {
  constructor(private _snackBar: MatSnackBar) {}

  checkForAllowedModuleAndPrivilegesForCreate(
    privilegeName: any,
    moduleName: any
  ): any {
    return this.checkForAllowedModuleAndPrivileges(privilegeName, moduleName);
  }

  checkForAllowedModuleAndPrivilegesForUpload(
    privilegeName: any,
    moduleName: any
  ): any {
    return this.checkForAllowedModuleAndPrivileges(privilegeName, moduleName);
  }

  checkForAllowedModuleAndPrivilegesForRead(
    privilegeName: any,
    moduleName: any
  ): any {
    return this.checkForAllowedModuleAndPrivileges(privilegeName, moduleName);
  }

  checkForAllowedModuleAndPrivilegesForEdit(
    privilegeName: any,
    moduleName: any
  ): any {
    return this.checkForAllowedModuleAndPrivileges(privilegeName, moduleName);
  }

  private checkForAllowedModuleAndPrivileges(
    privilegeName: any,
    moduleName: any
  ): any {
    // console.log(`priv-name: ${privilegeName}`);
    // console.log(`module-name: ${moduleName}`);
    if (
      sessionStorage.getItem('loggedInUsrAuthModules') &&
      sessionStorage.getItem('privileges')
    ) {
      const sessionModuleGroup: any = sessionStorage.getItem(
        'loggedInUsrAuthModules'
      );
      const parsedSessionModuleGroup = JSON.parse(sessionModuleGroup);

      //! obtain privilege mask for 'moduleName' module_name
      const foundModuleName = parsedSessionModuleGroup.find(
        (mod: any) => mod.module_name === moduleName
      );
      if (!foundModuleName) {
        this.openSnackBar(`Module access denied for "${moduleName}"`);
        return false;
      }
      const foundModulePrivilegeMask = foundModuleName.privilege_mask;

      //*-------------------------------------------------------------------------//

      const sessionPrivileges: any = sessionStorage.getItem('privileges');
      const parsedSessionPrivileges = JSON.parse(sessionPrivileges);

      //! obtain the privilege bit for 'privilegeName' privilege
      const foundPrivilege = parsedSessionPrivileges.find(
        (priv: any) => priv.privilege_name === privilegeName
      );
      if (!foundPrivilege) {
        this.openSnackBar(`Privilege ${privilegeName} not found`);
        return false;
      }
      const foundCreatePrivBit = foundPrivilege.privilege_bit;

      //! pass privilege_bit for "privilegeName" & privilegeMask for "moduleName" to check if bit is part of mask or not
      const value = this.checkIfBitIsPartOfMask(
        foundCreatePrivBit,
        foundModulePrivilegeMask
      );
      // console.log(
      //   `privilege bit mask value for ${privilegeName} & ${moduleName} :`,
      //   value
      // );

      //! if bit is part of mask / bit is not part of mask, then, show / hide the UI element respectively
      return value != 0;
    } else {
      this.openSnackBar(`ACCESS DENIED FOR ${privilegeName}`);
      return false;
    }
  }

  checkIfBitIsPartOfMask(privilegeBit: number, privilegeMask: number) {
    return privilegeBit & privilegeMask;
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, 'Close', {
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      duration: 6 * 1000,
    });
  }
}
