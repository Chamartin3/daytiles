export interface DateContext {
    isPresent: boolean;
    isPast: boolean;
    isFuture: boolean;
    dayOfWeek: number;
    month: number;
    year: number;
    dayOfYear: number;
    weekOfYear: number;
}
export type EventInfo = {
    color?: string;
    note?: string;
    wiki?: string;
    type?: string;
};
export type EventsDict = Record<string, EventInfo[]>;
export type DateInput = Date | string;
export declare function stringToDate(datestring: string, year: number, last?: boolean): Date;
export declare function getRangeDates(initial: DateInput, final: DateInput, year?: number | null): {
    startDate: Date;
    endDate: Date;
};
export declare function getEvents(date: Date, events: EventsDict): EventInfo[];
export declare function getDateContext(date: Date, today?: Date): DateContext;
//# sourceMappingURL=dates.d.ts.map