import { IsIn, IsInt, IsObject, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const PLAN_REVIEW_KINDS = ['ceo', 'eng', 'design', 'devex'] as const;
export const PLAN_REVIEW_DECISIONS = ['accept', 'revise', 'reject'] as const;

export class CreatePlanReviewDto {
  @ApiProperty({ enum: PLAN_REVIEW_KINDS })
  @IsIn(PLAN_REVIEW_KINDS as readonly string[])
  kind!: (typeof PLAN_REVIEW_KINDS)[number];

  @ApiPropertyOptional() @IsOptional() @IsString() specPath?: string;

  @ApiPropertyOptional({ minimum: 0, maximum: 10 })
  @IsOptional() @IsInt() @Min(0) @Max(10)
  score?: number;

  @ApiPropertyOptional({ enum: PLAN_REVIEW_DECISIONS })
  @IsOptional() @IsIn(PLAN_REVIEW_DECISIONS as readonly string[])
  decision?: (typeof PLAN_REVIEW_DECISIONS)[number];

  @ApiProperty({ description: '체크리스트 응답 전체 (JSON)' })
  @IsObject()
  payload!: Record<string, unknown>;

  @ApiPropertyOptional() @IsOptional() @IsString() reviewer?: string;
}
