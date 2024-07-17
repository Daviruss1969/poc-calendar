import type { _Resource } from "./resource";

export interface _Event {
  id: string | number,
  calendarID: string | number,
  title: string,
  description: string,
  location: string,
  start: Date,
  end: Date,
  resourceIds: (string | number)[]
}