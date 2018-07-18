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

export default class CalendarBox extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      retrievingEvents: false,
    }
  }

  getEventsFromCalendar = async () => {
    this.setState({
      retrievingEvents: true,
    });
    var request = new XMLHttpRequest();
    request.onreadystatechange = (e) => {
      if (request.readyState !== 4) {
        return;
      }
      if (request.status === 200) {
        console.log('success', request.responseText);
        const eventsList = JSON.parse(request.responseText);
        this.setState({
          retrievingEvents: false,
        })
        this.props.onRetrieveEvents(this.props.calendar.summary, request.responseText);
      } else {
        alert('Sync Failed');
        this.setState({
          retrievingEvents: false,
        });
      }
    };
    request.open('GET', 'https://www.googleapis.com/calendar/v3/calendars/'+this.props.calendar.id+'/events?access_token='+this.props.user.accessToken
        + '&timeMin=' + moment().subtract(14, 'days').utc().format().toString());
    request.send();
  }

  renderActivity() {
    if (this.state.retrievingEvents) {
      return <ActivityIndicator size='small' color='#aaaaaa'/>
    } else {
      return <Text style={styles.activity_text}>Sync</Text>
    }
  }

  render() {
    return (
      <View style={styles.calendar_container}>
        <TouchableHighlight underlayColor='#f5f5f5' style={styles.activity} onPress={this.getEventsFromCalendar}>
          {this.renderActivity()}
        </TouchableHighlight>
        <View style={styles.calendar_title}>
          <Text style={styles.calendar_text}>{this.props.calendar.summary}</Text>
        </View>
      </View>
    )
  }
}

var moment = require('moment');

const styles = StyleSheet.create({
  calendar_container: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  activity: {
    width: 85,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 2,
    borderColor: '#999',
  },
  calendar_title: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  calendar_text: {
    fontSize: 17,
    padding: 10,
  },
  activity_text: {
    fontSize: 15,
    padding: 10,
  }
})
