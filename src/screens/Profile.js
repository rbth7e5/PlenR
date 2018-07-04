import React, { Component } from 'react';

import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Button,
  TouchableHighlight,
} from 'react-native';

import GoogleLogin from '../util/GoogleLogin';

export default class Profile extends Component<Props> {
  static navigatorStyle = {
    largeTitle: true,
    navBarNoBorder: true,
  }

  constructor(props) {
    super(props);
    this.state = {
      calendarList: [],
    }
  }

  handleEvents = (events_unparsed) => {
    this.props.navigator.handleDeepLink({
      link: 'googleEvents`' + events_unparsed,
    });
  }

  render() {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.account_container}>
          <GoogleLogin onRetrieveEvents={this.handleEvents}/>
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
    borderBottomColor: '#dddddd'
  }
})
