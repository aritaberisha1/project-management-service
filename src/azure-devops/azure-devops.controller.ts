import { Controller, Post, Delete, Patch, Body, Param } from '@nestjs/common';
import { AzureDevOpsService } from './azure-devops.service';
import { CreateRepositoryDto } from './dto/create-repository.dto';
import { UpdateRepositoryDto } from './dto/update-repository.dto';
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';

@ApiTags('azure-devops')
@Controller('azure-devops')
export class AzureDevOpsController {
    constructor(private readonly azureDevOpsService: AzureDevOpsService) { }

    @Post('projects/:projectName/repositories')
    @ApiOperation({ summary: 'Create a new repository in Azure DevOps' })
    @ApiParam({ name: 'projectName', description: 'Name of the Azure DevOps project' })
    @ApiResponse({ status: 201, description: 'Repository created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async createRepository(
        @Param('projectName') projectName: string,
        @Body() createRepositoryDto: CreateRepositoryDto
    ) {
        return await this.azureDevOpsService.createRepository(
            projectName,
            createRepositoryDto.repoName,
        );
    }

    @Delete('projects/:projectName/repositories/:repoName')
    @ApiOperation({ summary: 'Delete a repository in Azure DevOps' })
    @ApiParam({ name: 'projectName', description: 'Name of the Azure DevOps project' })
    @ApiParam({ name: 'repoName', description: 'Name of the repository to delete' })
    @ApiResponse({ status: 200, description: 'Repository deleted successfully' })
    @ApiResponse({ status: 404, description: 'Repository not found' })
    async deleteRepository(
        @Param('projectName') projectName: string,
        @Param('repoName') repoName: string,
    ) {
        return await this.azureDevOpsService.deleteRepository(projectName, repoName);
    }

    @Patch('projects/:projectName/repositories/:repoName')
    @ApiOperation({ summary: 'Update repository name in Azure DevOps' })
    @ApiParam({ name: 'projectName', description: 'Name of the Azure DevOps project' })
    @ApiParam({ name: 'repoName', description: 'Current name of the repository' })
    @ApiResponse({ status: 200, description: 'Repository updated successfully' })
    @ApiResponse({ status: 404, description: 'Repository not found' })
    async updateRepository(
        @Param('projectName') projectName: string,
        @Param('repoName') repoName: string,
        @Body() updateRepositoryDto: UpdateRepositoryDto,
    ) {
        return await this.azureDevOpsService.updateRepository(
            projectName,
            repoName,
            updateRepositoryDto.newName,
        );
    }
} 