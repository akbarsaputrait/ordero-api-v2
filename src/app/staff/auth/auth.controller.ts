import { jwt } from '@config/jwt.config';
import { OwnerGuard } from '@core/guards/owner.guard';
import { PermAct, PermOwner } from '@core/services/role.service';
import { StaffBlacklist } from '@db/entities/staff/blacklist.entity';
import { StaffSession } from '@db/entities/staff/session.entity';
import { StaffUser } from '@db/entities/staff/user.entity';
import { ValidationException } from '@lib/exceptions/validation.exception';
import { config } from '@lib/helpers/config.helper';
import { hash, hashAreEqual } from '@lib/helpers/encrypt.helper';
import { time } from '@lib/helpers/time.helper';
import { Validator } from '@lib/helpers/validator.helper';
import { Permissions } from '@lib/rbac';
import { uuid } from '@lib/uid/uuid.library';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import * as JWT from 'jsonwebtoken';
import { ExtractJwt } from 'passport-jwt';

@Controller()
export class StaffAuthController {
  // constructor(private mail: MailerService) {}

  static token(request: any): any {
    try {
      const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
      const decoded = JWT.decode(token);
      return { token, decoded };
    } catch (err) {
      return null;
    }
  }

  @Post('/login')
  async postLogin(@Body() body, @Res() response) {
    const rules = {
      username: 'required',
      password: 'required',
    };
    const validation = Validator.init({ ...body }, rules);
    if (validation.fails()) {
      throw new ValidationException(validation);
    }

    const user = await StaffUser.findOne({ where: [{ email: body.username }, { phone: body.username }] });

    if (!user) {
      throw new UnauthorizedException('Email or phone number are not found');
    }

    if (!(await hashAreEqual(user.password, body.password))) {
      throw new UnauthorizedException('Password is incorrect');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Your account was inactive by system');
    }

    const tokenId = uuid();

    const payload = {
      email: user.email,
      sub: user.id,
    };
    const singOptions = {
      jwtid: tokenId,
      issuer: config.get('API_URI'),
      audience: config.get('APP_URI'), //sha256(`${authSession.ip_address}_${authSession.user_agent}`),
      ...jwt.signOptions,
    };

    return response.data({
      access_token: JWT.sign(payload, jwt.secret, singOptions),
    });
  }

  @Delete('/logout')
  @UseGuards(OwnerGuard)
  @Permissions(`${PermOwner.Profile}@${PermAct.D}`)
  async deleteLogout(@Req() request, @Res() response) {
    const token = StaffAuthController.token(request);
    if (token) {
      const authSession = await StaffSession.findOne({
        where: {
          staff_user_id: token.decoded.sub,
          token_id: token.decoded.jti,
        },
      });

      // if exists then set to logged out
      if (authSession) {
        authSession.token_deleted = true;
        authSession.logged_out_at = time().toDate();
        await authSession.save();
      } else {
        // if not, then blacklist token
        await StaffBlacklist.store(token.token);
      }
    }

    return response.noContent();
  }

  @Post('/forgot-password')
  async postForgotPass(@Body() { email }, @Res() response) {
    const rules = {
      email: 'required|email',
    };
    const validation = Validator.init({ email }, rules);
    if (validation.fails()) {
      throw new ValidationException(validation);
    }

    const staff: StaffUser = await StaffUser.findOne({ where: { email } });
    if (staff && staff.id) {
      staff.reset_token = uuid();
      staff.reset_token_expires = time().add(24, 'hour').toDate();
      await staff.save();

      // this.mail
      //   .sendMail({
      //     to: staff.email,
      //     subject: 'Set up a new password',
      //     template: 'change-password',
      //     context: {
      //       name: staff.name,
      //       link: `${config.get('STAFF_URI')}/reset-password/${staff.reset_token}`,
      //     },
      //   })
      //   .then(() => null)
      //   .catch((error) => Logger.getInstance().notify(error));
    }

    return response.noContent();
  }

  @Post('/change-password')
  async postChangePass(@Body() body, @Res() response) {
    const rules = {
      token: 'required',
      password: 'required|confirmed|min:6',
    };
    const validation = Validator.init(body, rules);
    if (validation.fails()) {
      throw new ValidationException(validation);
    }

    const staff: StaffUser = await StaffUser.findOrFail({ where: { reset_token: body.token } });

    if (time().toDate() > staff.reset_token_expires) {
      throw new BadRequestException('This reset token has expired');
    }

    staff.password = await hash(body.password);
    staff.reset_token = null;
    staff.reset_token_expires = null;
    await staff.save();

    // await this.mail
    //   .sendMail({
    //     to: staff.email,
    //     subject: 'Changed password',
    //     template: 'changed-password',
    //     context: {
    //       name: staff.name,
    //     },
    //   })
    //   .then(() => null)
    //   .catch((error) => Logger.getInstance().notify(error));

    return response.noContent();
  }
}
