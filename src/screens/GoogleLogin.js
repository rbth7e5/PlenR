import React, { Component } from 'react';

import { GoogleSignin } from 'react-native-google-signin';
import firebase from 'react-native-firebase';
import { ScrollView, Text, View, Button, Platform, StyleSheet, ActivityIndicator, TouchableHighlight } from 'react-native';
import SortedList from '../util/SortedList';
import Event from '../util/Event';
import CalendarBox from '../util/CalendarBox';

export default class GoogleLogin extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      error: null,
      calendarListArray: [],
      signingIn: false,
      retrievingCalendars: false,
    };
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  onNavigatorEvent(event) {
    if (event.type == 'NavBarButtonPress') {
      if (event.id == 'sign in') {
        this.signIn();
      }
      if (event.id == 'sign out') {
        this.signOut();
      }
    }
  }

  async componentDidMount() {
    await this.configureGoogleSignIn();
    await this.getCurrentUser();
    if (this.state.user !== null) {
      await this.getCalendarsFromGoogle();
    }
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
        signingIn: true,
      })
      const data = await GoogleSignin.signIn();

      // create a new firebase credential with the token
      const credential = firebase.auth.GoogleAuthProvider.credential(data.idToken, data.accessToken)
      // login with credential
      const currentUser = await firebase.auth().signInAndRetrieveDataWithCredential(credential);

      this.setState({
        user: data,
        error: null,
        signingIn: false,
      });

      console.info(JSON.stringify(currentUser.user.toJSON()));

      this.getCalendarsFromGoogle();
    } catch (e) {
      this.setState({
        error: e,
        signingIn: false,
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
    this.setState({ retrievingCalendars: true });
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
          retrievingCalendars: false,
        });
      } else {
        this.setState({ retrievingCalendars: false });
        console.warn('error');
      }
    };
    request.open('GET', 'https://www.googleapis.com/calendar/v3/users/me/calendarList?access_token='+this.state.user.accessToken);
    request.send();
  }

  render() {
    const { user, error } = this.state;
    if (!user) {
      this.props.navigator.setButtons({
        rightButtons: [{
          id: 'sign in',
          title: 'Sign In',
        }],
      })
      if (this.state.signingIn) {
        return (
          <View style={styles.signin}>
            <ActivityIndicator size='large' color='#aaaaaa'/>
          </View>
        );
      }
      return (
        <View style={styles.signin}>
          <Text style={styles.signin_text}>Sign in to view Calendars</Text>
        </View>
      );
    } else {
      this.props.navigator.setButtons({
        rightButtons: [{
          id: 'sign out',
          title: 'Sign Out',
        }],
      })
      if (this.state.retrievingCalendars) {
        return (
          <View style={styles.signin}>
            <ActivityIndicator size='large' color='#aaaaaa'/>
          </View>
        );
      }
      return (
        <ScrollView>
        <View style={styles.container}>
        {this.state.calendarListArray.map((calendar) => {
          return (
            <CalendarBox
              key={calendar.id}
              calendar={calendar}
              user={this.state.user}
              onRetrieveEvents={this.props.onRetrieveEvents}
              navigator={this.props.navigator}
            />
          );
        })}
        </View>
        </ScrollView>
      );
    }
  }
}

var moment = require('moment');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: '#f5f5f5'
  },

  signin: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signin_text: {
    fontSize: 17,
    color: '#aaaaaa'
  },

})
