import { Document } from 'mongoose';
export declare class Event {
    title: string;
    date: string;
    type: string;
    time: string;
}
export type EventDocument = Event & Document;
export declare const EventSchema: import("mongoose").Schema<Event, import("mongoose").Model<Event, any, any, any, Document<unknown, any, Event, any> & Event & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Event, Document<unknown, {}, import("mongoose").FlatRecord<Event>, {}> & import("mongoose").FlatRecord<Event> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
