import { Component, OnInit } from '@angular/core';
import { SunshineInternalService } from 'src/app/sunshine-services/sunshine-internal.service';
import { FormControl } from '@angular/forms';
export interface Modules {
  module_id: Number;
  module_name: String;
  module_desc: String;
  module_bit: Number;
  route_name: String;
  module_icon: String;
  module_alias: String;
  module_type: String;
  module_group: String;
  module_group_sort_order: Number;
  module_sort_order: Number;
}
@Component({
  selector: 'app-manage-roles-dialog',
  templateUrl: './manage-roles-dialog.component.html',
  styleUrls: ['./manage-roles-dialog.component.css'],
})
export class ManageRolesDialogComponent implements OnInit {
  modules: Modules[] = [];
  listFilteredModule: Modules[] = [];
  selectPrivileges = new FormControl('');
  privilegesList: any[] = [];
  selectedPrivArr: any = [];
  constructor(private sunshineServicesInt: SunshineInternalService) {}

  ngOnInit(): void {
    // this.getAllModules();
    // this.getAllPrivileges();
  }

  getAllModules() {
    this.sunshineServicesInt
      .fetchModules()
      .then((res: any) => {
        let modulesRes = res.data[0];
        this.modules = modulesRes;
        this.listFilteredModule = modulesRes.filter(
          (module: any) => module.module_type == 'list'
        );
        //console.log('modules-arr', this.modules);
      })
      .catch((error) => {
        this.modules = [];
      });
  }

  getAllPrivileges() {
    this.sunshineServicesInt
      .fetchAllPrivileges()
      .then((res: any) => {
        //console.log('privilege-res', res);
        let resData = res.data[0];
        this.privilegesList = resData;
      })
      .catch((error) => {
        //console.log('privilege-err', error);
      });
  }

  selectPrivilegeForUser(privilege: any, event: any, i: number) {
    // //console.log('privilegee select--', privilege);
    // //console.log('privilegee select event--', event.source._selected);
    let totalPrivilegeBitMask = 0;
    if (event.source._selected) {
      this.selectedPrivArr.push(privilege);
      // //console.log(
      //   'index added:',
      //   i,
      //   'length after addition :',
      //   this.selectedPrivArr.length
      // );

      // //console.log('selectedPrivArr-add', this.selectedPrivArr);
      this.selectedPrivArr.forEach((element: any) => {
        totalPrivilegeBitMask += element.privilege_bit;
        // //console.log('privilegeBitMask-added', totalPrivilegeBitMask);
      });
    } else {
      // //console.log(
      //   'index to be removed at:',
      //   i,
      //   'length after removal:',
      //   this.selectedPrivArr.length
      // );
      const indexToRemove = this.selectedPrivArr.findIndex(
        (element: any) => element.privilege_id === privilege.privilege_id
      );
      if (indexToRemove !== -1) {
        this.selectedPrivArr.splice(indexToRemove, 1);
        // //console.log('selectedPrivArr-rem', this.selectedPrivArr);
        totalPrivilegeBitMask = 0;
        this.selectedPrivArr.forEach((element: any) => {
          totalPrivilegeBitMask += element.privilege_bit;
          // //console.log('privilegeBitMask-rem', totalPrivilegeBitMask);
        });
      }
    }
    // //console.log('Total Privilege Bit Mask:', totalPrivilegeBitMask);
    let priv_list = this.generateUniqueNumbersStringFromArray(
      this.selectedPrivArr
    );
    //console.log('priv_list', priv_list);
  }

  generateUniqueNumbersStringFromArray(selectedPrivArr: any[]): string {
    const privilegeIds = selectedPrivArr.map(
      (privilege: any) => privilege.privilege_id
    );
    const uniquePrivilegeIds = Array.from(new Set(privilegeIds));
    return uniquePrivilegeIds.join(',');
  }

  saveURC() {
    {
      ('in_app_user_id');
      ('in_user_id');
      ('in_role_id');
      ('in_company_id');
      ('in_module_id');
      ('in_privilege_list');
      ('in_group_list');
      ('in_status');
    }
  }
}
