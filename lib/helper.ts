import ICAL from "ical.js"
import type { _Calendar } from "~/model/calendar"
import { calendars } from "./calendar"
import type { _Event } from "~/model/event"
import { resources } from "./resource"

export function readIcsFile(file: File, calendar: _Calendar, defineLocation: Boolean): Promise<void> {
  return new Promise(resolve => {
    if (file.type === 'text/calendar') {
      const reader = new FileReader()
  
      reader.addEventListener('load', () => {
        const jcalData = ICAL.parse(reader.result)
        const comp = new ICAL.Component(jcalData)
        const vevents = comp.getAllSubcomponents("vevent")
        
        vevents.forEach((vevent: any) => {
          const ICALevent = new ICAL.Event(vevent)

          // Resources
          if (defineLocation) {
            const id = ICALevent.location.toLowerCase().replace(/\s/g, '')
            if (!resources[id]) {
              resources[id] = {
                id: id,
                title: ICALevent.location,
                description: '',
                isVisible: false
              }
            }
          }

          // Events
          calendar.events.push({
            id: ICALevent.summary,
            calendarID: calendar.id,
            title: ICALevent.summary,
            start: ICALevent.startDate.toJSDate(),
            end: ICALevent.endDate.toJSDate(),
            location: ICALevent.location,
            description: ICALevent.description,
            resourceIds: [ICALevent.location.toLowerCase().replace(/\s/g, '')]
          })
        })
        
        resolve()
      })
  
      reader.readAsText(file)
    }
  })
}

// Calendar
export function eventToLib(event : _Event): any {
  return {
    id: event.id,
    title: event.title,
    start: event.start,
    end: event.end,
    backgroundColor: calendars[event.calendarID].color,
    resourceIds: event.resourceIds,
    extendedProps: {
      location: event.location,
      description: event.description,
      calendarID: event.calendarID
    }
  }
}

export function libToEvent(event: any): _Event {
  return {
    id: event.id,
    calendarID: event.extendedProps.calendarID,
    title: event.title,
    start: event.start,
    end: event.end,
    description: event.extendedProps.description,
    location: event.extendedProps.location,
    resourceIds: event.resourceIds
  }
}

export function calendarToEventLib(): any[] {
  const events: any[] = []

  Object.keys(calendars).forEach((key) => {
    calendars[key].events.forEach((event) => {
      events.push(eventToLib(event))
    })
  })

  return events;
}

// Resource

export function resourceToResourceLib(): any[] {
  const resourcesLib: any[] = []

  Object.keys(resources).forEach((key) => {
    const resource = resources[key]

    // Check is the resource is visible
    if (resource.isVisible) {
      resourcesLib.push({
        id: resource.id,
        title: resource.title
      })
    }
  })

  return resourcesLib
}

export function deleteResourceIdFromEvent(resourceID: number|string): void {
  Object.keys(calendars).forEach((key) => {
    calendars[key].events.forEach((event) => {
      // Delete resourceID if exist
      const index = event.resourceIds.indexOf(resourceID)
      
      if (index > -1) {
        event.resourceIds.splice(index, 1)
      }
    })
  })
}
