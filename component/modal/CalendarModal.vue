<template>
  <div class="text-center pa-4">
    <v-dialog class="w-50" v-model="isActive">
      <v-card prepend-icon="mdi-calendar" title="Calendars">
        <template v-slot:actions>
          <v-btn text="Back" @click="isActive = false"></v-btn>
          <v-btn text="Add Calendar" @click="openCreateCalendar"></v-btn>
        </template>
        <div v-for="calendar in calendars">
          <div class="d-flex justify-center">
            <v-icon  icon="mdi-circle-small" :color="calendar.color"></v-icon>
            {{ calendar.title }}
            <div v-if="calendar.id !== 'default'">
              <v-icon class="cursor-pointer" icon="mdi-pencil" @click="openEditCalendar(calendar)"></v-icon>
              <v-icon class="cursor-pointer" icon="mdi-delete" @click="deleteCalendar(calendar)"></v-icon>
            </div>
          </div>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog class="w-75" v-model="isFormCalendarModalOpen">
      <v-card prepend-icon="mdi-calendar" title="New calendar">
        <template v-slot:actions>
          <v-btn text="Cancel" @click="isFormCalendarModalOpen = false"></v-btn>
          <v-btn text="Save" @click="applyForm"></v-btn>
        </template>
        <div class="w-50 mx-auto" >
          <v-text-field v-model="title" label="Title" />
          <v-dialog class="w-50">
            <template v-slot:activator="{props: activatorProps}">
              <v-btn v-bind="activatorProps" :color="color" text="color"></v-btn>
            </template>
            <template v-slot:default="{ isActive }">
              <v-card title="Choose a color">
                <v-color-picker
                  v-model="color"
                />
                <v-card-actions>
                  <v-btn
                    text="Close"
                    @click="isActive.value = false"
                  />
                </v-card-actions>
              </v-card>
            </template>
          </v-dialog>
          <v-file-input v-if="formAction !== 'update'" v-model="selectedFile" prepend-icon="" label="Import optional calendar (.ics)" />
          <v-switch v-model="isLocationsDefinedAsResources" label="Define locations as resources" color="primary"></v-switch>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
// Internal imports
import type { _Calendar, _Calendars } from '~/model/calendar';

// Props & Emits
defineProps<{
  calendars: _Calendars
}>()
const emits = defineEmits(['addCalendar', 'deleteCalendar', 'updateCalendar'])

// Models
const isActive = defineModel({ type: Boolean })

// Refs
const isFormCalendarModalOpen = ref(false)
const title = ref('')
const color = ref('')
const isLocationsDefinedAsResources = ref(false)
const selectedFile = ref<File>()

// Variables
let formAction = ''
let selectedCalendar: _Calendar

// Functions
function openCreateCalendar() {
  title.value = ''
  color.value = ''
  selectedFile.value = undefined
  formAction = 'create'

  isFormCalendarModalOpen.value = true
}

function openEditCalendar(calendar: _Calendar) {
  title.value = calendar.title
  color.value = calendar.color
  formAction = 'update'
  selectedCalendar = structuredClone(calendar)

  isFormCalendarModalOpen.value = true
}

function deleteCalendar(calendar: _Calendar) {
  emits('deleteCalendar', calendar)
  
  isActive.value = false
}

function applyForm() {
  if (formAction === 'create') {
    const calendar: _Calendar = {
      id: title.value,
      title: title.value,
      color: color.value,
      events: []
    }

    emits('addCalendar', calendar, selectedFile.value, isLocationsDefinedAsResources.value)
  } else {
    selectedCalendar.title = title.value
    selectedCalendar.color = color.value

    emits('updateCalendar', selectedCalendar)
  }


  isFormCalendarModalOpen.value = false
  isActive.value = false
}
</script>