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
          moment(event.end).isSame(currentDay, 'day');
    });
  }

  static parse(string) {
    let newCalendar = new Calendar({title: 'Main Calendar'});
    let eventsArray = JSON.parse(string);
    for (let event of eventsArray) {
      let parsed = JSON.parse(event);
      let newEvent = Event.localAdd(parsed);
      newCalendar = newCalendar.addEvent(newEvent);
    }
    return newCalendar;
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
