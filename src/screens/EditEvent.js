import React, { Component } from 'react';

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
  Alert,
} from 'react-native';

import EventDetails from './EventDetails';
import Event from '../util/Event';

export default class EditEvent extends Component<Props> {
  static navigatorButtons = {
    ...Platform.select({
      ios: {
        rightButtons: [
          {
            id: 'done',
            systemItem: 'done'
          }
        ],
        leftButtons: [
          {
            id: 'cancel',
            systemItem: 'cancel'
          }
        ]
      },
      android: {
        rightButtons: [
          {
            id: 'done',
            title: 'done'
          }
        ]
      }
    })
  }

  constructor(props) {
    super(props);
    var today = new Date();
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    this.state = {
      title: this.props.event.title,
      location: this.props.event.location,
      start: this.props.event.start,
      end: this.props.event.end,
      notes: this.props.event.notes,
      dateStartPickerVisible: false,
      dateEndPickerVisible: false,
    }
  }

  onNavigatorEvent(event) {
    if (event.type == 'NavBarButtonPress') {
      if (event.id == 'done') {
        if (this.state.title == '') {
          alert('Event Title Required!')
        } else {
          this.props.onEditEvent(this.props.event.edit({
            title: this.state.title,
            location: this.state.location,
            start: this.state.start,
            end: this.state.end,
            notes: this.state.notes,
            allday: this.state.allday,
          }));
          this.props.navigator.dismissModal();
        }
      } else if (event.id == 'cancel') {
        this.props.navigator.dismissModal();
      }
    }
  }

  renderStartDatePicker() {
    if (this.state.dateStartPickerVisible){
      return(
        <View style={styles.datepickerstart}>
         <DatePickerIOS
          date={this.state.start}
          onDateChange={(newDate) => {this.setState({
              start: newDate,
              end: newDate > this.state.end ? new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate(),
                newDate.getHours() + 1, newDate.getMinutes(), 0, 0) : this.state.end
            })}
          }
          minuteInterval={10}
         />
        </View>
      );
    } else {
      return <View></View>
    }
  }

  renderEndDatePicker() {
    if (this.state.dateEndPickerVisible){
      return(
        <View style={styles.datepickerend}>
         <DatePickerIOS
          date={this.state.end}
          onDateChange={(newDate) => {this.setState({
              end: newDate
            })}
          }
          minuteInterval={10}
         />
        </View>
      );
    } else {
      return <View></View>
    }
  }

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

  formatDate(date) {
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
  }

  render(){
    return (
      <View style={styles.container}>
        <ScrollView>
          <View style={styles.gaps_between}></View>
          <View style={styles.title}>
            <TextInput
              placeholder = 'Title'
              placeholderTextColor = '#aaaaaa'
              defaultValue = {this.props.event.title}
              onChangeText = {(text) => this.state.title = text}
              style={styles.title_text}
            />
            <TextInput
              placeholder = 'Location'
              placeholderTextColor = '#aaaaaa'
              defaultValue = {this.props.event.location}
              onChangeText = {(text) => this.state.location = text}
              style={styles.location_text}
            />
          </View>
          <View style={styles.gaps_between}></View>
          <View style={styles.gaps_between}></View>
          <View style={styles.timing}>
            <TouchableHighlight
              onPress={() => this.setState({
                dateStartPickerVisible: !this.state.dateStartPickerVisible,
                dateEndPickerVisible: false
              })}
            >
              <View style={styles.start}>
                <View style={styles.start_underline}>
                  <Text style={styles.start_text}>Starts</Text>
                  <Text style={styles.selection_text}>{this.formatDate(this.state.start)}</Text>
                  <Text style={styles.selection_text}>{this.formatDateAMPM(this.state.start)}</Text>
                </View>
              </View>
            </TouchableHighlight>
            {this.renderStartDatePicker()}
            <TouchableHighlight
              onPress={() => this.setState({
                dateEndPickerVisible: !this.state.dateEndPickerVisible,
                dateStartPickerVisible: false
              })}
            >
            <View style={styles.end}>
              <Text style={styles.start_text}>Ends</Text>
              <Text style={styles.selection_text}>{this.state.end.toDateString() == this.state.start.toDateString() ?
                    '' : this.formatDate(this.state.end)}</Text>
              <Text style={styles.selection_text}>{this.formatDateAMPM(this.state.end)}</Text>
            </View>
            </TouchableHighlight>
            {this.renderEndDatePicker()}
          </View>
          <View style={styles.gaps_between}></View>
          <View style={styles.gaps_between}></View>
          <View style={styles.notes}>
            <TextInput
              placeholder = 'Notes'
              placeholderTextColor = '#aaaaaa'
              defaultValue = {this.props.event.notes}
              onChangeText = {(text) => this.state.notes = text}
              style={styles.notes_text}
            />
          </View>
        </ScrollView>
        <View style={styles.delete_button}>
          <Button onPress={() => Alert.alert(
                'Confirm Event Deletion',
                'Deleted events cannot be recovered!',
                [
                  {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                  {text: 'Confirm', onPress: () => {
                    this.props.onDeleteEvent(this.props.event);
                    this.props.navigator.dismissModal();
                  }},
                ]
              )
            }
            title='Delete Event'
            color='#ff0000'
          />
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  gaps_between: {
    padding: 10,
  },
  title: {
    paddingLeft: 15,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dddddd',
    justifyContent: 'space-evenly',
  },
  timing: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dddddd',
    justifyContent: 'space-evenly',
  },
  title_text: {
    height: 45,
    fontSize: 17,
    borderBottomWidth: 1,
    borderBottomColor: '#dddddd',
  },
  location_text: {
    height: 45,
    fontSize: 17,
  },
  notes: {
    paddingLeft: 15,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dddddd',
    height: 200,
  },
  notes_text: {
    paddingTop: 10,
    fontSize: 17,
  },
  start: {
    height: 45,
    paddingLeft: 15,
    backgroundColor: '#fff',
  },
  start_underline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#dddddd',
  },
  end: {
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 15,
    backgroundColor: '#fff',
  },
  start_text: {
    fontSize: 17,
    flex: 1,
  },
  datepickerstart: {
    borderBottomWidth: 1,
    borderColor: '#dddddd'
  },
  datepickerend: {
    borderTopWidth: 1,
    borderColor: '#dddddd',
  },
  selection_text: {
    fontSize: 17,
    textAlign: 'right',
    paddingRight: 15,
    flex: 1,
  },
  delete_button: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 45,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#dddddd'
  }
})
