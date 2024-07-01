import { RequestHelper } from '@lib/helpers/request.helper';
import { IDynamicStorageRbac, IStorageRbac } from '@lib/rbac';
import { Injectable } from '@nestjs/common';
import { uniq } from 'lodash';

export enum PermAct {
  C = 'create',
  R = 'read',
  U = 'update',
  D = 'delete',
}

export enum PermOwner {
  Profile = 'owner_profile',
  Restaurant = 'owner_restaurant',
  Staff = 'owner_staff',
  Role = 'owner_role',
  Location = 'owner_location',
  Table = 'owner_table',
  Category = 'owner_category',
  Variant = 'owner_variant',
  Product = 'owner_product',
  Stock = 'owner_stock',
  Order = 'owner_order',
  Notification = 'owner_notification',
}

export enum PermStaff {
  Profile = 'staff_profile',
  Restaurant = 'staff_restaurant',
  Role = 'staff_role',
  Location = 'staff_location',
  Table = 'staff_table',
  Category = 'staff_category',
  Variant = 'staff_variant',
  Product = 'staff_product',
  Stock = 'staff_stock',
}

export const DefaultPerms = [PermOwner.Profile, PermOwner.Restaurant];

@Injectable()
export class RoleService implements IDynamicStorageRbac {
  getRbac(): Promise<IStorageRbac> {
    const grants = RequestHelper.getPermissionGrants();
    const combinedGrants = {};
    for (const [role, perms] of Object.entries(grants) as any) {
      combinedGrants[role] = uniq([...perms, ...DefaultPerms]);
    }

    const permissions = {
      [PermOwner.Profile]: [PermAct.R, PermAct.C, PermAct.U, PermAct.D],
      [PermOwner.Restaurant]: [PermAct.R, PermAct.C, PermAct.U, PermAct.D],
      [PermOwner.Staff]: [PermAct.R, PermAct.C, PermAct.U, PermAct.D],
      [PermOwner.Role]: [PermAct.R, PermAct.C, PermAct.U, PermAct.D],
      [PermOwner.Location]: [PermAct.R, PermAct.C, PermAct.U, PermAct.D],
      [PermOwner.Table]: [PermAct.R, PermAct.C, PermAct.U, PermAct.D],
      [PermOwner.Category]: [PermAct.R, PermAct.C, PermAct.U, PermAct.D],
      [PermOwner.Variant]: [PermAct.R, PermAct.C, PermAct.U, PermAct.D],
      [PermOwner.Product]: [PermAct.R, PermAct.C, PermAct.U, PermAct.D],
      [PermOwner.Stock]: [PermAct.R, PermAct.C, PermAct.U, PermAct.D],
      [PermOwner.Order]: [PermAct.R, PermAct.C, PermAct.U, PermAct.D],
      [PermOwner.Notification]: [PermAct.R, PermAct.C, PermAct.U, PermAct.D],

      [PermStaff.Profile]: [PermAct.R, PermAct.C, PermAct.U, PermAct.D],
      [PermStaff.Restaurant]: [PermAct.R, PermAct.C, PermAct.U, PermAct.D],
      // [PermStaff.Staff]: [PermAct.R, PermAct.C, PermAct.U, PermAct.D],
      [PermStaff.Role]: [PermAct.R, PermAct.C, PermAct.U, PermAct.D],
      [PermStaff.Location]: [PermAct.R, PermAct.C, PermAct.U, PermAct.D],
      [PermStaff.Table]: [PermAct.R, PermAct.C, PermAct.U, PermAct.D],
      [PermStaff.Category]: [PermAct.R, PermAct.C, PermAct.U, PermAct.D],
      [PermStaff.Variant]: [PermAct.R, PermAct.C, PermAct.U, PermAct.D],
      [PermStaff.Product]: [PermAct.R, PermAct.C, PermAct.U, PermAct.D],
      [PermStaff.Stock]: [PermAct.R, PermAct.C, PermAct.U, PermAct.D],
    };

    return {
      filters: {},
      grants: combinedGrants,
      roles: Object.keys(combinedGrants),
      permissions,
    } as any;
  }
}
