import React, { Component } from 'react';

import {
  StyleSheet,
  Platform,
  Text,
  View,
  ScrollView,
  Button,
  TouchableHighlight,
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
        id: 'pending_events',
        systemItem: 'organize'
      }
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
      scrollOffset: (data.length - 2) * 300,
      yearMonthData: data,
      local_calendars: [],
      google_calendars: null,
      refresh: false
    }
    this.unsubscribe = [];
    this.dataBaseRef = firebase.firestore().collection('users');
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  componentDidMount() {
    this.unsubscribe.push(
      firebase.auth().onAuthStateChanged((user) => {
        this.setState({currentUser: user});
        if (user) {
          this.props.navigator.showLightBox({
            screen: 'PlenR.Loading',
            style: {
              backgroundBlur: 'light',
              tapBackgroundToDismiss: false,
            }
          });
          //get calendars ref from user
          let calendarRef = this.dataBaseRef.doc(user.uid).collection('calendars');
          //get events from database
          this.unsubscribe.push(
            calendarRef.onSnapshot((querySnapshot) => {
                //let combined_google = [];
                querySnapshot.forEach((doc) => {
                  //if (doc.id !== 'PlenR Calendar') {
                    //combined_google = combined_google.concat(doc.data().items);
                  //} else {
                    this.unsubscribe.push(
                      doc.ref.collection('events')
                        .where('start', '<=', this.state.currentTime.clone().endOf('month').toDate())
                        .where('start', '>=', this.state.currentTime.clone().startOf('month').toDate())
                        .onSnapshot((eventsSnapshot) => {
                          let eventsArray = [];
                          eventsSnapshot.forEach((event) => {
                            eventsArray.push(event.data());
                          });
                          this.setState({ local_calendars: this.state.local_calendars
                                .slice()
                                .filter(calendar => calendar.title !== doc.id)
                                .concat(Calendar.parse(eventsArray, doc.id)) });
                          this.props.navigator.dismissLightBox();
                        }, (error) => {
                          alert('error retrieving events from database!');
                          this.props.navigator.dismissLightBox();
                        })
                    );
                  //}
                });
                //this.setState({ google_calendars: Calendar.parseGoogle(combined_google) });

              }, (error) => {
                alert('error retrieving events from database!');
                this.props.navigator.dismissLightBox();
              })
          );
        } else {
          this.setState({local_calendars: []})
        }
      })
    );
  }

  componentWillUnmount() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe());
  }

  onNavigatorEvent(event) {
    if (event.type == 'NavBarButtonPress') {
      if (event.id == 'add') {
        if (this.state.currentUser) {
          this.props.navigator.showModal({
            screen: 'PlenR.AddEvent',
            title: 'Add Event',
            animationType: 'slide-up',
            passProps: {
              year_selected: this.state.currentTime.year(),
              month_selected: this.state.currentTime.month(),
              day_selected: this.state.currentTime.date(),
              onAddEvent: (data) => {
                firebase.firestore().collection('users').doc(this.state.currentUser.uid).collection('calendars')
                    .doc('PlenR Calendar')
                    .collection('events')
                    .doc(data.id)
                    .set(data);
              }
            }
          });
        } else {
          alert('You must be signed in to add events!');
        }
      }
      if (event.id == 'organise') {
        if (this.state.currentUser) {
          this.props.navigator.showModal({
            screen: 'PlenR.OrganiseEvent',
            title: 'Organise Event',
            animationType: 'slide-up',
            passProps: {
              year_selected: this.state.currentTime.year(),
              month_selected: this.state.currentTime.month(),
              day_selected: this.state.currentTime.date(),
              onOrganiseEvent: (data) => {
                firebase.firestore().collection('users').doc(this.state.currentUser.uid).collection('pending_events')
                    .add(data);
              }
            }
          })
        } else {
          alert('You must be signed in to organise events!')
        }
      }
      if (event.id == 'pending_events') {
        this.props.navigator.showModal({
          screen: 'PlenR.PendingEvents',
          title: 'Pending Events',
          animationType: 'slide-up',
          passProps: {
            onAddEvent: (data, invitees) => {
              firebase.firestore().collection('users').doc(this.state.currentUser.uid).collection('calendars')
                  .doc('PlenR Calendar')
                  .collection('events')
                  .doc(data.id)
                  .set(data);
              invitees.forEach((invitee) => {
                firebase.firestore().collection('users').doc(invitee.id).collection('calendars')
                    .doc('PlenR Calendar')
                    .collection('events')
                    .doc(data.id)
                    .set(data);
              })
            }
          }
        });
      }
    }
  }

  onSignOut() {
    this.setState({
      local_calendars: []
    })
  }

  retrieveEvents(currentDay) {
    let retrievedEvents = new SortedList(Event.eventComparator);
    try {
      this.state.local_calendars.forEach((calendar) => {
        retrievedEvents = SortedList.merge(retrievedEvents, calendar.getEvents(currentDay));
      })
      //let googleRetrievedEvents = this.state.google_calendars ?
        //  this.state.google_calendars.getEvents(currentDay) :
          //new SortedList(Event.eventComparator);
      //retrievedEvents = localRetrievedEvents.merge(googleRetrievedEvents);
    } catch (error) {
      console.log('local calendar has no events inside for that day');
      retrievedEvents = null;
    }
    return retrievedEvents;
  }

  renderRetrievedEvents(retrievedEvents) {
    if (retrievedEvents == null || retrievedEvents.isEmpty()) {
      return (
        [<View key={-1} style={styles.empty_view}>
          <Text style={styles.empty_view_text}>No Events</Text>
        </View>]
      )
    }
    return retrievedEvents.map((e) => {
      return (
        <EventBox
          key={e.id}
          ref={(ref) => (this.viewRef = ref)}
          event={e}
          day_selected={this.state.currentTime.toDate()}
          onPress={() => {
            window.requestAnimationFrame(() => {
              this.props.navigator.push({
                screen: 'PlenR.EventDetails',
                title: 'Event Details',
                passProps: {
                  event: e,
                  onDeleteEvent: (event) => {
                    firebase.firestore().collection('users').doc(this.state.currentUser.uid).collection('calendars')
                        .doc('PlenR Calendar')
                        .collection('events')
                        .doc(event.id)
                        .delete()
                        .then(() => {
                          alert('Event successfully deleted!');
                        })
                        .catch((error) => {
                          alert('Error deleting event!');
                        });
                  },
                  onAddEvent: (data) => {
                    firebase.firestore().collection('users').doc(this.state.currentUser.uid).collection('calendars')
                        .doc('PlenR Calendar')
                        .collection('events')
                        .doc(data.id)
                        .set(data);
                  }
                },
              });
            });
          }}
          onLongPress={() => {
            window.requestAnimationFrame(() => {
              this.props.navigator.push({
                screen: 'PlenR.EventDetails',
                title: 'Event Details',
                passProps: {
                  event: e,
                  onDeleteEvent: (event) => {
                    firebase.firestore().collection('users').doc(this.state.currentUser.uid).collection('calendars')
                        .doc('PlenR Calendar')
                        .collection('events')
                        .doc(event.id)
                        .delete()
                        .then(() => {
                          alert('Event successfully deleted!');
                        })
                        .catch((error) => {
                          alert('Error deleting event!');
                        });
                  },
                  onAddEvent: (data) => {
                    firebase.firestore().collection('users').doc(this.state.currentUser.uid).collection('calendars')
                        .doc('PlenR Calendar')
                        .collection('events')
                        .doc(data.id)
                        .set(data);
                  }
                },
                previewView: this.viewRef,
              });
            })
          }}
        />
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
    let prevMonth = this.state.currentTime.clone().subtract(-diff/300, 'months');
    let nextMonth = this.state.currentTime.clone().add(diff/300, 'months');
    let today = moment();
    let futureMonth = {
      key: nextMonth.clone().add(1, 'months').format("MMMM YYYY"),
      month: nextMonth.clone().add(1, 'months').month(),
      year: nextMonth.clone().add(1, 'months').year(),
    };
    if (diff > 160) {
      this.setState({
        scrollOffset: currentOffset,
        currentTime: nextMonth.isSame(today, 'month') ? today : nextMonth.startOf('month'),
        yearMonthData: this.checkIfCalendarDataExists(futureMonth),
        refresh: !this.state.refresh
      });
      this.updateLocalCalendar(nextMonth);
    } else if (diff < -160) {
      this.setState({
        scrollOffset: currentOffset,
        currentTime: prevMonth.isSame(today, 'month') ? today : prevMonth.startOf('month'),
        refresh: !this.state.refresh
      });
      this.updateLocalCalendar(prevMonth);
    }
  }

  updateLocalCalendar(time) {
    if (this.state.currentUser) {
      //get calendars ref from user
      let calendarRef = this.dataBaseRef.doc(this.state.currentUser.uid).collection('calendars');
      //get events from database
      this.unsubscribe.push(
        calendarRef.onSnapshot((querySnapshot) => {
            //let combined_google = [];
            querySnapshot.forEach((doc) => {

                this.unsubscribe.push(
                  doc.ref.collection('events')
                    .where('start', '<=', time.clone().endOf('month').toDate())
                    .where('start', '>=', time.clone().startOf('month').toDate())
                    .onSnapshot((eventsSnapshot) => {
                      let eventsArray = [];
                      eventsSnapshot.forEach((event) => {
                        eventsArray.push(event.data());
                      });
                      this.setState({ local_calendars: this.state.local_calendars
                            .slice()
                            .filter(calendar => calendar.title !== doc.id)
                            .concat(Calendar.parse(eventsArray, doc.id)) });
                    }, (error) => {
                      alert('error retrieving events from database!');
                    })
                );

            });
            //this.setState({ google_calendars: Calendar.parseGoogle(combined_google) });
            //this.props.navigator.dismissLightBox();
          }, (error) => {
            alert('error retrieving events from database!');
            //this.props.navigator.dismissLightBox();
          })
      );
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
            extraData={this.state.currentTime}
            getItem={(data, index) => data[index]}
            getItemCount={(data) => data.length}
            getItemLayout={(data, index) => (
              {length: 300, offset: 300 * index, index}
            )}
            initialScrollIndex={this.state.yearMonthData.length - 2}
            initialNumToRender={1}
            onMomentumScrollEnd={this.handlePageChange}
            showsVerticalScrollIndicator={false}
            pagingEnabled={true}
            data={this.state.yearMonthData}
            renderItem={({item}) => <CalendarMonthView
              key={this.state.refresh}
              year={item.year}
              month={item.month}
              onDaySelect={(day_selected) => {
                this.setState({currentTime: this.state.currentTime.clone().date(day_selected)});
              }}
              day_selected={this.state.currentTime}
            />}
          />
        </View>
        <View style={{padding: 5, backgroundColor: '#f5f5f5'}}></View>
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
