<script setup lang="ts">
import {ref, useTemplateRef} from "vue";
import {CalendarDate} from '@internationalized/date'
import type {ITask} from "@/types.ts";
import {parseDate} from '@internationalized/date';

const tasks = ref<ITask[]>([])
const drawerRef = ref<boolean>(false);
const modalTitleRef = ref<string>('');
const inputTitleRef = ref<string>('');
const inputDescriptionRef = ref<string>('');
const selectedDateRef = ref<CalendarDate | null>(null);
const inputFileTemplateRef = useTemplateRef<HTMLInputElement | null>('fileInput')


const onClickDate = (date: CalendarDate): void => {
	drawerRef.value = true;
	modalTitleRef.value = date.toString()
	selectedDateRef.value = date
}

const onAddTask = (): void => {
	if (!inputTitleRef.value.length) return
	const taskToAdd: ITask = {
		title: inputTitleRef.value,
		description: inputDescriptionRef.value,
		date: selectedDateRef.value,
		id: Date.now(),
		isCompleted: false
	}
	tasks.value.push(taskToAdd);
	drawerRef.value = false;
	inputTitleRef.value = '';
	inputDescriptionRef.value = '';
}

const getTaskByDate = (date: Date): boolean => {
	if (!tasks.value.length) return false
	return !!tasks.value.find(({date: taskDate}: ITask): ITask | undefined => (
		taskDate.toDate('UTC').toLocaleDateString() === date.toLocaleDateString()
	))
}

const getTasksByDate = (): ITask[] => {
	if (!selectedDateRef.value) return []
	return tasks.value.filter(({date: taskDate}: ITask) => {
		return taskDate.toDate('UTC').toISOString() === selectedDateRef.value.toDate('UTC').toISOString()
	})
}

const onRemoveTask = (taskId: number): void => {
	const targetTask = tasks.value.find(({id}: ITask) => id === taskId);
	const targetTaskIndex = tasks.value.indexOf(targetTask!);
	tasks.value.splice(targetTaskIndex, 1);
}

const onCompleteTask = (taskId: number): void => {
	const targetTask = tasks.value.find((task: ITask) => task.id === taskId);
	targetTask!.isCompleted = !targetTask!.isCompleted;
}

const getTasksCountAtDate = (date: Date): number => {
	return tasks.value.filter(({date: taskDate}: ITask) => (
		taskDate.toDate('UTC').toISOString() === date.toISOString()
	)).length
}

const onUploadFile = () => {
	if (inputFileTemplateRef.value !== null) {
		const fileValue = new FileReader()
		fileValue.onload = () => {
			const tasksFrommFile: ITask[] = JSON.parse(fileValue.result as string);
			tasksFrommFile.forEach((item) => {
				const itemToPush = {
					...item,
					date: parseDate(item.date as unknown as string)
				}
				tasks.value.push(itemToPush)
			})
		}
		fileValue.readAsText(inputFileTemplateRef.value.files[0])
	}
}

</script>

<template>
	<UApp>
		<section class="mb-[5rem]! md:mb-0!">
			<h3>Import tasks from .json file</h3>
			<input type="file" ref="fileInput" @change="onUploadFile" />
		</section>
		<UDrawer
			v-model:open="drawerRef"
			:handle="false"
			direction="right"
			@close="selectedDateRef = null"
		>
			<template #header>
				<header class="flex gap-36 items-center">
					<h2 class="text-xl text-white">Add task on {{modalTitleRef}}</h2>
					<UButton color="neutral" variant="ghost" icon="i-lucide-x" @click="drawerRef = false" />
				</header>
			</template>
			<template #body>
				<main class="flex flex-col h-full gap-12">
					<section class="flex flex-col gap-4">
						<UInput v-model="inputTitleRef" placeholder="Enter a task title"/>
						<UInput v-model="inputDescriptionRef" placeholder="Enter a task description"/>
						<UButton
							label="Add task"
							class="justify-center"
							@click="onAddTask"
						/>
					</section>
					<section
						v-if="getTasksByDate().length"
						class="flex flex-col gap-4"
					>
						<span class="text-lg text-white">Tasks on on this day</span>
						<ul class="flex flex-col gap-4">
							<li v-for="task in getTasksByDate()">
								<UCard>
									{{task.date}}
									<h3
										class="text-white text-lg"
										:class="{'line-through': task.isCompleted}"
									>Task:</h3>
									<UInput
										class="text-white text-sm"
										:class="{'line-through': task.isCompleted}"
										disabled
										v-model="task.title"
										variant="ghost"
									/>
									<div v-if="!!task.description" class="mt-3!">
										<h3
											class="text-white text-lg"
											:class="{'line-through': task.isCompleted}"
										>Description:</h3>
										<p
											class="text-white text-sm"
											:class="{'line-through': task.isCompleted}"
										>{{task.description}}</p>
									</div>
									<template #footer>
										<div class="flex gap-3">
											<UButton
												:icon="task.isCompleted
													? 'material-symbols:do-not-disturb-on-outline-rounded'
													: 'material-symbols:check-circle-outline-rounded'
												"
												size="md"
												color="primary"
												variant="solid"
												@click="onCompleteTask(task.id)"
											/>
											<UButton
												icon="material-symbols:delete-outline"
												size="md"
												color="error"
												variant="solid"
												@click="onRemoveTask(task.id)"
											/>
										</div>
									</template>
								</UCard>
							</li>
						</ul>
					</section>
					<span v-else class="text-lg text-white">You have no tasks on this day</span>
				</main>
			</template>
		</UDrawer>
		<UCalendar
			size="xl"
			@update:modelValue="onClickDate"
		>
			<template #day="{day}">
				<UChip
					size="3xl"
					:show="getTaskByDate(day.toDate('UTC'))"
					:text="getTasksCountAtDate(day.toDate('UTC'))"
				>{{day.day}}</UChip>
			</template>
		</UCalendar>
	</UApp>
</template>