import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDocumentDto {
    @ApiProperty({ description: '문서의 마크다운 또는 JSON 문자열 내용' })
    @IsString()
    @IsNotEmpty()
    content: string;
}
