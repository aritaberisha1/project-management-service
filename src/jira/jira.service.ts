import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class JiraService {
    private readonly baseUrl: string;
    private readonly email: string;
    private readonly token: string;
    private readonly logger = new Logger(JiraService.name);
    private accountId: string | null = null;

    constructor() {
        this.baseUrl = process.env.JIRA_BASE_URL || '';
        this.email = process.env.JIRA_EMAIL || '';
        this.token = process.env.JIRA_API_TOKEN || '';

        this.logger.log(`Jira service initialized with base URL: ${this.baseUrl}`);
        if (!this.baseUrl || !this.email || !this.token) {
            this.logger.warn('Missing Jira configuration values! Check your environment variables.');
        }
    }

    /**
     * Get auth headers for Jira API requests
     */
    private getAuthHeaders() {
        const auth = Buffer.from(`${this.email}:${this.token}`).toString('base64');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${auth}`,
            'Accept': 'application/json',
        };
    }

    /**
     * Get current user's account ID
     */
    async getAccountId(): Promise<string> {
        if (this.accountId) {
            return this.accountId;
        }

        try {
            const response = await axios.get(
                `${this.baseUrl}/rest/api/3/myself`,
                { headers: this.getAuthHeaders() }
            );

            this.accountId = response.data.accountId;
            this.logger.log(`Retrieved account ID: ${this.accountId}`);
            return this.accountId ?? '';
        } catch (error) {
            this.logger.error(`Failed to get account ID: ${error.message}`);
            throw new Error('Unable to get Jira account ID for project creation');
        }
    }

    /**
     * Creates a new Jira project or finds an existing one
     */
    async createOrGetProject(name: string): Promise<any> {
        try {
            // First, try to get the project if it already exists
            try {
                const response = await axios.get(
                    `${this.baseUrl}/rest/api/3/project/search?query=${encodeURIComponent(name)}`,
                    { headers: this.getAuthHeaders() }
                );

                // Check if the project with exact name exists
                const existingProject = response.data.values.find(
                    project => project.name.toLowerCase() === name.toLowerCase()
                );

                if (existingProject) {
                    this.logger.log(`Found existing project: ${existingProject.name} (${existingProject.key})`);
                    return existingProject;
                }
            } catch (err) {
                this.logger.warn(`Error searching for project: ${err.message}`);
                // Continue to create a new project
            }

            // Create a new project
            const key = name.replace(/[^A-Z0-9]/gi, '').substring(0, 10).toUpperCase();

            // Get the account ID for the project lead
            const accountId = await this.getAccountId();

            this.logger.log(`Creating new Jira project with name: ${name}, key: ${key}, and lead: ${accountId}`);

            const projectResponse = await axios.post(
                `${this.baseUrl}/rest/api/3/project`,
                {
                    key: key,
                    name: name,
                    projectTypeKey: 'software',
                    leadAccountId: accountId,
                    projectTemplateKey: 'com.pyxis.greenhopper.jira:basic-software-development-template',
                },
                { headers: this.getAuthHeaders(), validateStatus: () => true }
            );

            if (projectResponse.status >= 400) {
                this.logger.error(`Project creation error: ${JSON.stringify(projectResponse.data)}`);
                throw new Error(`Failed to create project: ${projectResponse.statusText}`);
            }

            this.logger.log(`Project created: ${projectResponse.data.name} (${projectResponse.data.key})`);
            return projectResponse.data;
        } catch (error) {
            this.logger.error(`Failed to create project: ${error.message}`);
            if (error.response) {
                this.logger.error(`Error details: ${JSON.stringify(error.response.data)}`);
            }
            throw new Error(`Failed to create Jira project: ${error.message}`);
        }
    }

    /**
     * Creates a filter for the board
     */
    async createFilter(name: string, projectKey: string): Promise<any> {
        try {
            const jql = `project = ${projectKey} ORDER BY created DESC`;

            // Create filter without explicit sharing permissions first
            const response = await axios.post(
                `${this.baseUrl}/rest/api/3/filter`,
                {
                    name: `${name} Filter`,
                    description: `Filter for ${name} board`,
                    jql: jql,
                    // Remove global sharing permission since it's not allowed
                    sharePermissions: [] // No sharing by default
                },
                {
                    headers: this.getAuthHeaders(),
                    validateStatus: () => true
                }
            );

            if (response.status >= 400) {
                this.logger.error(`Filter creation error: ${JSON.stringify(response.data)}`);
                throw new Error(`Failed to create filter: ${response.statusText}`);
            }

            this.logger.log(`Filter created: ${response.data.name} (${response.data.id})`);
            return response.data;
        } catch (error) {
            this.logger.error(`Failed to create filter: ${error.message}`);
            if (error.response) {
                this.logger.error(`Error details: ${JSON.stringify(error.response.data)}`);
            }
            throw new Error(`Failed to create Jira filter: ${error.message}`);
        }
    }

    /**
     * Creates a new Jira board with the specified name
     */
    async createBoard(name: string): Promise<any> {
        try {
            this.logger.log(`Starting complete Jira board creation process for: ${name}`);

            // Step 1: Create or get project
            const project = await this.createOrGetProject(name);

            // Step 2: Create a filter
            const filter = await this.createFilter(name, project.key);

            // Step 3: Create the board
            this.logger.log(`Creating board with name: ${name}, project: ${project.key}, filter: ${filter.id}`);

            const response = await axios.post(
                `${this.baseUrl}/rest/agile/1.0/board`,
                {
                    name: name,
                    type: 'scrum',
                    filterId: filter.id,
                    location: {
                        projectKeyOrId: project.key,
                        type: 'project'
                    }
                },
                {
                    headers: this.getAuthHeaders(),
                    validateStatus: () => true,
                }
            );

            // Log the status and response
            this.logger.log(`Board creation response status: ${response.status}`);
            if (response.status >= 400) {
                this.logger.error(`Board creation error: ${JSON.stringify(response.data)}`);
                throw new Error(`Jira API returned status ${response.status}: ${response.statusText}`);
            }

            this.logger.log(`Successfully created Jira board: ${name}`);
            return {
                board: response.data,
                project: project,
                filter: filter
            };
        } catch (error) {
            this.logger.error(`Failed to create Jira board: ${error.message}`);

            if (error.response) {
                this.logger.error(`Error details: Status ${error.response.status}`);
                this.logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
            }

            throw new Error(`Failed to create Jira board: ${error.message}`);
        }
    }

    /**
     * Check if Jira connection is working properly
     */
    async testConnection(): Promise<boolean> {
        try {
            const response = await axios.get(
                `${this.baseUrl}/rest/api/3/myself`,
                { headers: this.getAuthHeaders() }
            );

            this.logger.log(`Jira connection test successful. Connected as: ${response.data.displayName}`);
            return true;
        } catch (error) {
            this.logger.error(`Jira connection test failed: ${error.message}`);
            return false;
        }
    }
} 