import { Me } from '@core/decorators/user.decorator';
import { StaffAuthGuard } from '@core/guards/auth.guard';
import { StaffGuard } from '@core/guards/staff.guard';
import { AuthService } from '@core/services/auth.service';
import { AwsService } from '@core/services/aws.service';
import { PermAct, PermStaff } from '@core/services/role.service';
import { Media } from '@db/entities/core/media.entity';
import { StaffUser } from '@db/entities/staff/user.entity';
import { StaffTransformer } from '@db/transformers/staff.transformer';
import { ValidationException } from '@lib/exceptions/validation.exception';
import { Validator } from '@lib/helpers/validator.helper';
import { Permissions } from '@lib/rbac';
import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { isEmpty } from 'lodash';

@Controller()
@UseGuards(StaffAuthGuard())
export class StaffProfileController {
  constructor(private auth: AuthService, private aws: AwsService) {}

  @Get()
  @UseGuards(StaffGuard)
  @Permissions(`${PermStaff.Profile}@${PermAct.R}`)
  async me(@Me() me: StaffUser, @Res() response) {
    return response.item(me, StaffTransformer);
  }

  @Put()
  @Permissions(`${PermStaff.Profile}@${PermAct.U}`)
  async update(@Param() param, @Body() body, @Res() response, @Me() me: StaffUser) {
    const rules = {
      name: 'required|safe_text',
      phone: 'required|phone',
    };
    const validation = Validator.init(body, rules);
    if (validation.fails()) {
      throw new ValidationException(validation);
    }

    me.name = body.name;
    me.phone = body.phone;
    await me.save();

    await response.item(me, StaffTransformer);
  }

  @Post('/avatar')
  @UseGuards(StaffGuard)
  @Permissions(`${PermStaff.Profile}@${PermAct.C}`)
  async uploadAvatar(@Req() request, @Res() response, @Me() me: StaffUser) {
    const file = await this.aws.uploadFile(request, response, 'image', { dynamicPath: `staff/${me.id}/avatar` });
    if (!file || isEmpty(file)) {
      throw new BadRequestException('Unable to upload image');
    }

    if (await me.image) {
      await this.aws.removeFile(await me.image);
    }

    await Media.build<StaffUser>(me, file);

    await response.item(me, StaffTransformer);
  }

  @Delete('/avatar')
  @UseGuards(StaffGuard)
  @Permissions(`${PermStaff.Profile}@${PermAct.D}`)
  async deleteAvatar(@Res() response, @Me() me: StaffUser) {
    await Media.delete({ staff_user_id: me.id });
    return response.noContent();
  }
}
