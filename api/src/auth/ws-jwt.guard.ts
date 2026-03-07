import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      
      // Get token from handshake auth or headers
      const authToken = client.handshake.auth?.token || 
                        client.handshake.headers?.authorization?.split(' ')[1];

      if (!authToken) {
        throw new WsException('Unauthorized: No token provided');
      }

      const payload = await this.jwtService.verifyAsync(authToken, {
        secret: process.env.JWT_SECRET || 'vibe-secret-key-change-me'
      });
      
      // Store user information in socket object
      client.data.user = payload;
      return true;
    } catch (err) {
      throw new WsException('Unauthorized: Invalid token');
    }
  }
}
