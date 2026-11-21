import { Calendar } from "react-big-calendar";
import withDragAndDropModule from "react-big-calendar/lib/addons/dragAndDrop";

import type { CalendarEvent } from "./types";
import { unwrapDefault } from "./utils";

const withDragAndDrop = unwrapDefault(withDragAndDropModule);

// react-big-calendar with its drag-and-drop addon, typed for the Calendar's events.
const DragAndDropCalendar = withDragAndDrop<CalendarEvent>(Calendar);

export default DragAndDropCalendar;
