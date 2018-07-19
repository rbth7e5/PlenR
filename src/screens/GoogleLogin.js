import React, { Component } from 'react';

import { GoogleSignin } from 'react-native-google-signin';
import { ScrollView, Text, View, Button, Platform, StyleSheet, ActivityIndicator, TouchableHighlight, AsyncStorage } from 'react-native';
import SortedList from '../util/SortedList';
import Event from '../util/Event';
import CalendarBox from '../components/CalendarBox';

import firebase from 'react-native-firebase';

export default class GoogleLogin extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      firebaseUser: null,
      calendarListArray: [],
      signingIn: false,
      retrievingCalendars: false,
    };
    this.unsubscribe = null;
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
    this.unsubscribe = await firebase.auth().onAuthStateChanged((user) => {
      this.setState({firebaseUser: user});
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  async configureGoogleSignIn() {
    await GoogleSignin.hasPlayServices({ autoResolve: true })
      .then(() => {
        GoogleSignin.configure({
          scopes: ['https://www.googleapis.com/auth/calendar'],
          ...Platform.select({
            ios: {
              iosClientId: '330206970399-97010ppamcdbf16s2ajv341g22dl03hk.apps.googleusercontent.com'
            },
            android: {

            }
          })
        });
      })
      .catch((error) => {
        alert('play services error');
      });
  }

  async getCurrentUser() {
    try {
      const user = await GoogleSignin.currentUserAsync();
      this.setState({ user });
    } catch (error) {
      this.setState({ user: null });
    }
  }

  signIn = async () => {
    try {
      this.setState({
        signingIn: true,
      })
      const data = await GoogleSignin.signIn();
      const credential = firebase.auth.GoogleAuthProvider.credential(data.idToken, data.accessToken);
      const currentUser = await firebase.auth().signInAndRetrieveDataWithCredential(credential);
      firebase.firestore().collection('users').doc(currentUser.user.uid).set({
        displayName: currentUser.user.displayName,
        email: currentUser.user.email,
      });
      this.setState({
        user: data,
        signingIn: false,
        firebaseUser: currentUser.user
      });
      this.getCalendarsFromGoogle();
    } catch (e) {
      this.setState({
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
      alert('signing out failed!');
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
        const calendarList = JSON.parse(request.responseText).items;
        this.setState({
          calendarListArray: calendarList,
          retrievingCalendars: false,
        });
      } else {
        this.setState({ retrievingCalendars: false });
      }
    };
    Platform.OS === 'ios' ?
    request.open('GET', 'https://www.googleapis.com/calendar/v3/users/me/calendarList?access_token='+this.state.user.accessToken) :
    GoogleSignin.getAccessToken()
                  .then(token => {
                    request.open('GET', 'https://www.googleapis.com/calendar/v3/users/me/calendarList?access_token='+token);
                  })
                  .catch((error) => {
                    alert('access denied');
                  })

    request.send();
  }

  render() {
    const user = this.state.user;
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
              //onRetrieveEvents={this.props.onRetrieveEvents}
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#aaaaaa'
  },

})
