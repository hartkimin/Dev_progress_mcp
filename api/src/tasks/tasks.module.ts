import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { EventsModule } from '../events/events.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [EventsModule, NotificationsModule],
    controllers: [TasksController],
    providers: [TasksService],
})
export class TasksModule { }
