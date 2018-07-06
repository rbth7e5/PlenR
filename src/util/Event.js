export default class Event {
  constructor(props) {
    this.title = props.title;
    this.location = props.location;
    this.start = props.start;
    this.end = props.end;
    this.notes = props.notes;
    this.allday = props.allday;
    this.id = idCreator();
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
    });
    newEvent.id = props.id;
    return newEvent;
  }

  clone() {
    let newEvent = new Event({
      title: this.title,
      location: this.location,
      start: this.start,
      end: this.end,
      notes: this.notes,
      allday: this.allday,
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

  editTitle(title) {
    let newEvent = this.clone();
    newEvent.title = title;
    return newEvent;
  }

  editLocation(location) {
    let newEvent = this.clone();
    newEvent.location = location;
    return newEvent;
  }

  editStart(start) {
    let newEvent = this.clone();
    newEvent.start = start;
    return newEvent;
  }

  editEnd(end) {
    let newEvent = this.clone();
    newEvent.end = end;
    return newEvent;
  }

  editNotes(notes) {
    let newEvent = this.clone();
    newEvent.notes = notes;
    return newEvent;
  }
}

const idCreator = require('uuid/v4');
