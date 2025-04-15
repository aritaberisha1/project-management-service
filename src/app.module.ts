import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AzureDevOpsModule } from './azure-devops/azure-devops.module';
import { GitHubModule } from './github/github.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AzureDevOpsModule,
    GitHubModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
