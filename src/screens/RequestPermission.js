import React, { PureComponent } from 'react';

import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Button,
  TouchableHighlight,
  Platform,
  TextInput,
  DatePickerIOS,
  LayoutAnimation,
  KeyboardAvoidingView,
} from 'react-native';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import Event from '../util/Event';
import InviteeBox from '../components/InviteeBox';

export default class RequestPermission extends PureComponent<Props> {
  static navigatorStyle = {
    navBarNoBorder: true,
  };

  static navigatorButtons = {
    ...Platform.select({
      ios: {
        rightButtons: [
          {
            id: 'send',
            title: 'Send'
          }
        ],
      },
      android: {
        rightButtons: [
          {
            id: 'send',
            title: 'Send'
          }
        ]
      }
    })
  }

  constructor(props) {
    super(props);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  onNavigatorEvent(event) {
    if (event.type == 'NavBarButtonPress') {
      if (event.id == 'send') {
        this.props.navigator.dismissModal();
      }
    }
  }

  render(){
    let notice = 'Permission to access following invitees\' calendars required';
    return (
      <View style={styles.container}>
        <KeyboardAwareScrollView style={styles.container}>
          <View style={styles.gaps_between}></View>
          <View style={styles.gaps_between}>
            <Text style={styles.gap_text}>{notice}</Text>
          </View>
        </KeyboardAwareScrollView>
      </View>
    )
  }
}

var moment = require('moment');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  gaps_between: {
    padding: 10,
    paddingLeft: 15,
  },
  gap_text: {
    color: '#666666'
  },
})
