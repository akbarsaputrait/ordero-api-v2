import { jwt } from '@config/jwt.config';
import { Customer } from '@db/entities/core/customer.entity';
import { Owner } from '@db/entities/owner/owner.entity';
import { StaffUser } from '@db/entities/staff/user.entity';
import { TokenException } from '@lib/exceptions/token.exception';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwt.secret,
    });
  }

  // exposing payload
  async validate(payload: any, done: VerifiedCallback) {
    const user = await Customer.findOneBy({ id: payload.sub });
    if (!user) {
      return done(new TokenException('Invalid token supplied'), false);
    }

    return done(null, user, payload.iat);
  }
}

@Injectable()
export class JwtOwnerStrategy extends PassportStrategy(Strategy, 'jwt-owner') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwt.secret,
    });
  }

  // exposing payload
  async validate(payload: any, done: VerifiedCallback) {
    const user = await Owner.findOneBy({ id: payload.sub });
    if (!user) {
      return done(new TokenException('Invalid token supplied'), false);
    }

    return done(null, user, payload.iat);
  }
}

@Injectable()
export class JwtStaffStrategy extends PassportStrategy(Strategy, 'jwt-staff') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwt.secret,
    });
  }

  // exposing payload
  async validate(payload: any, done: VerifiedCallback) {
    const user = await StaffUser.findOneBy({ id: payload.sub });
    if (!user) {
      return done(new TokenException('Invalid token supplied'), false);
    }

    return done(null, user, payload.iat);
  }
}
