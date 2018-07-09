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
  FlatList
} from 'react-native';

import EventBox from '../components/EventBox';
import AddEvent from './AddEvent';
import EventDetails from './EventDetails';
import SortedList from '../util/SortedList';
import Event from '../util/Event';
import CalendarMonthView from '../components/CalendarMonthView';

export default class MyPlenR extends Component<Props> {
  static navigatorStyle = {
    navBarNoBorder: true,
  };
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
    let prevMonth = today.clone().subtract(1, 'months');
    let nextMonth = today.clone().add(1, 'months');
    this.state = {
      currentTime: today,
      day_selected: today.date(),
      local_events: new SortedList(Event.eventComparator),
      retrievingEvents: true,
      calendarKeys: [],
      scrollOffset: 300,
      yearMonthData: [
        {
          key: prevMonth.format("MMMM YYYY"),
          month: prevMonth.month(),
          year: prevMonth.year(),
        },
        {
          key: today.format("MMMM YYYY"),
          month: today.month(),
          year: today.year(),
        },
        {
          key: nextMonth.format("MMMM YYYY"),
          month: nextMonth.month(),
          year: nextMonth.year(),
        },
      ]
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
        console.log(error, 'failed to retrieve calendar keys');
      })
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
            day_selected: this.state.day_selected,
            onAddEvent: (data) => this.setState({
              local_events: this.state.local_events.add(data)
            })
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
        AsyncStorage.clear()
          .catch((error) => {
            console.log(error)
          });
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
        const googleEventsArray = JSON.parse(string).items;
        AsyncStorage.setItem(id, string);
        for (let e of googleEventsArray) {
          try {
            let event = Event.formatGoogle(e);
            this.setState({
              local_events: this.state.local_events.add(event)
            });
          } catch (error) {
            console.log(error);
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
        console.log(error);
      }).finally(() => {
        this.props.navigator.dismissLightBox();
      })
  }

  retrieveEventsForDay(day) {
    let currentDay = moment(new Date(this.state.currentTime.year(), this.state.currentTime.month(), day));
    return this.state.local_events.filter((event) => {
      if (event.start.getFullYear() == this.state.currentTime.year()
          && event.start.getMonth() == this.state.currentTime.month()
          && event.start.getDate() == day) {
        return true;
      } else if (currentDay.isBetween(event.start, event.end, 'minute', '[)')) {
        return true;
      } else return false;
    })
  }

  renderRetrievedEvents(retrievedEvents, day_selected) {
    let date_selected = new Date(this.state.currentTime.year(), this.state.currentTime.month(), day_selected);
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
            this.props.navigator.push({
              screen: 'PlenR.EventDetails',
              title: 'Event Details',
              passProps: {
                event: e,
                onDeleteEvent: (event) => this.setState({
                  local_events: this.state.local_events.delete(event)
                }),
                onAddEvent: (data) => this.setState({
                  local_events: this.state.local_events.add(data)
                })
              },
              animated: true,
            });
          }}
          underlayColor='#f5f5f5'
        >
          <EventBox event={e} day_selected={date_selected}/>
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
    let prevMonth = this.state.currentTime.clone().subtract(1, 'months');
    let nextMonth = this.state.currentTime.clone().add(1, 'months');
    let futureMonth = {
      key: nextMonth.clone().add(1, 'months').format("MMMM YYYY"),
      month: nextMonth.clone().add(1, 'months').month(),
      year: nextMonth.clone().add(1, 'months').year(),
    };
    let pastMonth = {
      key: prevMonth.clone().subtract(1, 'months').format("MMMM YYYY"),
      month: prevMonth.clone().subtract(1, 'months').month(),
      year: prevMonth.clone().subtract(1, 'months').year(),
    };
    if (Math.abs(diff) < 3) {
      console.log('scrolldirection unclear');
    } else if (diff > 0) {
      this.setState({
        scrollOffset: currentOffset,
        day_selected: (nextMonth.month() == today.month()) ? today.date() : 1,
        currentTime: nextMonth,
        yearMonthData: this.checkIfCalendarDataExists(futureMonth),
      });
      this.props.navigator.setTitle({title: monthNames[nextMonth.month()]});
      this.props.navigator.setSubTitle({subtitle: nextMonth.year().toString()});
    } else {
      this.setState({
        scrollOffset: currentOffset,
        day_selected: (prevMonth.month() == today.month()) ? today.date() : 1,
        currentTime: prevMonth,
      });
      this.props.navigator.setTitle({title: monthNames[prevMonth.month()],});
      this.props.navigator.setSubTitle({subtitle: prevMonth.year().toString()});
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.calendar_month_view}>
          <FlatList
            getItemLayout={(data, index) => (
              {length: 300, offset: 300 * index, index}
            )}
            initialScrollIndex={1}
            onMomentumScrollEnd={this.handlePageChange}
            showsVerticalScrollIndicator={false}
            pagingEnabled={true}
            data={this.state.yearMonthData}
            renderItem={({item}) => <CalendarMonthView
              year={item.year}
              month={item.month}
              onDaySelect={(day_selected) => {
                this.setState({day_selected: day_selected});
              }}
              day_selected={item.month == this.state.currentTime.month() ? this.state.day_selected : 1}
            />}
          />
        </View>
        <ScrollView style={styles.events_view}>
          <View style={styles.events}>
            {this.renderRetrievedEvents(this.retrieveEventsForDay(this.state.day_selected), this.state.day_selected)}
          </View>
        </ScrollView>
      </View>
    );
  }
}

var moment = require('moment');

var today = moment();

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August",
  "September", "October", "November", "December"];

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  events_view: {
    flex: 1,
  },
});
