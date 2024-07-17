<template>
  <div class="text-center pa-4">
    <v-dialog class="w-50" v-model="isActive">
      <v-card prepend-icon="mdi-calendar" title="Resources">
        <template v-slot:actions>
          <v-btn text="Back" @click="isActive = false"></v-btn>
          <v-btn text="Add Resource" @click="openCreateResource()"></v-btn>
        </template>
        <div v-for="resource in resources">
          <div class="d-flex justify-center">
            {{ resource.title }}
            <v-icon v-if="resource.isVisible" class="cursor-pointer" icon="mdi-eye-outline" @click="switchVisible(resource)"></v-icon>
            <v-icon v-else class="cursor-pointer" icon="mdi-eye-closed" @click="switchVisible(resource)"></v-icon>
            <v-icon class="cursor-pointer" icon="mdi-pencil" @click="openEditResource(resource)"></v-icon>
            <v-icon class="cursor-pointer" icon="mdi-delete" @click="deleteResource(resource)"></v-icon>
          </div>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog class="w-50" v-model="isActionModalOpen">
      <v-card prepend-icon="mdi-calendar" title="Resources">
        <template v-slot:actions>
          <v-btn text="Cancel" @click="isActionModalOpen = false"></v-btn>
          <v-btn text="Save" @click="applyEvent"></v-btn>
        </template>
        <div class="w-50 mx-auto" >
          <v-text-field v-model="title" label="Title" />
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
import type { _Resource, _Resources } from '~/model/resource';

// Props
defineProps<{
    resources: _Resources
}>()

// Emits
const emits = defineEmits(['addRessource', 'editResource', 'deleteResource', 'switchVisible'])

// Models
const isActive = defineModel({ type: Boolean })

// Refs
const title = ref('')
const isActionModalOpen = ref(false)

// Variables
let action = ''
let selectedResource: _Resource

// Function
function applyEvent(): void {
  if (action === 'create') {
    emits('addRessource', {
      id: title.value,
      title: title.value,
      description: '',
      isVisible: false
    })
  } else {
    emits('editResource', {
      id: selectedResource.id,
      title: title.value,
      description: selectedResource.description,
      isVisible: selectedResource.isVisible
    })

  }

  isActionModalOpen.value = false
  isActive.value = false
}

function openCreateResource() {
  action = 'create'
  title.value = ''

  isActionModalOpen.value = true
}

function switchVisible(resource: _Resource) {
  if (resource.isVisible) {
    resource.isVisible = false
  } else {
    resource.isVisible = true
  }

  emits('switchVisible')

  isActive.value = false
}

function openEditResource(resource: _Resource) {
  action = 'edit'
  title.value = resource.title
  selectedResource = structuredClone(resource)

  isActionModalOpen.value = true
}

function deleteResource(resource: _Resource) {
  emits('deleteResource', resource)

  isActive.value = false
}
</script>