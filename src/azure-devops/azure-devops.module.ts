import { Module } from '@nestjs/common';
import { AzureDevOpsController } from './azure-devops.controller';
import { AzureDevOpsService } from './azure-devops.service';

@Module({
    controllers: [AzureDevOpsController],
    providers: [AzureDevOpsService],
    exports: [AzureDevOpsService],
})
export class AzureDevOpsModule { } 