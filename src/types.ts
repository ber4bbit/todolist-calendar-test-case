import type {CalendarDate} from "@internationalized/date";

/** Interface that represents Task entity */
export interface ITask {
    id: number,
    title: string,
    description: string,
    date: CalendarDate,
    isCompleted: boolean,
}