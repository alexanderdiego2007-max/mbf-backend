import { Model } from 'mongoose';
import { Event, EventDocument } from './event.schema';
import { CreateEventDto } from './create-event.dto';
import { UpdateEventDto } from './update-event.dto';
export declare class EventsService {
    private eventModel;
    constructor(eventModel: Model<EventDocument>);
    create(createEventDto: CreateEventDto): Promise<Event>;
    findAll(): Promise<Event[]>;
    findByCriteria(criteria: string): Promise<Event[]>;
    update(id: string, updateEventDto: UpdateEventDto): Promise<Event>;
    delete(id: string): Promise<Event>;
}
