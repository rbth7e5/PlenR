import React, { Component } from 'react';

import {
  StyleSheet,
  Platform,
  Text,
  View,
  ScrollView,
  Button,
  TouchableHighlight,
  AsyncStorage,
  ActivityIndicator,
  VirtualizedList,
  Alert,
} from 'react-native';

import EventBox from '../components/EventBox';
import AddEvent from './AddEvent';
import EventDetails from './EventDetails';
import SortedList from '../util/SortedList';
import Event from '../util/Event';
import CalendarMonthView from '../components/CalendarMonthView';
import Calendar from '../util/Calendar';

import firebase from 'react-native-firebase';

export default class MyPlenR extends Component<Props> {
  static navigatorButtons = {
    rightButtons: [
      {
        id: 'add',
        ...Platform.select({
          ios: {
            systemItem: 'add',
          },
          android: {
            title: 'Add',
          },
        }),
      },
      {
        id: 'organise',
        ...Platform.select({
          ios: {
            systemItem: 'compose',
          },
          android: {
            title: 'organise',
          },
        })
      }
    ],
    leftButtons: [
      {
        id: 'delete cache',
        systemItem: 'trash'
      },
    ]
  };

  constructor(props) {
    super(props);
    let today = moment();
    let prevMonth = today.clone().subtract(1, 'months');
    let nextMonth = today.clone().add(1, 'months');
    let data = Calendar.generateYearMonthData(moment({year: 1918, month: 0}), today.clone().add(1, 'months'));
    this.state = {
      currentTime: today,
      currentUser: null,
      local_events: new SortedList(Event.eventComparator),
      retrievingEvents: true,
      calendarKeys: [],
      scrollOffset: (data.length - 2) * 300,
      yearMonthData: data,
      local_calendar: new Calendar({title: 'Main Calendar'}),
    }
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  componentDidMount() {
    this.props.navigator.showLightBox({
      screen: 'PlenR.Loading',
      style: {
        backgroundBlur: 'light',
        tapBackgroundToDismiss: false,
      }
    });
    firebase.auth().onAuthStateChanged((user) => {
      this.setState({currentUser: user});
    });
    AsyncStorage.getItem('@localCalendar:key')
      .then((string) => {
        if (string !== null) {
          this.setState({local_calendar: Calendar.parse(string)});
        } else {
          this.props.navigator.dismissLightBox();
        }
      }).catch((error) => {
        alert('error retrieving local events!');
        this.props.navigator.dismissLightBox();
      });
    AsyncStorage.getItem('@calendarKeys:key')
      .then((string) => {
        let calendarKeys = JSON.parse(string);
        if (calendarKeys !== null) {
          this.setState({calendarKeys: calendarKeys});
          this.retrieveGoogleEventsFromCache(calendarKeys);
        } else {
          this.props.navigator.dismissLightBox();
        }
      }).catch((error) => {
        this.props.navigator.dismissLightBox();
      });
  }

  onNavigatorEvent(event) {
    if (event.type == 'NavBarButtonPress') {
      if (event.id == 'add') {
        this.props.navigator.showModal({
          screen: 'PlenR.AddEvent',
          title: 'Add Event',
          animationType: 'slide-up',
          passProps: {
            year_selected: this.state.currentTime.year(),
            month_selected: this.state.currentTime.month(),
            day_selected: this.state.currentTime.date(),
            onAddEvent: (data) => {
              this.setState({local_calendar: this.state.local_calendar.addEvent(data)});
              AsyncStorage.setItem('@localCalendar:key', this.state.local_calendar.toJSON());
              firebase.firestore().collection('users').doc(this.state.currentUser.uid).collection('calendars')
                  .doc('PlenR Calendar').set({
                    id: this.state.local_calendar.id,
                    events: this.state.local_calendar.eventsList.toArray()
                  });
            }
          }
        });
      }
      if (event.id == 'organise') {
        this.props.navigator.showModal({
          screen: 'PlenR.OrganiseEvent',
          title: 'Organise Event',
          animationType: 'slide-up',
        })
      }
      if (event.id == 'delete cache') {
        Alert.alert(
          'Confirm Cache Deletion',
          '',
          [
            {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
            {text: 'Confirm', onPress: () => {
              AsyncStorage.clear()
                .catch((error) => {
                  alert('error deleting cache');
                });
            }},
          ]
        )
      }
    }
    if (event.type == 'DeepLink') {
      const parts = event.link.split('`');
      if (parts[0] == 'googleEvents') {
        let id = parts[1];
        let string = parts[2];
        if (!this.state.calendarKeys.includes(id)) {
          this.setState({calendarKeys: this.state.calendarKeys.concat(id)});
        }
        AsyncStorage.setItem('@calendarKeys:key', JSON.stringify(this.state.calendarKeys));
        firebase.firestore().collection('users').doc(this.state.currentUser.uid).collection('calendars')
            .doc(id).set({
              events: JSON.parse(string).items
            });
        const googleEventsArray = JSON.parse(string).items;
        AsyncStorage.setItem(id, string);
        for (let e of googleEventsArray) {
          try {
            let event = Event.formatGoogle(e);
            this.setState({
              local_events: this.state.local_events.add(event)
            });
          } catch (error) {
            continue;
          }
        }
      }
    }
  }

  retrieveGoogleEventsFromCache(calendarKeys) {
    let calendarPromises = calendarKeys.map((key) => {
      return AsyncStorage.getItem(key);
    })
    let reducer = (accum, currVal) => accum.concat(currVal);
    Promise.all(calendarPromises)
      .then((strings) => {
        strings.map((string) => {
          return JSON.parse(string).items;
        })
        .reduce(reducer, [])
        .forEach((event) => {
          let formattedEvent = Event.formatGoogle(event);
          this.setState({local_events: this.state.local_events.add(formattedEvent)});
        })
      }).catch((error) => {
        alert('event unsupported');
      }).finally(() => {
        this.props.navigator.dismissLightBox();
      })
  }

  retrieveEvents(day) {
      let currentDay = day;
      let retrievedEvents =  this.state.local_events.filter((event) => {
        return moment(event.start).isSame(currentDay, 'day') ||
            currentDay.isBetween(event.start, event.end, 'minute', '[)') ||
            moment(event.end).isSame(currentDay, 'day');
      })
      try {
        let localretrievedEvents = this.state.local_calendar.getEvents(currentDay);
        retrievedEvents = SortedList.merge(localretrievedEvents, retrievedEvents)
      } catch (error) {
        console.log('local calendar has no events inside for that day');
      }
      return retrievedEvents;
  }

  renderRetrievedEvents(retrievedEvents) {
    if (retrievedEvents.isEmpty()) {
      return (
        [<View key={-1} style={styles.empty_view}>
          <Text style={styles.empty_view_text}>No Events</Text>
        </View>]
      )
    }
    return retrievedEvents.map((e) => {
      return (
        <TouchableHighlight
          key={e.id}
          onPress={() => {
            window.requestAnimationFrame(() => {
              this.props.navigator.push({
                screen: 'PlenR.EventDetails',
                title: 'Event Details',
                passProps: {
                  event: e,
                  onDeleteEvent: (event) => {
                    this.setState({local_calendar: this.state.local_calendar.deleteEvent(event)});
                    AsyncStorage.setItem('@localCalendar:key', this.state.local_calendar.toJSON());
                    firebase.firestore().collection('users').doc(this.state.currentUser.uid).collection('calendars')
                        .doc('PlenR Calendar').set({
                          id: this.state.local_calendar.id,
                          events: this.state.local_calendar.eventsList.toArray()
                        });
                  },
                  onAddEvent: (data) => {
                    this.setState({local_calendar: this.state.local_calendar.addEvent(data)})
                    AsyncStorage.setItem('@localCalendar:key', this.state.local_calendar.toJSON());
                    firebase.firestore().collection('users').doc(this.state.currentUser.uid).collection('calendars')
                        .doc('PlenR Calendar').set({
                          id: this.state.local_calendar.id,
                          events: this.state.local_calendar.eventsList.toArray()
                        });
                  }
                },
                animated: true,
              });
            });
          }}
          underlayColor='#f5f5f5'
        >
          <EventBox event={e} day_selected={this.state.currentTime.toDate()}/>
        </TouchableHighlight>
      )})
        .toArray();
  }

  checkIfCalendarDataExists(data) {
    for (let cal of this.state.yearMonthData) {
      if (cal.key == data.key) {
        return this.state.yearMonthData;
      }
    }
    return this.state.yearMonthData.concat(data);
  }

  handlePageChange = (event) => {
    let currentOffset = event.nativeEvent.contentOffset.y;
    let diff = currentOffset - (this.state.scrollOffset || 0);
    let prevMonth = this.state.currentTime.clone().subtract(-diff/300, 'months').toDate();
    let nextMonth = this.state.currentTime.clone().add(diff/300, 'months').toDate();
    let futureMonth = {
      key: moment(nextMonth).clone().add(1, 'months').format("MMMM YYYY"),
      month: moment(nextMonth).clone().add(1, 'months').month(),
      year: moment(nextMonth).clone().add(1, 'months').year(),
    };
    if (diff > 160) {
      this.setState({
        scrollOffset: currentOffset,
        currentTime: moment(nextMonth),
        yearMonthData: this.checkIfCalendarDataExists(futureMonth),
      });
    } else if (diff < -160) {
      this.setState({
        scrollOffset: currentOffset,
        currentTime: moment(prevMonth),
      });
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.navbar}>
          <View style={styles.gap}></View>
          <Text style={styles.month_title}>{monthNames[this.state.currentTime.month()]}</Text>
          <Text>{this.state.currentTime.year()}</Text>
        </View>
        <View style={styles.calendar_month_view}>
          <VirtualizedList
            getItem={(data, index) => data[index]}
            getItemCount={(data) => data.length}
            getItemLayout={(data, index) => (
              {length: 300, offset: 300 * index, index}
            )}
            initialScrollIndex={this.state.yearMonthData.length - 2}
            initialNumToRender={5}
            onMomentumScrollEnd={this.handlePageChange}
            showsVerticalScrollIndicator={false}
            pagingEnabled={true}
            data={this.state.yearMonthData}
            renderItem={({item}) => <CalendarMonthView
              year={item.year}
              month={item.month}
              onDaySelect={(day_selected) => {
                this.setState({currentTime: this.state.currentTime.clone().date(day_selected)});
              }}
              day_selected={item.month == this.state.currentTime.month() ? this.state.currentTime.date() : 1}
            />}
          />
        </View>
        <ScrollView style={styles.events_view}>
          <View style={styles.events}>
            {this.renderRetrievedEvents(this.retrieveEvents(this.state.currentTime))}
          </View>
        </ScrollView>
      </View>
    );
  }
}

var moment = require('moment');

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August",
  "September", "October", "November", "December"];

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gap: {
    height: 20,
  },
  navbar: {
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  month_title: {
    fontWeight: 'bold',
    fontSize: 17,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  navigation_icon: {
    flex: 1,
    marginRight: 0,
  },
  calendar_month_view: {
    height: 300,
  },
  events: {
    backgroundColor: '#fff',
    flex: 1,
  },
  empty_view: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty_view_text: {
    padding: 15,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#aaaaaa'
  },
  events_view: {
    flex: 1,
  },
});
