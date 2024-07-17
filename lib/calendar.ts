import type { _Calendar, _Calendars } from "~/model/calendar";

// Dates (in order to have todays date)
const startTest1 = new Date()
startTest1.setHours(8)

const startTest2 = new Date()
startTest2.setHours(9)
startTest2.setMinutes(30)

const startTest3 = new Date()
startTest3.setHours(15)
startTest3.setMinutes(15)

const endTest1 = new Date()
endTest1.setHours(10)

const endTest2 = new Date()
endTest2.setHours(13)
endTest2.setMinutes(50)

const endTest3 = new Date()
endTest3.setHours(17)
endTest3.setMinutes(45)

export const calendars: _Calendars = {
  'default': {
    id: 'default',
    title: 'Default',
    color: 'green',
    events: [
      {
        id: 'Test 1',
        title: 'Le roi Merlin',
        start: startTest1,
        end: endTest1,
        description: '',
        location: 'Quai 1',
        calendarID: 'default',
        resourceIds: ['quai1']
      },
      {
        id: 'Test 2',
        title: 'Géant gris',
        start: startTest2,
        end: endTest2,
        description: '',
        location: 'Quai 2',
        calendarID: 'default',
        resourceIds: ['quai2']
      },
      {
        id: 'Test 3',
        title: 'Harrybeau',
        start: startTest3,
        end: endTest3,
        description: '',
        location: 'Quai 1',
        calendarID: 'default',
        resourceIds: ['quai1']
      }
    ]
  },
  'anotherCalendar': {
    id: 'anotherCalendar',
    title: 'Another Calendar',
    color: 'red',
    events: []
  }
}