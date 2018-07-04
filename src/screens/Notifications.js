import React, { Component } from 'react';

import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Button,
  TouchableHighlight,
} from 'react-native';

export default class Notifications extends Component<Props> {
  static navigatorStyle = {
    largeTitle: true,
    navBarNoBorder: true,
  }
  render() {
    return (
      <ScrollView>
        <View style={styles.container}>
          <Text>Test</Text>
        </View>
      </ScrollView>
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
