import Event from './Event';
import SortedList from './SortedList';

export default class Calendar {
  constructor(props) {
    this.title = props.title
    this.id = idCreator();
    this.eventsList = new SortedList(Event.eventComparator);
  }

  addEvent(event) {
    newCalendar = new Calendar({title: this.title})
    newCalendar.id = this.id;
    newCalendar.eventsList = this.eventsList.add(event);
    return newCalendar;
  }

  deleteEvent(event) {
    newCalendar = new Calendar({title: this.title})
    newCalendar.id = this.id;
    newCalendar.eventsList = this.eventsList.delete(event);
    return newCalendar;
  }

  getEvents(date) {
    return this.eventsList.filter((event) => {
      return moment(event.start).isSame(date, 'day') ||
          date.isBetween(event.start, event.end, 'minute', '[)') ||
          moment(event.end).isSame(date, 'day');
    });
  }

  static parse(events) {
    let newCalendar = new Calendar({title: 'Main Calendar'});
    for (let event of events) {
      let newEvent = Event.localAdd(event);
      newCalendar = newCalendar.addEvent(newEvent);
    }
    return newCalendar;
  }

  static parseGoogle(events) {
    let newCalendar = new Calendar({title: 'Google Calendar'});
    for (let event of events) {
      let newEvent = Event.formatGoogle(event);
      newCalendar = newCalendar.addEvent(newEvent);
    }
    return newCalendar;
  }

  static parseForTimeline(events, name) {
    let newEvents = [];
    for (let event of events) {
      let newEvent = {
        start: moment(event.start).format('YYYY-MM-DD HH:mm:ss'),
        end: moment(event.end).format('YYYY-MM-DD HH:mm:ss'),
        title: name,
        summary: 'something on'
      }
      newEvents.push(newEvent);
    }
    return newEvents;
  }

  static parseGoogleForTimeline(events, name) {
    let newEvents = [];
    for (let event of events) {
      let localEvent = Event.formatGoogle(event);
      let newEvent = {
        start: moment(localEvent.start).format('YYYY-MM-DD HH:mm:ss'),
        end: moment(localEvent.end).format('YYYY-MM-DD HH:mm:ss'),
        title: name,
        summary: 'likely free'
      }
      newEvents.push(newEvent);
    }
    return newEvents;
  }

  toJSON() {
    return JSON.stringify(this.eventsList.toArray());
  }

  static generateYearMonthData(start, end) {
    let month;
    let year;
    let startMonth = start.month();
    let startYear = start.year();
    let endMonth = end.month();
    let endYear = end.year();
    let dataArray = [];

    for (month = startMonth; month < 12; month++) {
      dataArray.push(Calendar.createYearMonthObj(month, startYear));
    }
    for (year = (startYear + 1); year < endYear; year++) {
      for (month = 0; month < 12; month++) {
        dataArray.push(Calendar.createYearMonthObj(month, year));
      }
    }
    for (month = 0; month <= (endMonth); month++) {
      dataArray.push(Calendar.createYearMonthObj(month, endYear));
    }

    return dataArray;
  }

  static createYearMonthObj(month, year) {
    return {
      key: month.toString() + year.toString(),
      month: month,
      year: year
    }
  }
}

var moment = require('moment');
const idCreator = require('uuid/v4');
