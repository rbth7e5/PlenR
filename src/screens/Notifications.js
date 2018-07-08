import React, { Component } from 'react';

import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Button,
  TouchableHighlight,
  FlatList,
} from 'react-native';

import CalendarMonthView from '../util/CalendarMonthView';

export default class Notifications extends Component<Props> {
  static navigatorStyle = {
    largeTitle: true,
    navBarNoBorder: true,
  }
  render() {
    return (
      <View style={styles.container}>
        <CalendarMonthView year={2018} month={6}/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
})
