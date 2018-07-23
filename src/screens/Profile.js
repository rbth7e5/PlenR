import React, { Component } from 'react';

import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Button,
  TouchableHighlight,
  Platform
} from 'react-native';

import firebase from 'react-native-firebase';

export default class Profile extends Component<Props> {
  static navigatorStyle = {
    largeTitle: true,
  }

  static navigatorButtons = {
    ...Platform.select({
      ios: {
        rightButtons: [
          {
            id: 'pending_events',
            systemItem: 'organize'
          }
        ],
      },
      android: {
        rightButtons: [
          {
            id: 'pending_events',
            title: 'Pending'
          }
        ]
      }
    })
  }

  constructor(props) {
    super(props);
    this.state = {
      calendarList: [],
      currentUser: null,
    }
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    this.unsubscribe = null;
  }

  onNavigatorEvent(event) {
    if (event.type == 'NavBarButtonPress') {
      if (event.id == 'pending_events') {
        this.props.navigator.showModal({
          screen: 'PlenR.PendingEvents',
          title: 'Pending Events',
          animationType: 'slide-up'
        });
      }
    }
  }

  componentDidMount() {
    this.unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      this.setState({currentUser: user});
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  renderButtonTitle() {
    if (this.state.currentUser) {
      return this.state.currentUser.displayName || 'why do you not have a ****ing name';
    } else {
      return 'Sign in with Google';
    }
  }

  render() {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.gap}></View>
        <View style={styles.gap}></View>
        <View style={styles.account_container}>
          <Button
            title={this.renderButtonTitle()}
            onPress={() => this.props.navigator.push({
              screen: 'PlenR.GoogleLogin',
              title: 'Calendars',
              animated: true,
            })}
          />
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  account_container: {
    padding: 15,
    flex: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#dddddd',
    backgroundColor: '#fff'
  },
  gap: {
    padding: 10,
  }
})
