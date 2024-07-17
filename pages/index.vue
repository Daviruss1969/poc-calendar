<template>
  <div class="ec" style="height: 100%;">
    <h1>Calendar POC</h1>
    <v-switch
      v-model="lib"
      :label="`Selected Lib : ${lib}`"
      false-value="FullCalendar"
      true-value="EventCalendar"
    />
    <FullCalendarView v-if="lib === 'FullCalendar'"/>
    <EventCalendarView v-else/>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'

import FullCalendarView from '~/component/FullCalendarView.vue'
import EventCalendarView from '~/component/EventCalendarView.vue'

const lib = ref('FullCalendar')
</script>