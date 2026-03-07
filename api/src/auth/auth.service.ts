import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // For this Phase 1, we will implement a simple "exchange" or "get-token" mechanism
  // In a real production app with NextAuth, NextAuth will handle the provider (Google/GitHub)
  // and we'll have an endpoint that either validates the NextAuth session or 
  // we use a shared secret/asymmetric key to validate the NextAuth JWT.
  
  // Here we'll provide a way to create/get a user and return a JWT for the frontend.
  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async validateUserByEmail(email: string, name: string) {
    let user = await this.usersService.findOneByEmail(email);
    if (!user) {
      user = await this.usersService.create({ email, name });
    }
    return user;
  }
}
