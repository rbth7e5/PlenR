import React, { Component } from 'react';

import { GoogleSignin } from 'react-native-google-signin';
import { ScrollView, Text, View, Button, Platform, StyleSheet, ActivityIndicator, TouchableHighlight } from 'react-native';
import SortedList from '../util/SortedList';
import Event from '../util/Event';
import CalendarBox from '../components/CalendarBox';

import TokenClient from '@okta/okta-react-native';

const tokenClient = new TokenClient({
  issuer: 'https://dev-481057.oktapreview.com/oauth2/default',
  client_id: '0oafpo5p7i18BmlkU0h7',
  scope: 'openid profile',
  redirect_uri: __DEV__ ?
    'exp://localhost:19000/+expo-auth-session' :
    'com.oktapreview.dev-481057:/+expo-auth-session'
})

export default class PlenRLogin extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {

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

  render() {
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
