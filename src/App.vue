<script setup lang="ts">
import {ref} from "vue";
import {CalendarDate} from '@internationalized/date'

const value = ref(new CalendarDate(2025, 4, 21));
const modalRef = ref<boolean>(false);

const onClickDate = () => {
	modalRef.value = true;
	console.log('change')
}
</script>

<template>
	<UApp>
		<UModal v-model:open="modalRef" />
		<UCalendar
			size="xl"
			@update="onClickDate"
		/>
	</UApp>
</template>

<style scoped></style>