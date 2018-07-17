import React, { Component } from 'react';

import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Button,
  TouchableHighlight,
} from 'react-native';

import firebase from 'react-native-firebase';

export default class Profile extends Component<Props> {
  static navigatorStyle = {
    largeTitle: true,
  }

  constructor(props) {
    super(props);
    this.state = {
      calendarList: [],
      currentUser: null,
    }
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      this.setState({currentUser: user});
    });
  }

  handleEvents = (calendarID, events_unparsed) => {
    this.props.navigator.handleDeepLink({
      link: 'googleEvents`' + calendarID + '`' + events_unparsed,
    });
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
        <View style={styles.account_container}>
          <Button
            title={this.renderButtonTitle()}
            onPress={() => this.props.navigator.push({
              screen: 'PlenR.GoogleLogin',
              title: 'Calendars',
              passProps: {
                onRetrieveEvents: this.handleEvents,
              },
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
  },
  account_container: {
    padding: 15,
    flex: 1,
    borderBottomWidth: 1,
    borderColor: '#dddddd'
  }
})
