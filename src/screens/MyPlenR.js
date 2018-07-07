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
  ActivityIndicator
} from 'react-native';

import EventBox from '../util/EventBox';
import AddEvent from './AddEvent';
import EventDetails from './EventDetails';
import SortedList from '../util/SortedList';
import Event from '../util/Event';

import Icon from 'react-native-vector-icons/FontAwesome';

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
        title: 'Delete Cache'
      },
    ]
  };

  constructor(props) {
    super(props);
    var today = new Date();
    this.state = {
      year: today.getFullYear(),
      month: today.getMonth(),
      day_selected: today.getDate(),
      weekends: 6,
      local_events: new SortedList(Event.eventComparator),
      retrievingEvents: true,
      calendarKeys: [],
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
            year_selected: this.state.year,
            month_selected: this.state.month,
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
        this.setState({calendarKeys: this.state.calendarKeys.concat(id)});
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
    let currentDay = moment(new Date(this.state.year, this.state.month, day));
    return this.state.local_events.filter((event) => {
      if (event.start.getFullYear() == this.state.year
          && event.start.getMonth() == this.state.month
          && event.start.getDate() == day) {
        return true;
      } else if (currentDay.isBetween(event.start, event.end, 'minute', '[)')) {
        return true;
      } else return false;
    })
  }

  renderRetrievedEvents(retrievedEvents, day_selected) {
    let date_selected = new Date(this.state.year, this.state.month, day_selected);
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

  isToday(day) {
    var today = new Date();
    return (this.state.year == today.getFullYear()
      && this.state.month == today.getMonth()
      && day == today.getDate());
  }

  formatDate(day){
    this.state.weekends = (this.state.weekends+1)%7;
    if (day < 0) {
      return (
        <View key={day} style={styles.sibling_view}>
          <Text style={styles.sibling_text}>{-day}</Text>
        </View>
      )
    } else if (this.state.day_selected == day) {
      if (this.isToday(day)) {
        return (
          <View key={day} style={styles.selected_view}>
            <Text style={styles.today}>{day}</Text>
          </View>
        )
      }
      return (
        <View key={day} style={styles.selected_view}>
          <Text style={styles.selected_text}>{day}</Text>
        </View>
      )
    } else if (this.isToday(day)) {
      return (
        <TouchableHighlight
          key={day} onPress={() => {
              this.setState({day_selected: day});
            }
          }
          style={styles.touchable_today}
          underlayColor="#fff"
        >
          <Text key={day} style={styles.today}>{day}</Text>
        </TouchableHighlight>
      )
    } else if (this.state.weekends == 0 || this.state.weekends == 6) {
      return (
        <TouchableHighlight
          key={day} onPress={() => {
              this.setState({day_selected: day});
            }
          }
          style={styles.touchable_days}
          underlayColor="#fff"
        >
          <Text style={styles.weekend_text}>{day}</Text>
        </TouchableHighlight>
      )
    } else {
      return (
        <TouchableHighlight
          key={day} onPress={() => {
              this.setState({day_selected: day});
            }
          }
          style={styles.touchable_days}
          underlayColor="#fff"
        >
          <Text style={styles.day_text}>{day}</Text>
        </TouchableHighlight>
      )
    }
  }

  render() {
    var monthArray = calendar(new Date(this.state.year, this.state.month), {
      formatDate: date => date.getDate(),
      formatSiblingMonthDate: date => -date.getDate()
    });
    var today = new Date();
    return (
      <ScrollView>
        <View style={styles.container}>
          <View style={styles.picker}>
            <View style={styles.picker_item}>
              <Icon.Button
                onPress={() => {
                  this.setState({
                    day_selected: (this.state.month+11)%12 == today.getMonth() ? today.getDate() : 1,
                    month: (this.state.month + 11)%12,
                  })

                }}
                name = "chevron-left"
                backgroundColor = "#fff"
                iconStyle = {styles.picker_icon}
              />
              <Text style={styles.picker_text}>{monthNames[this.state.month]}</Text>
              <Icon.Button
                onPress={() => {
                  this.setState({
                    day_selected: (this.state.month+1)%12 == today.getMonth() ? today.getDate() : 1,
                    month: (this.state.month + 1)%12,

                  })
                }}
                name = "chevron-right"
                backgroundColor = "#fff"
                iconStyle = {styles.picker_icon}
              />
            </View>
            <View style={styles.picker_item}>
              <Icon.Button
                onPress={() => {
                  this.setState({
                    day_selected: (this.state.year+9998)%9999 == today.getFullYear() ? today.getDate() : 1,
                    year: (this.state.year + 9998)%9999,

                  })

                }}
                name = "chevron-left"
                backgroundColor = "#fff"
                iconStyle = {styles.picker_icon}
              />
              <Text style={styles.picker_text}>{this.state.year}</Text>
              <Icon.Button
                onPress={() => {
                  this.setState({
                    day_selected: (this.state.year+1)%9999 == today.getFullYear() ? today.getDate() : 1,
                    year: (this.state.year + 1)%9999,

                  })
                }}
                name = "chevron-right"
                backgroundColor = "#fff"
                iconStyle = {styles.picker_icon}
              />
            </View>
          </View>
          <View style={styles.weekday}>
            {weekDays.map((day) => {
                return(<Text key={day} style={styles.weekday_text}>{day}</Text>);
              })}
          </View>
          {monthArray.map((week) => {
            return(<View key={week} style={styles.weeks}>{week.map((day) => {
              return this.formatDate(day);
            })}</View>);
          })}
          <View style={styles.gap}></View>
          <View style={styles.events}>
            {this.renderRetrievedEvents(this.retrieveEventsForDay(this.state.day_selected), this.state.day_selected)}
          </View>
        </View>
      </ScrollView>
    );
  }
}

var moment = require('moment');

var calendar = require('calendar-month-array');

const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

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
    justifyContent: 'flex-start'
  },
  navigation_icon: {
    flex: 1,
    marginRight: 0,
  },
  picker: {
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 2,
    backgroundColor: '#fff',
    flexDirection: 'row',
  },
  picker_item: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    flex: 1,
  },
  picker_text: {
    fontWeight: 'bold',
    fontSize: 15,
    width: 100,
    textAlign: 'center',
  },
  picker_icon: {
    fontSize: 15,
    color: '#000',
    marginRight: 0,
  },
  weekday: {
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 2,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F5F5F5',
  },
  weekday_text: {
    fontSize: 13,
    textAlign: 'center',
    flex: 1,
    padding: 5
  },
  weeks: {
    paddingLeft: 15,
    paddingRight: 15,
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: 50,
    backgroundColor: '#f5f5f5',
  },
  today: {
    fontWeight: 'bold',
    fontSize: 17,
  },
  selected_text: {
    fontSize: 17,
  },
  sibling_text: {
    color: '#A9A9A9',
    fontSize: 17,
  },
  day_text: {
    fontSize: 17,
  },
  weekend_text: {
    color: '#0077ff',
    fontSize: 17,
  },
  touchable_today: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  touchable_days: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  sibling_view: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  selected_view: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#fff',
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
  gap: {
    height: 15,
    backgroundColor: '#f5f5f5',
  }
});
