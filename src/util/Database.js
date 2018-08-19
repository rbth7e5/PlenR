import firebase from 'react-native-firebase';
import Event from './Event';
import Calendar from './Calendar';

export default class Database {
  constructor(props) {
    this.user = props.user;
    this.ref = firebase.firestore().collection('users').doc(props.user.uid);
  }

  importCalendarFromGoogle(calendar, id) {
    let newCalendar = new Calendar({title: calendar.summary});
    let events = calendar.items;
    events.forEach((event) => {
      try {
        let newEvent = Event.formatGoogle(event);
        this.ref.collection('calendars')
            .doc(id)
            .collection('events')
            .doc(event.id)
            .set(newEvent)
        newCalendar = newCalendar.addEvent(newEvent);
      } catch (error) {
        console.warn('invalid event', event.summary)
      }
    })
    return newCalendar;
  }
}
