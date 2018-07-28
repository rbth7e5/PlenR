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

import EventCalendar from '../components/timeline_view/EventCalendar';

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
      events: [],
      invitees_without_access: []
    };
    this.unsubscribe = [];
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  componentDidMount() {
    this.unsubscribe.push(firebase.auth().onAuthStateChanged((user) => {
      this.setState({currentUser: user});
      let dataBaseRef = firebase.firestore().collection('users')
      this.props.event.inviteesAdded.forEach((invitee) => {
        this.unsubscribe.push(
          dataBaseRef.onSnapshot((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              if (doc.id == invitee.id) {
                let access = false;
                dataBaseRef.doc(doc.id).collection('access_granted_users').doc(user.uid)
                  .get()
                  .then((granted_user) => {
                    if (granted_user.exists) {
                      access = granted_user.data().granted;
                    }
                  })
                  .then(() => {
                    if (access) {
                      let displayName = doc.data().displayName;
                      let inviteeDataRef = dataBaseRef.doc(doc.id).collection('calendars');
                      this.unsubscribe.push(
                        inviteeDataRef.onSnapshot((calendarSnapshot) => {
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
                      )
                    } else {
                      this.setState({
                        invitees_without_access: this.state.invitees_without_access.concat(doc.data().displayName)
                      })
                    }
                  })
              }
            })
          })
        )
      })
    }));
  }

  componentWillUnmount() {
    this.unsubscribe.forEach((unsubscription) => {
      unsubscription();
    });
  }

  onNavigatorEvent(event) {
    if (event.type == 'NavBarButtonPress') {
      if (event.id == 'create') {
        this.props.navigator.showModal({
          screen: 'PlenR.AddEvent',
          title: 'Add Event',
          animationType: 'slide-up',
          passProps: {
            title: this.props.event.title,
            location: this.props.event.location,
            notes: this.props.event.notes,
            inviteesAdded: this.props.event.inviteesAdded,
            year_selected: this.state.day_selected.year(),
            month_selected: this.state.day_selected.month(),
            day_selected: this.state.day_selected.date(),
            onAddEvent: this.props.onAddEvent,
            deletePendingEvent: () => {
              firebase.firestore().collection('users').doc(this.state.currentUser.uid).collection('pending_events')
                .doc(this.props.event.id)
                .delete()
                .then(() => {
                  this.props.navigator.popToRoot();
                })
                .catch((error) => {
                  alert("Failed to delete!");
                })
            }
          }
        });
      }
    }
  }

  _eventTapped(event) {
    alert(JSON.stringify(event));
  }

  render(){
    if (this.state.invitees_without_access.length !== 0) {
      alert('You do not have access to the following invitees\' calendars: ' +
        this.state.invitees_without_access.map((invitee) => {
          return '\n' + invitee;
        }))
    }
    let {width} = Dimensions.get('window');
    return (
      <View style={styles.container}>
        <EventCalendar
          eventTapped={this._eventTapped.bind(this)}
          events={this.state.events}
          width={width - 20}
          initDate={moment(this.props.event.start).add(4, 'days').format('YYYY-MM-DD')}
          size={4}
          scrollToFirst
          upperCaseHeader
          uppercase
          dateString
          scrollEnabled
          scrollToFirst={false}
          event={this.props.event}
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
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: '#fff',
  },
  gaps_between: {
    padding: 10,
    paddingLeft: 15,
  },
  gap_text: {
    color: '#666666'
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
