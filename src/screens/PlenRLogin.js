import React, { Component } from 'react';

import { GoogleSignin } from 'react-native-google-signin';
import { ScrollView, Text, View, Button, Platform, StyleSheet, ActivityIndicator, TouchableHighlight, AsyncStorage } from 'react-native';
import { authorize, refresh, revoke } from 'react-native-app-auth';
import SortedList from '../util/SortedList';
import Event from '../util/Event';
import CalendarBox from '../components/CalendarBox';

const config = {
  issuer: 'https://dev-481057.oktapreview.com/oauth2/default',
  clientId: '0oafpo5p7i18BmlkU0h7',
  redirectUrl: 'com.oktapreview.dev-481057:/callback',
  additionalParameters: {},
  scopes: ['openid', 'profile', 'email', 'offline_access']
};

export default class PlenRLogin extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      authenticated: false,
      accessToken: '',
      accessTokenExpirationDate: '',
      refreshToken: ''
    };
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  componentDidMount() {
    AsyncStorage.getItem('@token:Key')
        .then((authState_unparsed) => {
          let authState = JSON.parse(authState_unparsed);
          if (authState) {
            if (this.checkIfTokenExpired(authState)) {
              this.refresh();
            } else {
              this.setState({
                authenticated: true,
                accessToken: authState.accessToken,
                accessTokenExpirationDate: authState.accessTokenExpirationDate,
                refreshToken: authState.refreshToken
              })
            }
          }
        })
        .catch((error) => {
          console.warn(error);
        })
  }

  checkIfTokenExpired(authState) {
    let expiryDate = moment(authState.accessTokenExpirationDate);
    return expiryDate.isBefore(new Date());
  }

  authorize = async () => {
    try {
      const authState = await authorize(config);
      this.setState({
        authenticated: true,
        accessToken: authState.accessToken,
        accessTokenExpirationDate: authState.accessTokenExpirationDate,
        refreshToken: authState.refreshToken
      })
      AsyncStorage.setItem('@token:Key', JSON.stringify(authState));
    } catch (error) {
      alert('Failed to log in', error.message);
    }
  };

  refresh = async () => {
    try {
      const authState = await refresh(config, {
        refreshToken: this.state.refreshToken
      });
      this.setState({
        authenticated: true,
        accessToken: authState.accessToken || this.state.accessToken,
        accessTokenExpirationDate: authState.accessTokenExpirationDate || this.state.accessTokenExpirationDate,
        refreshToken: authState.refreshToken || this.state.refreshToken
      })
      AsyncStorage.setItem('@token:Key', JSON.stringify(authState));
    } catch (error) {
      alert('Faield to refresh token', error.message);
    }
  };

  revoke = async () => {
    try {
      await revoke(config, {
        tokenToRevoke: this.state.accessToken,
        sendClientId: true
      });
      this.setState({
        authenticated: false,
        accessToken: '',
        accessTokenExpirationDate: '',
        refreshToken: ''
      });
    } catch (error) {
      alert('Failed to revoke token', error.message);
    }
  };

  onNavigatorEvent(event) {
    if (event.type == 'NavBarButtonPress') {
      if (event.id == 'sign in') {
        this.authorize();
      }
      if (event.id == 'sign out') {
        this.revoke();
      }
    }
  }

  render() {
    this.state.authenticated ?
      this.props.navigator.setButtons({
        rightButtons: [{
          id: 'sign out',
          title: 'Sign Out',
        }],
      }) :
      this.props.navigator.setButtons({
        rightButtons: [{
          id: 'sign in',
          title: 'Sign In',
        }],
      });

    return (
      <ScrollView>
      <View style={styles.container}>
        <Text>{this.state.accessTokenExpirationDate}</Text>
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
