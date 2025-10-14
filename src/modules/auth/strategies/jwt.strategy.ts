import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('secret');

    if (!secret) {
      throw new Error(
        'JWT secret is not defined. Please set JWT_SECRET in your environment or configuration.',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret, // si no está configurado, lanzará un error
    });
  }

  async validate(payload: any) {
    return { user_id: payload.sub, email: payload.email, role: payload.role };
  }
}