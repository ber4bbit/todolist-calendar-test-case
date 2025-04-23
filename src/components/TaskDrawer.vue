<script setup lang="ts">
import type {ITaskDrawerProps, ITaskDrawerEmitters} from "@/types.ts";
import {ref} from "vue";

const props = defineProps<ITaskDrawerProps>();

const emit = defineEmits<ITaskDrawerEmitters>();

const inputTaskTitleRef = ref<string>('');
const inputTaskDescriptionRef = ref<string>('');
const editingTaskIdRef = ref<number | null>(null);

const isTaskEditing = (taskId: number): boolean => editingTaskIdRef.value === taskId;
const onEditTask = (taskId: number) => editingTaskIdRef.value = taskId;
const onSaveTask = ()=> editingTaskIdRef.value = null;

const onAddTask = () => {
	/** Название задачи обязательно */
	if (!inputTaskTitleRef.value.length) return;
	emit('add-task', {
		title: inputTaskTitleRef.value,
		description: inputTaskDescriptionRef.value,
		date: props.selectedDate
	})
	inputTaskTitleRef.value = '';
	inputTaskDescriptionRef.value = '';
	emit('close')
}
</script>

<template>
	<UDrawer
		v-model:open="props.isOpen"
		:handle="false"
		direction="right"
		@close="emit('close')"
	>
		<template #header>
			<header class="flex gap-36 items-center">
				<h2 class="text-xl text-white">Add task on {{props.selectedDate!.toString()}}</h2>
				<UButton color="neutral" variant="ghost" icon="i-lucide-x" @click="emit('close')" />
			</header>
		</template>
		<template #body>
			<main class="flex flex-col h-full gap-12">
				<section class="flex flex-col gap-4">
					<UInput v-model="inputTaskTitleRef" placeholder="Enter a task title"/>
					<UInput v-model="inputTaskDescriptionRef" placeholder="Enter a task description"/>
					<UButton
						label="Add task"
						class="justify-center"
						@click="onAddTask"
					/>
				</section>
				<section v-if="props.tasksOnDate.length" class="flex flex-col gap-4">
					<span class="text-lg text-white">Tasks on on this day</span>
					<ul v-for="task in props.tasksOnDate" :key="task.id">
						<UCard>
							<h3
								class="text-white text-lg"
								:class="{'line-through': task.isCompleted}"
							>Task:</h3>
							<!-- Блок названия задачи -->
							<span
								v-if="!isTaskEditing(task.id)"
								class="text-white text-sm"
								:class="{'line-through': task.isCompleted}"
							>{{task.title}}</span>
							<UInput
								v-else
								class="text-white text-sm"
								v-model="task.title"
							/>
							<!-- Блок описания задачи -->
							<div v-if="!!task.description" class="mt-3!">
								<h3
									class="text-white text-lg"
									:class="{'line-through': task.isCompleted}"
								>Description:</h3>
								<p
									v-if="!isTaskEditing(task.id)"
									class="text-white text-sm"
									:class="{'line-through': task.isCompleted}"
								>
									{{task.description}}
								</p>
								<UInput
									v-else
									class="text-white text-sm"
									v-model="task.description"
								/>
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
										@click="emit('toggle-complete', task.id)"
									/>
									<UButton
										:icon="isTaskEditing(task.id)
											? 'material-symbols:check-circle-outline-rounded'
											: 'material-symbols:edit-outline'
										"
										size="md"
										color="primary"
										variant="solid"
										@click="isTaskEditing(task.id) ? onSaveTask() : onEditTask(task.id)"
									/>
									<UButton
										icon="material-symbols:delete-outline"
										size="md"
										color="error"
										variant="solid"
										@click="emit('remove-task', task.id)"
									/>
								</div>
							</template>
						</UCard>
					</ul>
				</section>
				<span v-else class="text-lg text-white">You have no tasks on this day</span>
			</main>
		</template>
	</UDrawer>
</template>