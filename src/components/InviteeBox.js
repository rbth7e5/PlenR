import React, { Component } from 'react';

import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Button,
  TouchableHighlight,
  ActivityIndicator,
} from 'react-native';

export default class InviteeBox extends Component<Props> {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.name}>{this.props.info.displayName}</Text>
        <Text style={styles.email}>{this.props.info.email}</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    paddingLeft: 15,
    height: 70,
    justifyContent: 'space-evenly',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#dddddd',
  },
  name: {
    fontSize: 17,
  },
  email: {
    fontSize: 12,
  }
})
