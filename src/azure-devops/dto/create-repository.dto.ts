import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRepositoryDto {
    @ApiProperty({ description: 'Name of the repository to create' })
    @IsNotEmpty()
    @IsString()
    repoName: string;
} 