import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRepositoryDto {
    @ApiProperty({ description: 'New name for the repository' })
    @IsNotEmpty()
    @IsString()
    newName: string;
} 