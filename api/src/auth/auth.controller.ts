import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Public } from './public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('sync')
  @ApiOperation({ summary: 'Sync user from frontend (NextAuth)' })
  async syncUser(@Body() body: { email: string; name: string }) {
    const user = await this.authService.validateUserByEmail(body.email, body.name);
    return this.authService.login(user);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@Request() req) {
    return req.user;
  }
}
