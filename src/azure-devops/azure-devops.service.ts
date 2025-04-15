import { Injectable, NotFoundException } from '@nestjs/common';
import axios, { AxiosError } from 'axios';

@Injectable()
export class AzureDevOpsService {
    private readonly baseUrl: string;
    private readonly pat: string;
    private readonly organization: string;

    constructor() {
        this.organization = process.env.AZURE_DEVOPS_ORG ?? '';
        this.pat = process.env.AZURE_DEVOPS_PAT ?? '';
        this.baseUrl = `https://dev.azure.com/${this.organization}`;
    }

    private async getProjectId(projectName: string): Promise<string> {
        const url = `${this.baseUrl}/_apis/projects/${projectName}?api-version=7.1-preview.1`;
        const response = await axios.get(url, {
            auth: {
                username: '',
                password: this.pat,
            },
        });
        return response.data.id;
    }

    async createRepository(projectName: string, repoName: string) {
        try {
            const projectId = await this.getProjectId(projectName);
            const url = `${this.baseUrl}/${projectName}/_apis/git/repositories?api-version=7.1-preview.1`;

            const response = await axios.post(
                url,
                {
                    name: repoName,
                    project: {
                        id: projectId,
                    },
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    auth: {
                        username: '',
                        password: this.pat,
                    },
                },
            );

            return response.data;
        } catch (error) {
            throw new Error(`Failed to create repository: ${error.message}`);
        }
    }

    private async getRepositoryId(projectName: string, repoName: string): Promise<string> {
        try {
            const url = `${this.baseUrl}/${projectName}/_apis/git/repositories/${repoName}?api-version=7.1-preview.1`;
            const response = await axios.get(url, {
                auth: {
                    username: '',
                    password: this.pat,
                },
            });
            return response.data.id;
        } catch (error) {
            if ((error as AxiosError).response?.status === 404) {
                throw new NotFoundException(`Repository '${repoName}' not found in project '${projectName}'`);
            }
            throw error;
        }
    }

    async deleteRepository(projectName: string, repoName: string) {
        try {
            const repoId = await this.getRepositoryId(projectName, repoName);
            const url = `${this.baseUrl}/${projectName}/_apis/git/repositories/${repoId}?api-version=7.1-preview.1`;

            await axios.delete(url, {
                auth: {
                    username: '',
                    password: this.pat,
                },
            });

            return { message: 'Repository deleted successfully' };
        } catch (error) {
            throw new Error(`Failed to delete repository: ${error.message}`);
        }
    }

    async updateRepository(projectName: string, repoName: string, newName: string) {
        try {
            const repoId = await this.getRepositoryId(projectName, repoName);
            const url = `${this.baseUrl}/${projectName}/_apis/git/repositories/${repoId}?api-version=7.1-preview.1`;

            const response = await axios.patch(
                url,
                {
                    name: newName,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    auth: {
                        username: '',
                        password: this.pat,
                    },
                },
            );

            return response.data;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new Error(`Failed to update repository: ${error.message}`);
        }
    }
} 