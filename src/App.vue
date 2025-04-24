<script setup lang="ts">
import {ref, useTemplateRef, watch} from "vue";
import {CalendarDate} from '@internationalized/date'
import type {IImportedOrExportedTask, ITask} from "@/types.ts";
import {parseDate} from '@internationalized/date';
import TaskDrawer from "@/components/TaskDrawer.vue";

const tasks = ref<ITask[]>([])
const isDrawerOpenedRef = ref<boolean>(false);
const drawerTitleRef = ref<string>('');
const selectedDateRef = ref<CalendarDate | null>(null);
const inputFileTemplateRef = useTemplateRef<HTMLInputElement | null>('fileInput');
const downloadURL = ref<string>('');

const onClickDate = (date: CalendarDate): void => {
	isDrawerOpenedRef.value = true;
	drawerTitleRef.value = date.toString()
	selectedDateRef.value = date
}

const onAddTask = (taskData: Omit<ITask, 'id' | 'isCompleted'>): void => {
	const taskToAdd: ITask = {
		...taskData,
		id: Date.now(),
		isCompleted: false
	}
	tasks.value.push(taskToAdd);
}

const getTaskByDate = (date: Date): boolean => {
	if (!tasks.value.length) return false
	return !!tasks.value.find(({date: taskDate}): boolean => (
		taskDate.toDate('UTC').toLocaleDateString() === date.toLocaleDateString()
	))
}

const getTasksByDate = (): ITask[] => {
	if (!selectedDateRef.value) return []
	return tasks.value.filter(({date: taskDate}) => {
		return taskDate.toDate('UTC').toISOString() === selectedDateRef.value!.toDate('UTC').toISOString()
	})
}

const onRemoveTask = (taskId: number): void => {
	const taskToRemoveIndex = tasks.value.findIndex(({id}): boolean => id === taskId);
	if (taskToRemoveIndex !== -1) tasks.value.splice(taskToRemoveIndex, 1);
}

const onCompleteTask = (taskId: number): void => {
	const targetTask = tasks.value.find(({id}) => id === taskId);
	if (targetTask) targetTask!.isCompleted = !targetTask!.isCompleted;
}

const getTasksCountAtDate = (date: Date): number => {
	return tasks.value.filter(({date: taskDate}: ITask) => (
		taskDate.toDate('UTC').toISOString() === date.toISOString()
	)).length
}

/**
 * При имортировании задач из .json файла, необходимо
 * конвертировать свойство date из строки в формат даты, подходящий
 * для манипуляций с датой
 * */
const onUploadFile = () => {
	if (inputFileTemplateRef.value !== null) {
		const fileValue = new FileReader()
		fileValue.onload = () => {
			const tasksFromFile: IImportedOrExportedTask[] = JSON.parse(fileValue.result as string);
			tasksFromFile.forEach((item) => {
				const itemToPush = {
					...item,
					date: parseDate(item.date)
				}
				tasks.value.push(itemToPush)
			})
		}
		fileValue.readAsText(inputFileTemplateRef.value.files![0])
	}
}

/**
 * При добавлении/удалении/редактировании задач, необходимо
 * формировать Blob-объект и ссылку для возможности скачивания
 * задач .json файле
 * */
watch(tasks, (value) => {
	if (!value.length) {
		URL.revokeObjectURL(downloadURL.value)
		return
	}
	const formattedTasks: IImportedOrExportedTask[] = tasks.value.map((item) => {
		return {
			...item,
			date: item.date.toString()
		}
	})
	const tasksInStringFormat = JSON.stringify(formattedTasks);
	const tasksBlob = new Blob([tasksInStringFormat], { type: 'application/json' });
	downloadURL.value = URL.createObjectURL(tasksBlob);
}, {deep: true})
</script>

<template>
	<UApp>
		<main class="flex flex-col gap-[5rem]">
			<section class="flex flex-col gap-4">
				<UCard>
					<template #header>
						<h3>Загрузить задачи из .json файла</h3>
						<input type="file" ref="fileInput" @change="onUploadFile" />
					</template>
					<UTooltip :disabled="!!tasks.length" text="Добавьте задачи для возможности их выгрузки">
						<ULink
							download="tasks.json"
							:disabled="!tasks.length"
							:to="downloadURL"
						>Выгрузить задачи в .json файл</ULink>
					</UTooltip>
				</UCard>
				<UCard>
					Чтобы добавить задачу или просмотреть задачи определенного дня, кликните по дате
				</UCard>
			</section>
			<UCalendar
				size="xl"
				@update:modelValue="onClickDate"
				:yearControls="false"
			>
				<template #day="{day}">
					<UChip
						size="3xl"
						:show="getTaskByDate(day.toDate('UTC'))"
						:text="getTasksCountAtDate(day.toDate('UTC'))"
					>{{day.day}}</UChip>
				</template>
			</UCalendar>
		</main>
		<TaskDrawer
			:is-open="isDrawerOpenedRef"
			:selected-date="selectedDateRef"
			:tasks-on-date="getTasksByDate()"
			@close="isDrawerOpenedRef = false"
			@add-task="onAddTask"
			@remove-task="onRemoveTask"
			@toggle-complete="onCompleteTask"
		/>
	</UApp>
</template>