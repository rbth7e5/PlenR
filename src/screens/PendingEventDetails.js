import React, { PureComponent } from 'react';

import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Button,
  TouchableHighlight,
  TouchableWithoutFeedback,
  Platform,
  TextInput,
  Alert,
  Dimensions
} from 'react-native';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import firebase from 'react-native-firebase';

import EventCalendar from 'react-native-events-calendar';

import Event from '../util/Event';
import Calendar from '../util/Calendar';

export default class PendingEventDetails extends PureComponent<Props> {
  static navigatorStyle = {
    navBarNoBorder: true,
    largeTitle: false,
  };

  static navigatorButtons = {
    ...Platform.select({
      ios: {
        rightButtons: [
          {
            id: 'create',
            systemItem: 'add',
          },
        ],
      },
      android: {
        rightButtons: [
          {
            id: 'done',
            title: 'Done'
          }
        ]
      }
    })
  }

  constructor(props) {
    super(props);
    this.state = {
      currentUser: null,
      day_selected: moment(this.props.start),
      events: []
    };
    this.unsubscribe = null;
    this.unsubscribe_users = null;
    this.unsubscribe_calendars = null;
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  componentDidMount() {
    this.unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      this.setState({currentUser: user});
    });
    let dataBaseRef = firebase.firestore().collection('users')
    this.props.event.inviteesAdded.forEach((invitee) => {
      this.unsubscribe_users = dataBaseRef.onSnapshot((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          if (doc.id == invitee.id) {
            let displayName = doc.data().displayName;
            let inviteeDataRef = dataBaseRef.doc(doc.id).collection('calendars');
            this.unsubscribe_calendars = inviteeDataRef.onSnapshot((calendarSnapshot) => {
              calendarSnapshot.forEach((calendar) => {
                if (calendar.id == 'PlenR Calendar') {
                  this.setState({
                    events: this.state.events.concat(Calendar.parseForTimeline(calendar.data().events, displayName))
                  });
                } else {
                  this.setState({
                    events: this.state.events.concat(Calendar.parseGoogleForTimeline(calendar.data().items, displayName))
                  });
                }
              })
            })
          }
        })
      })
    })
    //firebase.firestore().collection('users').where()
  }

  componentWillUnmount() {
    this.unsubscribe();
    this.unsubscribe_users();
    this.unsubscribe_calendars();
  }

  onNavigatorEvent(event) {
    if (event.type == 'NavBarButtonPress') {
      if (event.id == 'create') {
        this.props.navigator.showModal({
          screen: 'PlenR.AddEvent',
          title: 'Add Event',
          animationType: 'slide-up',

        });
      }
    }
  }

  renderWeekDays() {
    const weekDays = ["S", "M", "T", "W", "T", "F", "S"];
    let start = moment(this.props.event.start);
    let week = []
    while (start.isBefore(this.props.event.end, 'day')) {
      week.push(start);
      start = start.clone().add(1, 'days');
    }
    return (
      <View style={styles.top_bar}>
        <View style={styles.weekday}>
          {
            week.map((day, i) => {
              return (
                <View key={i} style={styles.weekday_view}>
                  <Text style={styles.weekday_text}>{weekDays[day.day()]}</Text>
                </View>
              )
            })
          }
        </View>
        <View style={styles.weekday}>
          {
            week.map((day, i) => {
              if (day.isSame(this.state.day_selected, 'day')) {
                return (
                    <TouchableWithoutFeedback
                      key={i}
                      onPress={() => {
                        this.setState({ day_selected: day })
                      }}
                      underlayColor="#fff"
                      style={{borderRadius: 10}}
                    >
                      <View style={styles.selected_view}>
                        <Text style={styles.selected_text}>{day.format('DD')}</Text>
                      </View>
                    </TouchableWithoutFeedback>

                )
              }
              return (
                <TouchableWithoutFeedback
                  key={i}
                  onPress={() => {
                    this.setState({ day_selected: day })
                  }}
                  underlayColor="#f5f5f5"
                  style={{borderRadius: 10}}
                >
                  <View style={styles.day_view}>
                    <Text style={styles.day_text}>{day.format('DD')}</Text>
                  </View>
                </TouchableWithoutFeedback>
              )
            })
          }
        </View>
        <View style={styles.date_string}>
          <Text style={styles.date_string_text}>{this.state.day_selected.format('dddd MMMM DD, YYYY')}</Text>
        </View>
      </View>
    )
  }

  _eventTapped(event) {
    alert(JSON.stringify(event));
  }

  render(){
    let {width} = Dimensions.get('window');
    return (
      <View style={styles.container}>
        {this.renderWeekDays()}
        <EventCalendar
          eventTapped={this._eventTapped.bind(this)}
          events={this.state.events}
          width={width}
          initDate={this.state.day_selected.format('YYYY-MM-DD')}
          scrollToFirst
          upperCaseHeader
          uppercase
          scrollToFirst={false}
        />
        <View style={styles.delete_button}>
          <Button onPress={() => Alert.alert(
                'Confirm Event Deletion',
                'Deleted events cannot be recovered!',
                [
                  {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                  {text: 'Confirm', onPress: () => {
                    firebase.firestore().collection('users').doc(this.state.currentUser.uid).collection('pending_events')
                      .doc(this.props.event.id)
                      .delete()
                      .then(() => {
                        this.props.navigator.popToRoot();
                      })
                      .catch((error) => {
                        alert("Failed to delete!");
                      })
                  }},
                ]
              )
            }
            title='Delete'
            color='#ff0000'
          />
        </View>
      </View>
    )
  }
}

var moment = require('moment');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  gaps_between: {
    padding: 10,
    paddingLeft: 15,
  },
  gap_text: {
    color: '#666666'
  },
  weekday:{
    flexDirection: 'row',
    justifyContent: 'space-evenly'
  },
  weekday_view: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  weekday_text: {
    fontSize: 13,
    textAlign: 'center',
  },
  date_string: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  date_string_text: {
    fontSize: 17,
  },
  selected_view: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selected_text: {
    fontSize: 17,
  },
  day_view: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  day_text: {
    fontSize: 17,
  },
  top_bar: {
    backgroundColor: '#fff',
    height: 120,
    justifyContent: 'space-evenly'
  },
  delete_button: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 45,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#dddddd'
  }
})
