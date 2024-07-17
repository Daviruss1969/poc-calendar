<template>
  <div class="d-flex w-50">
    <v-btn @click="openCalendarModal">Calendars</v-btn>
    <v-btn @click="openRessourceModal">Resources</v-btn>
  </div>
  <FullCalendar :options="calendarOptions">
    <template v-slot:eventContent="arg">
      <h3>{{ arg.event.title }}</h3>
      <p>{{ arg.event.extendedProps.location }}</p>
    </template>
    <template v-slot:dayHeaderContent="arg">
      <div :style="`color: ${arg.isToday ? 'RoyalBlue' : ''};`">
        <h2>{{ arg.date.getDate() }}</h2>
        <p>{{ weekDayFormated(arg.date) }}</p>
      </div>
    </template>
    <template v-slot:slotLabelContent="arg">
      <div :style="`font-weight: ${arg.date.getHours() === (new Date()).getHours() ? 700 : 'normal'}`">
        {{ arg.date.getHours().toString() }}
      </div>
    </template>
  </FullCalendar>
  <CalendarModal 
    v-model="isCalendarModalOpen"
    :calendars="calendars"
    @addCalendar="addCalendarHandler"
    @deleteCalendar="deleteCalendarHandler"
    @updateCalendar="updateCalendarHandler"
  />
  <RessourceModal 
    v-model="isRessourceModalOpen"
    :resources="resources"
    @addRessource="addRessourceHandler"
    @deleteResource="deleteResourceHandler"
    @editResource="editResourceHandler"
    @switchVisible="fetchCalendar"
  />
  <EventModal
    v-if="isEventModalOpen"
    v-model="isEventModalOpen"
    :action="action"
    :calendars="mappedCalendars"
    :initialEvent="selectedEvent"
    :availableRessources="mappedResources"
    @addEvent="addEventHandler"
    @updateEvent="updateEventHandler"
    @deleteEvent="deleteEventHandler"
  />
</template>
<script setup lang="ts">
// External imports
import FullCalendar from '@fullcalendar/vue3'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';

// Internal imports
import { calendarToEventLib, deleteResourceIdFromEvent, libToEvent, readIcsFile, resourceToResourceLib } from '~/lib/helper';
import { calendars } from '~/lib/calendar';
import type { _Calendar } from '~/model/calendar';
import type { _Event } from '~/model/event';
import CalendarModal from './modal/CalendarModal.vue';
import EventModal from './modal/EventModal.vue';
import RessourceModal from './modal/RessourceModal.vue';
import { resources } from '~/lib/resource';
import type { _Resource } from '~/model/resource';

// Refs
const isEventModalOpen = ref(false)
const isRessourceModalOpen = ref(false)
const isCalendarModalOpen = ref(false)
let calendarOptions = ref({})
fetchCalendar() // Instanciate the calendarOptions ref

// Computed
const mappedCalendars = computed(() => {
  return Object.values(calendars).map((calendar: _Calendar) => {return {title: calendar.title, value: calendar.id}})
})

const mappedResources = computed(() => {
  return Object.values(resources).map((resource: _Resource) => {return {title: resource.title, value: resource.id}})
})



// Variables
let action: 'create'|'update' = 'create'
let selectedEvent: _Event = {
  id: -1,
  calendarID: -1,
  title: '',
  start: new Date(),
  end: new Date(),
  description: '',
  location: '',
  resourceIds: []
}

// Function
function fetchCalendar() {
  calendarOptions.value = {
    plugins: [timeGridPlugin, interactionPlugin, listPlugin, resourceTimelinePlugin, resourceTimeGridPlugin],
    schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
    initialView: 'timeGridWeek',
    locale: 'fr',
    firstDay: 1,
    selectable: true,
    nowIndicator: true,
    slotEventOverlap: false,
    events: calendarToEventLib(),
    resources: resourceToResourceLib(),
    select: selectcallback,
    eventClick: eventClickCallback,
    headerToolbar: {
      left: 'today prev,next',
      center: 'title',
      right: 'timeGridDay,timeGridWeek,listWeek resourceTimeGridDay,resourceTimeline'
    }
  }
}

function selectcallback(selectionInfo: any): void {
  resetSelectedEvent()
  action = 'create'
  selectedEvent.start = selectionInfo.start
  selectedEvent.end = selectionInfo.end
  isEventModalOpen.value = true
}

function eventClickCallback(eventClickInfo: any) {
  resetSelectedEvent()
  action = 'update'
  selectedEvent = libToEvent(eventClickInfo.event)
  isEventModalOpen.value = true
}

function openCalendarModal() {
  isCalendarModalOpen.value = true
}

function openRessourceModal() {
  isRessourceModalOpen.value = true
}

function addEventHandler(event: _Event): void {
  // Add to the selected calendar and refetch calendar
  calendars[event.calendarID].events.push(event)

  fetchCalendar()
}

function updateEventHandler(event: _Event): void {
  // Update the event in the calendar and refectch EC
  const index = calendars[event.calendarID].events.map((event) => event.id).indexOf(event.id)
  if (index != -1){
    calendars[event.calendarID].events[index] = event
  }

  fetchCalendar()
}

function deleteEventHandler(event: _Event): void {
  const index = calendars[event.calendarID].events.map((event) => event.id).indexOf(event.id)
  if (index != -1){
    calendars[event.calendarID].events.splice(index, 1)
  }

  fetchCalendar()
}

function addCalendarHandler(calendar: _Calendar, file: File|undefined, defineLocations: boolean): void {
  if (file) {
    readFile(file, calendar, defineLocations)
  }

  calendars[calendar.title] = calendar
}

function updateCalendarHandler(calendar: _Calendar): void {
  calendars[calendar.id] = calendar

  fetchCalendar()
}

function deleteCalendarHandler(calendar: _Calendar): void {
  delete calendars[calendar.id]

  fetchCalendar()
}

function addRessourceHandler(resource: _Resource): void {
  resources[resource.id] = resource

  fetchCalendar()
}

function editResourceHandler(resource: _Resource): void {
  resources[resource.id] = resource

  fetchCalendar()
}

function deleteResourceHandler(resource: _Resource): void {
  delete resources[resource.id]

  // Delete resource id from events
  deleteResourceIdFromEvent(resource.id)

  fetchCalendar()
}

function readFile(file: File, calendar: _Calendar, defineLocations: Boolean): void {
  readIcsFile(file, calendar, defineLocations).then(() => {
    fetchCalendar()
  })
}

function resetSelectedEvent() {
  selectedEvent = {
    id: -1,
    calendarID: -1,
    title: '',
    start: new Date(),
    end: new Date(),
    description: '',
    location: '',
    resourceIds: []
  }
}

function weekDayFormated(date: Date) {
  const weekday = date.toLocaleString('default', { weekday: 'long' })
  return  weekday.charAt(0).toUpperCase() + weekday.slice(1)
}
</script>
<style>
.fc th {
  /* Override default text align for date header */
  text-align: initial; 
}

:root {
  /* Don't put special background color on today row */
  --fc-today-bg-color: inherit;
}

.fc-event:hover {
  /* Pointer cursor when hovering events */
  cursor: pointer;
}
</style>