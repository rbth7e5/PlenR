import React, { PureComponent } from 'react';

import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Button,
  TouchableHighlight,
} from 'react-native';

export default class CalendarMonthView extends PureComponent<Props> {
  constructor(props) {
    super(props);
    this.state = {
      weekends: 6,
      day_selected: this.props.day_selected
    }
  }

  isToday(day) {
    var today = new Date();
    return (this.props.year == today.getFullYear()
      && this.props.month == today.getMonth()
      && day == today.getDate());
  }

  setAndReportDaySelected(day) {
    this.setState({day_selected: day});
    this.props.onDaySelect(day);
  }

  formatDate(day){
    this.state.weekends = (this.state.weekends+1)%7;
    if (day < 0) {
      return (
        <View key={day} style={styles.sibling_view}>
          <Text style={styles.sibling_text}>{-day}</Text>
        </View>
      )
    } else if (this.state.day_selected == day) {
      if (this.isToday(day)) {
        return (
          <View key={day} style={styles.selected_view}>
            <Text style={styles.today_text}>{day}</Text>
          </View>
        )
      }
      return (
        <View key={day} style={styles.selected_view}>
          <Text style={styles.selected_text}>{day}</Text>
        </View>
      )
    } else if (this.isToday(day)) {
      return (
        <TouchableHighlight
          key={day} onPress={() => this.setAndReportDaySelected(day)}
          style={styles.touchable_today}
          underlayColor="#fff"
        >
          <Text key={day} style={styles.today_text}>{day}</Text>
        </TouchableHighlight>
      )
    } else if (this.state.weekends == 0 || this.state.weekends == 6) {
      return (
        <TouchableHighlight
          key={day} onPress={() => this.setAndReportDaySelected(day)}
          style={styles.touchable_days}
          underlayColor="#fff"
        >
          <Text style={styles.weekend_text}>{day}</Text>
        </TouchableHighlight>
      )
    } else {
      return (
        <TouchableHighlight
          key={day} onPress={() => this.setAndReportDaySelected(day)}
          style={styles.touchable_days}
          underlayColor="#fff"
        >
          <Text style={styles.day_text}>{day}</Text>
        </TouchableHighlight>
      )
    }
  }

  render() {
    var calendar = require('calendar-month-array');
    const monthArray = calendar(new Date(this.props.year, this.props.month), {
      formatDate: date => date.getDate(),
      formatSiblingMonthDate: date => -date.getDate()
    });
    const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    return (
      <View style={styles.container}>
        <View style={styles.weekday}>
          {weekDays.map((day) => {
              return(<Text key={day} style={styles.weekday_text}>{day}</Text>);
            })}
        </View>
        {monthArray.map((week) => {
          return(<View key={week} style={styles.weeks}>{week.map((day) => {
            return this.formatDate(day);
          })}</View>);
        })}
      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 300,
  },
  weekday: {
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 5,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F5F5F5',
  },
  weekday_text: {
    fontSize: 13,
    textAlign: 'center',
    flex: 1,
    padding: 5
  },
  weeks: {
    paddingLeft: 15,
    paddingRight: 15,
    flexDirection: 'row',
    justifyContent: 'space-around',
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  sibling_view: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  selected_view: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#fff',
  },
  today_text: {
    fontWeight: 'bold',
    fontSize: 17,
  },
  selected_text: {
    fontSize: 17,
  },
  sibling_text: {
    color: '#A9A9A9',
    fontSize: 17,
  },
  day_text: {
    fontSize: 17,
  },
  weekend_text: {
    color: '#0077ff',
    fontSize: 17,
  },
  touchable_today: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  touchable_days: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
})
