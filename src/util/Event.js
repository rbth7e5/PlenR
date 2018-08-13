export default class Event {
  constructor(props) {
    this.title = props.title;
    this.location = props.location;
    this.start = props.start;
    this.end = props.end;
    this.notes = props.notes;
    this.allday = props.allday;
    this.isImported = false;
    this.id = idCreator();
    this.recurrence = props.recurrence;
  }

  static eventComparator(first, second) {
    if (first.id == second.id) {
      return 0;
    }
    if (first.start > second.start) {
      return 1;
    } else return -1;
  }

  static importAdd(props) {
    let newEvent = new Event({
      title: props.title,
      location: props.location,
      start: props.start,
      end: props.end,
      notes: props.notes,
      allday: props.allday,
      recurrence: props.recurrence
    });
    newEvent.isImported = true;
    newEvent.id = props.id;
    return newEvent;
  }

  static localAdd(props) {
    let newEvent = new Event({
      title: props.title,
      location: props.location,
      start: new Date(props.start),
      end: new Date(props.end),
      notes: props.notes,
      allday: props.allday,
      isImported: false,
    });
    newEvent.id = props.id;
    return newEvent;
  }

  static formatGoogle(e) {
    let start;
    let end;
    let allDay;
    if (e.start.date && e.end.date) {
      start = moment(e.start.date).toDate();
      end = moment(e.end.date).toDate();
      allDay = true;
    } else if (e.start.dateTime && e.end.dateTime) {
      start = moment(e.start.dateTime).toDate();
      end = moment(e.end.dateTime).toDate();
      allDay = false;
    } else {
      throw 'invalid event';
    }
    let event = Event.importAdd({
      title: e.summary,
      location: e.location,
      start: start,
      end: end,
      notes: e.description,
      allday: allDay,
      id: e.id,
      recurrence: e.recurrence
    });
    return event;
  }

  clone() {
    let newEvent = new Event({
      title: this.title,
      location: this.location,
      start: this.start,
      end: this.end,
      notes: this.notes,
      allday: this.allday,
      isImported: this.isImported
    });
    newEvent.id = this.id;
    return newEvent;
  }

  edit(props) {
    let newEvent = this.clone();
    newEvent.title = props.title == null ? this.title : props.title;
    newEvent.location = props.location == null ? this.location : props.location;
    newEvent.start = props.start == null ? this.start : props.start;
    newEvent.end = props.end == null ? this.end : props.end;
    newEvent.notes = props.notes == null ? this.notes : props.notes;
    newEvent.allday = props.allday == null ? this.allday : props.allday;
    newEvent.id = this.id;
    return newEvent;
  }

  toJSON() {
    return JSON.stringify({
      title: this.title,
      location: this.location,
      start: this.start,
      end: this.end,
      notes: this.notes,
      allday: this.allday,
      id: this.id,
      isImported: this.isImported
    })
  }
}

const moment = require('moment');
const idCreator = require('uuid/v4');
