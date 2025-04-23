import type {CalendarDate} from "@internationalized/date";

export interface ITask {
    id: number,
    title: string,
    description: string,
    date: CalendarDate,
    isCompleted: boolean
}

/**
 * Имортируемые и экспортируемые объекты задач для удобства имеют
 * свойство date в формате строки, так как легче задать дату формата
 * '2025-01-01', а затем привести к нужному формату при добавлении в список задач
 * */
export interface IImportedOrExportedTask extends Omit<ITask, 'date'> {
    date: string
}

export interface ITaskDrawerProps {
    isOpen: boolean,
    selectedDate: CalendarDate | null,
    tasksOnDate: ITask[]
}

export interface ITaskDrawerEmitters {
    (e: 'close'): void
    (e: 'add-task', task: Omit<ITask, 'id' | 'isCompleted'>): void
    (e: 'remove-task', taskId: number): void
    (e: 'toggle-complete', taskId: number): void
    (e: 'update-task', task: Omit<ITask, 'date' | 'isCompleted'>): void
}