import type { _Event } from "./event";
import type { _Journal } from "./journal";

export interface _Calendar {
  id: string | number,
  title: string,
  color: string,
  events: _Event[]
}

export interface _Calendars {
  [id: string | number]: _Calendar
}