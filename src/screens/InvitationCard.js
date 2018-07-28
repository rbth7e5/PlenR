import React, { Component } from 'react';

import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Button,
  ScrollView
} from 'react-native';

import styleConstructor from '../util/style';
import { Avatar } from 'react-native-elements';
import EventCalendar from '../components/timeline_view/EventCalendar';
import Calendar from '../util/Calendar';
import firebase from 'react-native-firebase';
import { Navigation } from 'react-native-navigation';

export default class InvitationCard extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      currentUser: null,
      events: []
    }
    this.unsubscribe = [];
    this.dataBaseRef = firebase.firestore().collection('users');
    this.styles = styleConstructor();
  }

  componentDidMount() {
    this.unsubscribe.push(firebase.auth().onAuthStateChanged((user) => {
      this.setState({currentUser: user});
      this.unsubscribe.push(firebase.firestore().collection('users').doc(user.uid).collection('calendars')
        .onSnapshot((calendarSnapshot) => {
          calendarSnapshot.forEach((calendar) => {
            let displayName = user.displayName;
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
    }))
  }

  componentWillUnmount() {
    this.unsubscribe.forEach((unsubscription) => {
      unsubscription();
    });
  }

  _eventTapped(event) {
    alert(JSON.stringify(event));
  }

  render() {
    let { id, title, start, end, location, notes, host_id, host_name, host_photo, inviteesAdded } = this.props;
    return (
      <View style={this.styles.card_container}>
        <View style={this.styles.card_header}>
          <Avatar
            medium
            rounded
            source={{uri: host_photo}}
            activeOpacity={0.7}
          />
          <View style={this.styles.profile_info}>
            <Text style={this.styles.headline}>{host_name}</Text>
            <Text style={this.styles.subhead}>{'invited' + inviteesAdded.map((invitee) => ' ' + invitee.displayName)}</Text>
            <Text style={this.styles.subhead}>{moment(start).format('DD MMM YYYY') + ' to ' + moment(end).format('DD MMM YYYY')}</Text>
          </View>
        </View>
        <ScrollView>
        <CardContent margin_text={'Event Title: '} text={title}/>
        {
          location == '' ? null : (<CardContent margin_text={'Location: '} text={location}/>)
        }
        {
          notes == '' ? null : (<CardContent margin_text={'Notes: \n'} text={notes}/>)
        }
        <View style={this.styles.gap}>
          <Text style={this.styles.gap_text}>Here is your schedule for that week</Text>
        </View>
        <EventCalendar
          eventTapped={this._eventTapped.bind(this)}
          events={this.state.events}
          width={width - 60}
          initDate={moment(start).add(4, 'days').format('YYYY-MM-DD')}
          size={4}
          scrollToFirst
          upperCaseHeader
          uppercase
          scrollEnabled={false}
          scrollToFirst={false}
          event={this.props}
        />
        </ScrollView>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end'}}>
          <View style={{alignItems: 'center'}}>
            <Button
              title={'Deny'}
              color={'red'}
              onPress={() => {
                this.dataBaseRef.doc(this.state.currentUser.uid).collection('notifications')
                  .doc(id)
                  .delete()
                  .then(() => {
                    this.dataBaseRef.doc(this.state.currentUser.uid).collection('access_granted_users')
                      .doc(host_id).set({
                        granted: false
                      })
                    Navigation.dismissLightBox();
                  })

              }}
            />
          </View>
          <View style={{alignItems: 'center'}}>
            <Button
              title={'Grant'}
              onPress={() => {
                this.dataBaseRef.doc(this.state.currentUser.uid).collection('notifications')
                  .doc(id)
                  .delete()
                  .then(() => {
                    this.dataBaseRef.doc(this.state.currentUser.uid).collection('access_granted_users')
                      .doc(host_id).set({
                        granted: true
                      })
                    Navigation.dismissLightBox();
                  })
              }}
            />
          </View>
        </View>
      </View>
    );
  }
}

class CardContent extends Component<Props> {
  constructor(props) {
    super(props);
    this.styles = styleConstructor();
  }

  render() {
    return (
      <View style={this.styles.card_content}>
        <Text>
          <Text style={this.styles.card_margin_text}>{this.props.margin_text}</Text>
          <Text style={this.styles.body}>{this.props.text}</Text>
        </Text>
      </View>
    )
  }
}

var moment = require('moment');
var {height, width} = Dimensions.get('window');
