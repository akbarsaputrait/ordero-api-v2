import { Rest } from '@core/decorators/restaurant.decorator';
import { StaffAuthGuard } from '@core/guards/auth.guard';
import { StaffGuard } from '@core/guards/staff.guard';
import { PermAct, PermStaff } from '@core/services/role.service';
import { RestaurantTransformer } from '@db/transformers/restaurant.transformer';
import { Permissions } from '@lib/rbac';
import { Controller, Get, Res, UseGuards } from '@nestjs/common';

@Controller()
@UseGuards(StaffAuthGuard())
export class StaffRestaurantController {
  @Get()
  @UseGuards(StaffGuard)
  @Permissions(`${PermStaff.Restaurant}@${PermAct.R}`)
  async index(@Rest() rest, @Res() response) {
    return response.item(rest, RestaurantTransformer);
  }
}
