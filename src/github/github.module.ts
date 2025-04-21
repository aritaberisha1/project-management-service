import { Module } from '@nestjs/common';
import { GitHubController } from './github.controller';
import { GitHubService } from './github.service';
import { JiraModule } from '../jira/jira.module';

@Module({
    imports: [JiraModule],
    controllers: [GitHubController],
    providers: [GitHubService],
    exports: [GitHubService],
})
export class GitHubModule { } 