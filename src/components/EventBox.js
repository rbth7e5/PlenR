import React, { PureComponent } from 'react';

import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Button,
  TouchableHighlight,
} from 'react-native';

import PropTypes from 'prop-types';

export default class EventBox extends PureComponent<Props> {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={styles.event}>
        <TimeInfo event={this.props.event} day_selected={this.props.day_selected} />
        <View style={styles.event_details}>
          <Text style={styles.event_text}>{this.props.event.title}</Text>
          <Text style={styles.location_text}>{this.props.event.location}</Text>
        </View>
      </View>
    );
  }
}

// TODO: CHECK FOR MONTH AND YEAR FOR MULTI DAY EVENTS.
class TimeInfo extends PureComponent<Props> {
  formatDateAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }
  render() {
    try {
      const formatted_start = this.formatDateAMPM(this.props.event.start);
      const formatted_end = this.formatDateAMPM(this.props.event.end);
      const day_selected_moment = moment(this.props.day_selected);
      if (this.props.event.allday) {
        return (
          <View style={styles.time}>
            <Text style={styles.time_text}>all-day</Text>
          </View>
        );
      } else if (!moment(this.props.event.start).isSame(this.props.event.end, 'day')) {
        if (day_selected_moment.isSame(this.props.event.start, 'day')) {
          return (
            <View style={styles.time}>
              <Text style={styles.time_text}>starts</Text>
              <Text style={styles.time_text}>{formatted_start}</Text>
            </View>
          );
        } else if (day_selected_moment.isBetween(this.props.event.start, this.props.event.end, 'day', '()')) {
          return (
            <View style={styles.time}>
              <Text style={styles.time_text}>all-day</Text>
            </View>
          );
        } else if (day_selected_moment.isSame(this.props.event.end, 'day')) {
          return (
            <View style={styles.time}>
              <Text style={styles.time_text}>ends</Text>
              <Text style={styles.time_text}>{formatted_end}</Text>
            </View>
          );
        } else {
          alert('something wrong with the event. Or I missed out a case in my if-else statement oops');
        }
      } else {
        return (
          <View style={styles.time}>
            <Text style={styles.time_text}>{formatted_start}</Text>
            <Text style={styles.time_text}>{formatted_end}</Text>
          </View>
        );
      }
    } catch (error) {
      console.log(error);
      return (
        <View>
        </View>
      )
    }
  }
}

EventBox.proptypes = {
  start: PropTypes.Date,
  end: PropTypes.Date,
}

var moment = require('moment');

const styles = StyleSheet.create({
  event_text: {
    fontSize: 15,
  },
  event: {
    flexDirection: 'row',
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  time: {
    borderRightWidth: 2,
    borderRightColor: '#999',
    width: 85,
    justifyContent: 'center'
  },
  time_text: {
    paddingLeft: 15,
    fontSize: 12,
  },
  event_details: {
    flex: 1,
    paddingLeft: 10,
    justifyContent: 'space-evenly',
  },
  location_text: {
    fontSize: 10,
  }
})
