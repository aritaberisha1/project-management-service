import { Body, Controller, Post, Param, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { GitHubService } from './github.service';
import { CreateRepositoryFromTemplateDto } from './dto/create-repository-from-template.dto';

@ApiTags('github')
@Controller('github')
export class GitHubController {
    constructor(private readonly githubService: GitHubService) { }

    @Post('templates/:owner/:repo/generate')
    @ApiOperation({ summary: 'Create a new repository from a template' })
    @ApiParam({ name: 'owner', description: 'Owner of the template repository' })
    @ApiParam({ name: 'repo', description: 'Name of the template repository' })
    @ApiResponse({ status: 201, description: 'Repository created successfully' })
    @ApiResponse({ status: 404, description: 'Template repository not found' })
    async createRepositoryFromTemplate(
        @Param('owner') templateOwner: string,
        @Param('repo') templateRepo: string,
        @Body() createRepoDto: CreateRepositoryFromTemplateDto,
    ): Promise<any> {
        return await this.githubService.createRepositoryFromTemplate(
            templateOwner,
            templateRepo,
            createRepoDto,
        );
    }

    @Post('repositories')
    @ApiOperation({ summary: 'Create a new GitHub repository' })
    @ApiResponse({ status: 201, description: 'Repository created successfully' })
    @ApiResponse({ status: 400, description: 'Invalid request' })
    async createRepository(
        @Body() createRepoDto: CreateRepositoryFromTemplateDto,
    ): Promise<any> {
        const owner = createRepoDto.owner || 'current-user';
        return await this.githubService.createRepository(owner, createRepoDto);
    }

    @Get('templates/:owner/:repo/repositories')
    @ApiOperation({ summary: 'Get repositories that may have been generated from a template' })
    @ApiParam({ name: 'owner', description: 'Owner of the template repository' })
    @ApiParam({ name: 'repo', description: 'Name of the template repository' })
    @ApiResponse({ status: 200, description: 'Successfully retrieved repositories' })
    @ApiResponse({ status: 404, description: 'Template repository not found' })
    async getRepositoriesFromTemplate(
        @Param('owner') templateOwner: string,
        @Param('repo') templateRepo: string,
    ): Promise<any[]> {
        return await this.githubService.getRepositoriesFromTemplate(
            templateOwner,
            templateRepo,
        );
    }

    @Get('user/repositories')
    @ApiOperation({ summary: 'Get all repositories for the authenticated user' })
    @ApiResponse({ status: 200, description: 'Successfully retrieved repositories' })
    async getUserRepositories(): Promise<any[]> {
        return await this.githubService.getUserRepositories();
    }
} 