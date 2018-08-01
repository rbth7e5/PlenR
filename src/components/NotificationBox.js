import React, { Component } from 'react';
import { Navigation } from 'react-native-navigation';

import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Button,
  TouchableHighlight,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';

import { Avatar } from 'react-native-elements';
import firebase from 'react-native-firebase';

export default class NotificationBox extends Component<Props> {
  constructor(props) {
    super(props);
  }

  render() {
    let { type, title, host_name, host_photo } = this.props;
    if (type == 'push') {
      return (
        <TouchableOpacity
          onPress={() => {
            this.props.onSeen();
            Navigation.showLightBox({
              screen: 'PlenR.InvitationCard',
              passProps: this.props,
              style: {
                backgroundBlur: 'light',
                backgroundColor: 'hsla(360, 100%, 100%, 0.0)',
                tapBackgroundToDismiss: true
              }
            })
          }}
        >
          <View style={styles.push_container}>
            <Avatar
              medium
              rounded
              source={{uri: host_photo}}
              activeOpacity={0.7}
            />
            <View style={styles.info}>
              <Text>
                <Text style={styles.title}>{host_name}</Text>
                <Text style={styles.text}>{' has invited you for '}</Text>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.text}>{'! '}</Text>
                <Text style={styles.text}>Your permission to access your schedule is required.</Text>
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      )
    }
    return (
      <TouchableHighlight
        onPress={() => {
          this.props.onSeen();
          Navigation.showLightBox({
            screen: 'PlenR.InvitationCard',
            passProps: this.props,
            style: {
              backgroundBlur: 'light',
              backgroundColor: 'hsla(360, 100%, 100%, 0.0)',
              tapBackgroundToDismiss: true
            }
          })
        }}
      >
      <View style={styles.container}>
        <Avatar
          medium
          rounded
          source={{uri: host_photo}}
          activeOpacity={0.7}
        />
        <View style={styles.info}>
          <Text>
            <Text style={styles.title}>{host_name}</Text>
            <Text style={styles.text}>{' has invited you for '}</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.text}>{'! '}</Text>
            <Text style={styles.text}>Your permission to access your schedule is required.</Text>
          </Text>
        </View>
      </View>
      </TouchableHighlight>
    )
  }
}

var {height, width} = Dimensions.get('window');

var moment = require('moment');

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 90,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderColor: '#dddddd',
  },
  push_container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 90,
    width: width - 20,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 15,
    margin: 20,
    shadowColor: '#555555',
    shadowOffset: {height: 1},
    shadowOpacity: 50,
    shadowRadius: 5,
  },
  info: {
    paddingLeft: 15,
    paddingRight: 15,
    flex: 1
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingBottom: 10,
  },
  text: {
    fontSize: 15,
  },
})
