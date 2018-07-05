import React, { Component } from 'react';

import { GoogleSignin } from 'react-native-google-signin';
import firebase from 'react-native-firebase';
import { ScrollView, Text, View, Button, Platform, StyleSheet, ActivityIndicator } from 'react-native';
import SortedList from './SortedList';
import Event from './Event';

export default class GoogleLogin extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      error: null,
      calendarListArray: [],
      syncing: false,
      loading: false,
      loading_calendar_id: ''
    };
  }

  async componentDidMount() {
    await this.configureGoogleSignIn();
    await this.getCurrentUser();
  }

  async configureGoogleSignIn() {
    await GoogleSignin.configure({
      ...Platform.select({
        ios: {
          scopes: ['https://www.googleapis.com/auth/calendar'],
          iosClientId: '330206970399-97010ppamcdbf16s2ajv341g22dl03hk.apps.googleusercontent.com'
        },
        android: {}
      })
    });
  }

  async getCurrentUser() {
    try {
      const user = await GoogleSignin.currentUserAsync();
      this.setState({ user, error: null});
    } catch (error) {
      this.setState({ error, });
    }
  }

  signIn = async () => {
    try {
      this.setState({
        syncing: true,
      })
      const data = await GoogleSignin.signIn();

      // create a new firebase credential with the token
      const credential = firebase.auth.GoogleAuthProvider.credential(data.idToken, data.accessToken)
      // login with credential
      const currentUser = await firebase.auth().signInAndRetrieveDataWithCredential(credential);

      this.setState({
        user: data,
        error: null,
        syncing: false,
      });

      console.info(JSON.stringify(currentUser.user.toJSON()));
    } catch (e) {
      this.setState({
        error: e,
        syncing: false,
      })
    }
  }

  signOut = async () => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      await firebase.auth().signOut();
      this.setState({
        user: null,
        calendarListArray: []
      });
    } catch (error) {
      this.setState({
        error: error,
      });
      console.error(error);
    }
  }

  getCalendarsFromGoogle = async () => {
    var request = new XMLHttpRequest();
    request.onreadystatechange = (e) => {
      if (request.readyState !== 4) {
        return;
      }
      if (request.status === 200) {
        console.log('success', request.responseText);
        this.setState({events: request.responseText});
        const calendarList = JSON.parse(request.responseText);
        this.setState({
          calendarListArray: calendarList.items,
        });
      } else {
        console.warn('error');
      }
    };
    request.open('GET', 'https://www.googleapis.com/calendar/v3/users/me/calendarList?access_token='+this.state.user.accessToken);
    request.send();
  }

  getEventsFromCalendar = async (calendarID) => {
    this.setState({
      loading: true,
      loading_calendar_id: calendarID
    });
    var request = new XMLHttpRequest();
    request.onreadystatechange = (e) => {
      if (request.readyState !== 4) {
        return;
      }
      if (request.status === 200) {
        console.log('success', request.responseText);
        this.setState({events: request.responseText});
        const eventsList = JSON.parse(request.responseText);
        this.setState({
          eventsListArray: JSON.stringify(eventsList.items),
          loading: false
        })
        this.props.onRetrieveEvents(request.responseText);
      } else {
        alert('Sync Failed');
        this.setState({
          loading: false
        });
      }
    };

    request.open('GET', 'https://www.googleapis.com/calendar/v3/calendars/'+calendarID+'/events?access_token='+this.state.user.accessToken
        + '&timeMin=' + moment().subtract(2, 'months').utc().format().toString());
    request.send();

  }

  render() {
    const { user, error } = this.state;
    if (!user) {
      if (this.state.syncing) {
        return <ActivityIndicator key={-1} size='small' color='#aaaaaa'/>
      } else {
        return (
          <Button title='Import From Google' onPress={this.signIn}/>
        );
      }
    } else {
      return (
        <ScrollView style={styles.container}>
        <Button flex={1} title='View Calendars' onPress={this.getCalendarsFromGoogle}/>
        {this.state.calendarListArray.map((calendar) => {
          if (this.state.loading && calendar.id == this.state.loading_calendar_id) {
            return <ActivityIndicator key={-1} size='small' color='#aaaaaa'/>
          } else {
            let newTitle = 'Import ' + calendar.summary
            return (<Button
                key={calendar.id}
                title={newTitle}
                onPress={() => {
                  this.getEventsFromCalendar(calendar.id)
                }}
              />)
            }
        })}
        <Button flex={1} title='Sign Out' onPress={this.signOut}/>
        </ScrollView>
      );
    }
  }
}
var moment = require('moment');

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
})
