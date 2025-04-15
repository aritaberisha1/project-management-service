import { Injectable, NotFoundException } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { CreateRepositoryFromTemplateDto } from './dto/create-repository-from-template.dto';

@Injectable()
export class GitHubService {
    private readonly baseUrl: string;
    private readonly token: string;

    constructor() {
        this.token = process.env.GITHUB_PERSONAL_ACCESS_TOKEN || '';
        this.baseUrl = 'https://api.github.com';
    }

    /**
     * Creates a new repository from a template
     * @param templateOwner - Owner of the template repository
     * @param templateRepo - Name of the template repository
     * @param createRepoDto - Repository creation options
     * @returns The created repository data
     */
    async createRepositoryFromTemplate(
        templateOwner: string,
        templateRepo: string,
        createRepoDto: CreateRepositoryFromTemplateDto,
    ): Promise<any> {
        try {
            const url = `${this.baseUrl}/repos/${templateOwner}/${templateRepo}/generate`;

            const response = await axios.post(
                url,
                {
                    owner: createRepoDto.owner || templateOwner,
                    name: createRepoDto.name,
                    description: createRepoDto.description,
                    private: createRepoDto.private,
                    include_all_branches: createRepoDto.includeAllBranches || false,
                },
                {
                    headers: {
                        'Accept': 'application/vnd.github.v3+json',
                        'Authorization': `token ${this.token}`,
                        'Content-Type': 'application/json',
                        'X-GitHub-Api-Version': '2022-11-28',
                    },
                },
            );

            return response.data;
        } catch (error) {
            if (error.response?.status === 404) {
                throw new NotFoundException(`Template repository '${templateRepo}' not found for owner '${templateOwner}'`);
            }
            throw new Error(`Failed to create repository from template: ${error.message}`);
        }
    }

    /**
     * Creates a new repository
     * @param createRepoDto - Repository creation options
     * @returns The created repository data
     */
    async createRepository(
        owner: string,
        createRepoDto: CreateRepositoryFromTemplateDto,
    ): Promise<any> {
        try {
            const url = `${this.baseUrl}/user/repos`;

            const response = await axios.post(
                url,
                {
                    name: createRepoDto.name,
                    description: createRepoDto.description,
                    private: createRepoDto.private,
                    auto_init: createRepoDto.autoInit || false,
                },
                {
                    headers: {
                        'Accept': 'application/vnd.github.v3+json',
                        'Authorization': `token ${this.token}`,
                        'Content-Type': 'application/json',
                        'X-GitHub-Api-Version': '2022-11-28',
                    },
                },
            );

            return response.data;
        } catch (error) {
            throw new Error(`Failed to create repository: ${error.message}`);
        }
    }

    /**
     * Attempts to get repositories that were likely generated from a template
     * Note: GitHub API doesn't provide direct filtering for template-generated repos,
     * so this is a best-effort approach
     * 
     * @param templateOwner - Owner of the template repository 
     * @param templateRepo - Name of the template repository
     * @returns Array of repositories that may have been generated from the template
     */
    async getRepositoriesFromTemplate(
        templateOwner: string,
        templateRepo: string,
    ): Promise<any[]> {
        try {
            // First, get information about the template repository
            const templateUrl = `${this.baseUrl}/repos/${templateOwner}/${templateRepo}`;
            const templateInfo = await axios.get(templateUrl, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'Authorization': `token ${this.token}`,
                    'X-GitHub-Api-Version': '2022-11-28',
                },
            });

            // Get all repositories for the authenticated user (simplifying the parameters)
            const reposUrl = `${this.baseUrl}/user/repos?per_page=100`;
            const reposResponse = await axios.get(reposUrl, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'Authorization': `token ${this.token}`,
                    'X-GitHub-Api-Version': '2022-11-28',
                },
            });

            // Filter repositories that might be derived from the template
            const templateCreatedAt = new Date(templateInfo.data.created_at);
            const potentialDerivedRepos = reposResponse.data.filter(repo => {
                const repoCreatedAt = new Date(repo.created_at);
                return repoCreatedAt > templateCreatedAt;
            });

            return potentialDerivedRepos;
        } catch (error) {
            if (error.response?.status === 404) {
                throw new NotFoundException(`Template repository '${templateRepo}' not found for owner '${templateOwner}'`);
            }
            throw new Error(`Failed to retrieve repositories: ${error.message}`);
        }
    }

    /**
     * Gets all repositories for the authenticated user
     * @returns List of repositories
     */
    async getUserRepositories(): Promise<any[]> {
        try {
            // Simplifying the API request to avoid parameter compatibility issues
            const url = `${this.baseUrl}/user/repos?per_page=100`;
            const response = await axios.get(url, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'Authorization': `token ${this.token}`,
                    'X-GitHub-Api-Version': '2022-11-28',
                },
            });

            return response.data;
        } catch (error) {
            throw new Error(`Failed to fetch user repositories: ${error.message}`);
        }
    }
} 