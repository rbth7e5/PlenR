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

export default class GroupCalendarView extends PureComponent<Props> {
  static navigatorStyle = {
    navBarNoBorder: true,
  };

  static navigatorButtons = {
    ...Platform.select({
      ios: {
        rightButtons: [
          {
            id: 'create',
            title: 'Create'
          }
        ],
        leftButtons: [
          {
            id: 'close',
            title: 'Close'
          }
        ]
      },
      android: {
        rightButtons: [
          {
            id: 'done',
            title: 'Done'
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
      if (event.id == 'close') {
        this.props.navigator.dismissModal();
      }
    }
  }

  render(){
    const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    return (
      <View style={styles.container}>
        <ScrollView style={styles.container} horizontal={true}>
          <View style={styles.gaps_between}>
            {weekDays.map((day) => {
                return(<Text key={day} style={styles.weekday_text}>{day}</Text>);
              })}
          </View>
        </ScrollView>
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
  weekday_text: {
    fontSize: 13,
    textAlign: 'center',
    flex: 1,
    padding: 5
  }
})
