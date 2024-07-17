<template>
  <div class="d-flex w-50">
    <v-btn @click="openCalendarModal">Calendars</v-btn>
    <v-btn @click="openRessourceModal">Resources</v-btn>
  </div>
  <div class="ec-dark">
    <div ref="canva" />
  </div>
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
    @switchVisible="fetchEventCalendar"
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
import Calendar from '@event-calendar/core'
import TimeGrid from '@event-calendar/time-grid'
import Interaction from '@event-calendar/interaction'
import List from '@event-calendar/list'
import RessourceTimeline from '@event-calendar/resource-timeline'
import RessourceTimegrid from '@event-calendar/resource-time-grid'
import '@event-calendar/core/index.css'

// Internal imports
import EventModal from './modal/EventModal.vue'
import CalendarModal from './modal/CalendarModal.vue'
import RessourceModal from './modal/RessourceModal.vue'
import { calendarToEventLib, deleteResourceIdFromEvent, libToEvent, readIcsFile, resourceToResourceLib } from '~/lib/helper'
import { calendars } from '~/lib/calendar'
import type { _Event } from '~/model/event'
import type { _Calendar } from '~/model/calendar'
import { resources } from '~/lib/resource'
import type { _Resource } from '~/model/resource'

// Refs
const canva = ref(null)
const isEventModalOpen = ref(false)
const isRessourceModalOpen = ref(false)
const isCalendarModalOpen = ref(false)

// Computed
const mappedCalendars = computed(() => {
  return Object.values(calendars).map((calendar: _Calendar) => {return {title: calendar.title, value: calendar.id}})
})

const mappedResources = computed(() => {
  return Object.values(resources).map((resource: _Resource) => {return {title: resource.title, value: resource.id}})
})

// Variables
let ec: any = null
let action: string =  'create'
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

// Hooks
onMounted(() => {
  fetchEventCalendar(false)
})


function fetchEventCalendar(destroy: boolean = true) {
  // Destroy in order to reload the event calendar canva  
  if (destroy) {
    ec.destroy()
  }

  // Event calendar object
  ec = new Calendar({
    target: canva.value,
    props: {
      plugins: [TimeGrid, Interaction, List, RessourceTimeline, RessourceTimegrid],
      options: {
        view: 'timeGridWeek',
        firstDay: 1,
        nowIndicator: true,
        selectable: true,
        eventStartEditable: false,
        eventDurationEditable: false,
        slotEventOverlap: false,
        height: '100%',
        dateClick: dateClickCallback,
        select: selectCallBack,
        eventClick: eventClickCallback,
        dayHeaderFormat: dayHeaderFormat,
        eventContent: eventContent,
        slotLabelFormat: slotLabelFormat,
        resourceLabelContent: resourceLabelContent,
        titleFormat: {year: 'numeric', month: 'long', day: 'numeric'},
        headerToolbar: {
          start: 'today prev,next',
          center: 'title',
          end: 'timeGridDay,timeGridWeek,listWeek resourceTimeGridWeek,resourceTimelineDay'
        },
        events: calendarToEventLib(),
        resources: resourceToResourceLib()
      }
    }
  })
}

// Functions
function dateClickCallback(info: any): void {
  resetSelectedEvent()
  action = 'create'

  selectedEvent.start = info.date
  selectedEvent.end = structuredClone(info.date)
  selectedEvent.end.setHours(info.date.getHours() + 1)

  isEventModalOpen.value = true
}

function selectCallBack(info: any): void {
  resetSelectedEvent()
  action = 'create'
  selectedEvent.start = info.start
  selectedEvent.end = info.end
  isEventModalOpen.value = true
}

function eventClickCallback(info: any): void {
  resetSelectedEvent()
  action = 'update'
  selectedEvent = libToEvent(info.event)
  isEventModalOpen.value = true
}

function openRessourceModal(): void {
  isRessourceModalOpen.value = true
}

function openCalendarModal(): void {
  isCalendarModalOpen.value = true
}

function addEventHandler(event: _Event): void {
  // Add to the selected calendar and refetch EC
  calendars[event.calendarID].events.push(event)

  fetchEventCalendar()
}

function updateEventHandler(event: _Event): void {
  // Update the event in the calendar and refectch EC
  const index = calendars[event.calendarID].events.map((event) => event.id).indexOf(event.id)
  if (index != -1){
    calendars[event.calendarID].events[index] = event
  }

  fetchEventCalendar()
}

function deleteEventHandler(event: _Event): void {
  const index = calendars[event.calendarID].events.map((event) => event.id).indexOf(event.id)
  if (index != -1){
    calendars[event.calendarID].events.splice(index, 1)
  }

  fetchEventCalendar()
}

function addCalendarHandler(calendar: _Calendar, file: File|undefined, defineLocations: boolean): void {
  if (file) {
    readFile(file, calendar, defineLocations)
  }

  calendars[calendar.title] = calendar
}

function updateCalendarHandler(calendar: _Calendar): void {
  calendars[calendar.id] = calendar

  fetchEventCalendar()
}

function deleteCalendarHandler(calendar: _Calendar): void {
  delete calendars[calendar.id]

  fetchEventCalendar()
}

function addRessourceHandler(resource: _Resource): void {
  resources[resource.id] = resource

  fetchEventCalendar()
}

function editResourceHandler(resource: _Resource): void {
  resources[resource.id] = resource

  fetchEventCalendar()
}

function deleteResourceHandler(resource: _Resource): void {
  delete resources[resource.id]

  // Delete resource id from events
  deleteResourceIdFromEvent(resource.id)

  fetchEventCalendar()
}

function resetSelectedEvent(): void {
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

function readFile(file: File, calendar: _Calendar, defineLocations: Boolean): void {
  readIcsFile(file, calendar, defineLocations).then(() => {
    fetchEventCalendar()
  })
}

function dayHeaderFormat(date: Date) {
  const weekDay = date.toLocaleString('default', { weekday: 'long' })
  const weekDayFormated = weekDay.charAt(0).toUpperCase() + weekDay.slice(1)

  const curentDateWithoutTime = new Date()
  curentDateWithoutTime.setHours(0, 0, 0, 0)

  const color = date.getTime() === curentDateWithoutTime.getTime() ? 'RoyalBlue' : ''

  return {
    html: 
    `
      <div style="color: ${color}; padding: 8px;">
        <h2>${date.getDate()}</h2>
        <p>${weekDayFormated}</p>
      </div>
    `
  }
}

function slotLabelFormat(time: Date) {
  return time.getHours().toString()
}

function eventContent(info: any) {
  return {
    html:
    `
      <div>
        <h3>${info.event.title}</h3>
        <p>${info.event.extendedProps.location ?? ''}</p>
      </div>
    `
  }
}

function resourceLabelContent(info: any) {
  return {
    html:
    `
      <div style="text-align: center;">
        <h3>${info.resource.title}</h3>
      </div>
    `
  }
}
</script>
<style>
.ec {
  /* Define darks colors */
  --ec-bg-color: #22272e;
  --ec-text-color: #adbac7;
}

.ec-header .ec-day {
  /* Put header dates at left */
  text-align: initial;
}

.ec-day.ec-today {
  /* Don't show today background color */
  background-color: inherit;
}

.ec-timeline .ec-sidebar .ec-resource span {
  /* Weird useless padding top making timeline view weird */
  padding-top: 0px; 
}
</style>