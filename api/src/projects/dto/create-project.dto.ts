import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
    @ApiProperty({ description: '프로젝트의 이름', example: 'VibePlanner 고도화' })
    @IsString()
    name: string;

    @ApiProperty({ description: '프로젝트 설명', required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ description: '생성 모드 (newbie 모드일 경우 가이드 태스크가 자동 추가됨)', enum: ['newbie', 'import'], default: 'newbie' })
    @IsEnum(['newbie', 'import'])
    @IsOptional()
    mode?: 'newbie' | 'import';
}
