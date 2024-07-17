<template>
  <div class="text-center pa-4">
    <v-dialog class="w-50" v-model="isActive">
      <v-card prepend-icon="mdi-calendar" :title="action === 'create' ? 'New booking' : 'Update booking'">
        <template v-slot:actions>
          <v-btn text="Cancel" @click="isActive = false"></v-btn>
          <v-btn v-if="action === 'update'" text="delete" @click="deleteEvent"></v-btn>
          <v-btn :text="action === 'create' ? 'Save' : 'Update'" @click="applyEvent"></v-btn>
        </template>
        <div class="w-50 mx-auto">
          <v-select
            v-if="action !== 'update'"
            v-model="calendarIndex"
            label="Calendar"
            clearable
            :items="calendars"
          />
          <v-text-field v-model="title" label="Title" />
          <div class="d-flex ga-1 align-center">
            <v-icon icon="mdi-calendar-start"></v-icon>
            <v-date-input v-model="eventStartDate" prepend-icon=""></v-date-input>
            <v-text-field v-model="eventStartTime"></v-text-field>
          </div>
          <div class="d-flex ga-1 align-center">
            <v-icon icon="mdi-calendar-end"></v-icon>
            <v-date-input v-model="eventEndDate" prepend-icon=""></v-date-input>
            <v-text-field v-model="eventEndTime"></v-text-field>
          </div>
          <v-select
            v-model="ressourcesIds"
            label="Ressources"
            clearable
            multiple
            :items="availableRessources"
          />
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
import type { _Calendar } from '~/model/calendar';
import type { _Event } from '~/model/event';

// Props & Emit
const props = defineProps<{
  action: String,
  initialEvent: _Event,
  calendars: {
    title: string,
    value: string | number
  }[],
  availableRessources: {
    title: string,
    value: string|number
  }[]
}>()
const emits = defineEmits(['addEvent', 'updateEvent', 'deleteEvent'])

// Models
const isActive = defineModel({ type: Boolean })

// Refs
const title = ref(props.initialEvent.title)

const calendarIndex = ref(props.initialEvent.calendarID !== -1 ? props.initialEvent.calendarID : 'default')

const eventStartDate = ref(props.initialEvent.start ? props.initialEvent.start : new Date())
const eventStartTime = ref(`${eventStartDate.value?.getHours().toLocaleString('en-US', { // Just in order to get 2 digits in the hours and minutes
  minimumIntegerDigits: 2,
  useGrouping: false
})}:${eventStartDate.value?.getMinutes().toLocaleString('en-US', {
  minimumIntegerDigits: 2,
  useGrouping: false
})}`)

const eventEndDate = ref(structuredClone(props.initialEvent.end))

const eventEndTime = ref(`${eventEndDate.value?.getHours().toLocaleString('en-US', { // Just in order to get 2 digits in the hours and minutes
  minimumIntegerDigits: 2,
  useGrouping: false
})}:${eventEndDate.value?.getMinutes().toLocaleString('en-US', {
  minimumIntegerDigits: 2,
  useGrouping: false
})}`)

const ressourcesIds = ref<Array<number|string>>(props.initialEvent.resourceIds)

// Functions
function applyEvent() {
  // Apply time to the dates
  eventStartDate.value.setHours(parseInt(eventStartTime.value.split(':')[0]))
  eventStartDate.value.setMinutes(parseInt(eventStartTime.value.split(':')[1]))
  eventEndDate.value.setHours(parseInt(eventEndTime.value.split(':')[0]))
  eventEndDate.value.setMinutes(parseInt(eventEndTime.value.split(':')[1]))

  const event: _Event = structuredClone(props.initialEvent)
  event.id = event.id !== -1 ? event.id : title.value
  event.title = title.value
  event.start = eventStartDate.value
  event.end = eventEndDate.value
  event.calendarID = calendarIndex.value
  event.resourceIds = ressourcesIds.value

  emits(props.action === 'create' ? 'addEvent' : 'updateEvent', event)
  isActive.value = false
}

function deleteEvent() {
  emits('deleteEvent', props.initialEvent)
  isActive.value = false
}

</script>