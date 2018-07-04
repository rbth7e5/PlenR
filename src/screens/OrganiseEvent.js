import React, { Component } from 'react';

import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Button,
  TouchableHighlight,
  Platform,
} from 'react-native';

export default class OrganiseEvent extends Component<Props> {
  static navigatorButtons = {
    rightButtons: [
      {
        id: 'done',
        ...Platform.select({
          ios: {
            systemItem: 'done',
          },
          android: {
            title: 'done',
          }
        })
      },
    ]
  }

  constructor(props) {
    super(props);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  onNavigatorEvent(event) {
    if (event.type == 'NavBarButtonPress') {
      if (event.id == 'done') {
        this.props.navigator.dismissModal();
      }
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>You have arrived at OrganiseEvents Screen</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  }
})
