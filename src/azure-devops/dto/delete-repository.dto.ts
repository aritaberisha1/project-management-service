import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteRepositoryDto {
    @ApiProperty({ description: 'Name of the Azure DevOps project' })
    @IsNotEmpty()
    @IsString()
    projectName: string;

    @ApiProperty({ description: 'Name of the repository to delete' })
    @IsNotEmpty()
    @IsString()
    repoName: string;
} 