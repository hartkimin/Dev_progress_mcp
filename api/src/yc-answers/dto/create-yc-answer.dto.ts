import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateYcAnswerDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(4000) q1Demand?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(4000) q2StatusQuo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(4000) q3Specific?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(4000) q4Wedge?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(4000) q5Observation?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(4000) q6FutureFit?: string;
}
