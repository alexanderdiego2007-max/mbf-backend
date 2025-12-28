import { EventsService } from './events.service';
import { CreateEventDto } from './create-event.dto';
import { UpdateEventDto } from './update-event.dto';
export declare class EventsController {
    private readonly eventsService;
    constructor(eventsService: EventsService);
    create(createEventDto: CreateEventDto): Promise<import("./event.schema").Event>;
    findAll(): Promise<import("./event.schema").Event[]>;
    findByCriteria(criteria: string): Promise<import("./event.schema").Event[]>;
    update(id: string, updateEventDto: UpdateEventDto): Promise<import("./event.schema").Event>;
    delete(id: string): Promise<import("./event.schema").Event>;
}
