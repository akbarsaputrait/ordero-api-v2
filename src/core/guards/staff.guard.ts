import { Role } from '@db/entities/core/role.entity';
import { Location } from '@db/entities/owner/location.entity';
import { Restaurant } from '@db/entities/owner/restaurant.entity';
import { StaffUser } from '@db/entities/staff/user.entity';
import { GuardException } from '@lib/exceptions/guard.exception';
import { TokenException } from '@lib/exceptions/token.exception';
import { ParamsFilter, RBAC_REQUEST_FILTER, RbacService } from '@lib/rbac';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { get } from 'lodash';

const validateRestaurant = async (request: any) => {
  const user: StaffUser = request.user;
  if (!user) {
    throw new TokenException('Getting user was failed');
  }

  const restaurantId =
    get(request, 'params.restaurant_id') || get(request, 'headers.x-restaurant-id') || get(user, 'restaurant_id');
  if (!restaurantId) {
    throw new GuardException('Restaurant is not found');
  }

  const restaurant = await Restaurant.findOneBy({ id: restaurantId });
  if (!restaurant) {
    throw new TokenException('Getting restaurant was failed');
  }

  const roles = await Role.findByRestaurant(restaurant);
  const role = roles.find((row) => row.slug !== 'owner');
  if (!role) {
    throw new GuardException('Getting role was failed');
  }

  let location: Location = null;
  if (user.location_id) {
    location = await Location.findOneBy({ id: user.location_id });
  }

  return { user, restaurant, roles, role, location };
};

export const setupPermission = async (request) => {
  const { restaurant, role, roles, location } = await validateRestaurant(request);

  // assign additional data to request object
  Object.assign(request, {
    current: {
      restaurant: restaurant,
      role,
      location,
    },
  });

  // filter based on available modules on plan
  const grants = roles.reduce((acc, cur) => {
    acc[cur.slug] = cur.permissions || [];
    return acc;
  }, {});

  // assign grants to request helper
  (request as any).requestContext.set('grants', grants);

  const filter = new ParamsFilter();
  filter.setParam(RBAC_REQUEST_FILTER, { ...request });

  return { restaurant, role, roles, location, filter };
};

@Injectable()
export class StaffGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly rbacService: RbacService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const permissions = this.reflector.get<string[]>('Permissions', context.getHandler());
    if (!permissions) {
      throw new GuardException('Bad permission');
    }

    const { role, filter } = await setupPermission(request);
    if (!(await this.rbacService.getRole(role.slug, filter)).can(...permissions)) {
      throw new GuardException('Forbidden resource');
    }

    return true;
  }
}
