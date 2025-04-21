import { Controller, Get, Post, Param } from '@nestjs/common';
import { JiraService } from './jira.service';

@Controller('jira')
export class JiraController {
    constructor(private readonly jiraService: JiraService) { }

    @Get('test-connection')
    async testConnection() {
        const result = await this.jiraService.testConnection();
        return { success: result };
    }

    @Post('create-board/:name')
    async createBoard(@Param('name') name: string) {
        return this.jiraService.createBoard(name);
    }
} 