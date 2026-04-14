import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTaskStatusDto {
    @ApiProperty({ description: '새로운 상태', enum: ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] })
    @IsEnum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'])
    status: string;
}

export class UpdateTaskDetailsDto {
    @ApiPropertyOptional({ description: '태스크 제목' })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional({ description: '태스크 주요 설명' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ description: '작업 전 내용 (Before Work)' })
    @IsOptional()
    @IsString()
    beforeWork?: string;

    @ApiPropertyOptional({ description: '작업 후 성과 (After Work)' })
    @IsOptional()
    @IsString()
    afterWork?: string;

    @ApiPropertyOptional({ description: 'TODO 상태 수행 내역' })
    @IsOptional()
    @IsString()
    workTodo?: string;

    @ApiPropertyOptional({ description: 'IN_PROGRESS 상태 수행 내역' })
    @IsOptional()
    @IsString()
    workInProgress?: string;

    @ApiPropertyOptional({ description: 'REVIEW 상태 수행 내역' })
    @IsOptional()
    @IsString()
    workReview?: string;

    @ApiPropertyOptional({ description: 'DONE 상태 수행 내역' })
    @IsOptional()
    @IsString()
    workDone?: string;

    @ApiPropertyOptional({ description: 'Vibe Coding 페이즈' })
    @IsOptional()
    @IsString()
    phase?: string;

    @ApiPropertyOptional({ description: '태스크 유형' })
    @IsOptional()
    @IsString()
    taskType?: string;

    @ApiPropertyOptional({ description: '개략적인 규모' })
    @IsOptional()
    @IsString()
    scale?: string;

    @ApiPropertyOptional({ description: '시작일' })
    @IsOptional()
    @IsString()
    startDate?: string;

    @ApiPropertyOptional({ description: '마감일' })
    @IsOptional()
    @IsString()
    dueDate?: string;
}
