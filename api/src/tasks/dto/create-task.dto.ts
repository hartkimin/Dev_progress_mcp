import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskDto {
    @ApiProperty({ description: '프로젝트 ID' })
    @IsString()
    projectId: string;

    @ApiProperty({ description: '태스크 제목' })
    @IsString()
    title: string;

    @ApiPropertyOptional({ description: '카테고리 (Backend, Frontend 등)' })
    @IsOptional()
    @IsString()
    category?: string;

    @ApiPropertyOptional({ description: 'Vibe Coding 페이즈' })
    @IsOptional()
    @IsString()
    phase?: string;

    @ApiPropertyOptional({ description: '태스크 유형 (Prompting, Coding 등)' })
    @IsOptional()
    @IsString()
    taskType?: string;

    @ApiPropertyOptional({ description: '태스크 규모 (Epic, Story, Task)' })
    @IsOptional()
    @IsString()
    scale?: string;

    @ApiPropertyOptional({ description: '상세 설명' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ description: 'TODO 단계 수행 내역 (비우면 템플릿 자동 삽입)' })
    @IsOptional()
    @IsString()
    workTodo?: string;

    @ApiPropertyOptional({ description: 'IN_PROGRESS 단계 수행 내역 (비우면 템플릿 자동 삽입)' })
    @IsOptional()
    @IsString()
    workInProgress?: string;

    @ApiPropertyOptional({ description: 'REVIEW 단계 수행 내역 (비우면 템플릿 자동 삽입)' })
    @IsOptional()
    @IsString()
    workReview?: string;

    @ApiPropertyOptional({ description: 'DONE 단계 수행 내역 (비우면 템플릿 자동 삽입)' })
    @IsOptional()
    @IsString()
    workDone?: string;

    @ApiPropertyOptional({ description: '초기 상태', enum: ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] })
    @IsOptional()
    @IsEnum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'])
    status?: string;

    @ApiPropertyOptional({ description: '시작 예정일 (ISO 8601)' })
    @IsOptional()
    @IsString()
    startDate?: string;

    @ApiPropertyOptional({ description: '마감 예정일 (ISO 8601)' })
    @IsOptional()
    @IsString()
    dueDate?: string;
}
