import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRepositoryFromTemplateDto {
    @ApiProperty({ description: 'Name of the repository to create' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ description: 'Owner of the new repository', required: false })
    @IsOptional()
    @IsString()
    owner?: string;

    @ApiProperty({ description: 'Description of the repository', required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ description: 'Whether the repository should be private', default: false })
    @IsOptional()
    @IsBoolean()
    private?: boolean;

    @ApiProperty({ description: 'Whether to include all branches from the template', default: false })
    @IsOptional()
    @IsBoolean()
    includeAllBranches?: boolean;

    @ApiProperty({ description: 'Whether to initialize the repository with a README', default: false })
    @IsOptional()
    @IsBoolean()
    autoInit?: boolean;
} 