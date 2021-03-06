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

export default class AddEvent extends PureComponent<Props> {
  static navigatorStyle = {
    navBarNoBorder: true,
  };
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
      title: this.props.title ? this.props.title : '',
      location: this.props.location ? this.props.location : '',
      start: new Date(props.year_selected, props.month_selected, props.day_selected,
          today.getHours(), 0, 0, 0),
      end: new Date(props.year_selected, props.month_selected, props.day_selected, today.getHours() + 1,
          0, 0, 0),
      notes: this.props.notes ? this.props.notes : '',
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
          this.props.onAddEvent(new Event({
            title: this.state.title,
            location: this.state.location,
            start: this.state.start,
            end: this.state.end,
            notes: this.state.notes,
            allday: false,
          }), this.props.inviteesAdded);
          if (this.props.deletePendingEvent) {
            this.props.deletePendingEvent();
          }
          this.props.navigator.dismissAllModals();
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
          onDateChange={(newDate) => {
            this.setState({
              start: newDate,
              end: new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate(),
                newDate.getHours() + 1, newDate.getMinutes(), 0, 0)
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
    let pickerAnimationSetting = {
      duration: 300,
      create: {
        type: LayoutAnimation.Types.linear,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
    };
    return (
      <View style={styles.container}>
        <KeyboardAwareScrollView style={styles.container}>
          <View style={styles.gaps_between}></View>
          <View style={styles.title}>
            <TextInput
              defaultValue = {this.state.title}
              placeholder = {'Title'}
              placeholderTextColor = '#aaaaaa'
              onChangeText = {(text) => this.setState({title: text})}
              style={styles.title_text}
              returnKeyType='next'
              ref={ref => {this._titleInput = ref}}
              onSubmitEditing={() => {this._locationInput && this._locationInput.focus()}}
            />
            <TextInput
              defaultValue = {this.state.location}
              placeholder = {'Location'}
              placeholderTextColor = '#aaaaaa'
              onChangeText = {(text) => this.setState({location: text})}
              style={styles.location_text}
              returnKeyType='next'
              ref={ref => {this._locationInput = ref}}
              onSubmitEditing={() => {
                LayoutAnimation.configureNext(pickerAnimationSetting);
                this.setState({
                  dateStartPickerVisible: !this.state.dateStartPickerVisible,
                  dateEndPickerVisible: false
                });
              }}
            />
          </View>
          <View style={styles.gaps_between}></View>
          <View style={styles.gaps_between}></View>
          <View style={styles.timing}>
            <TouchableHighlight
              onPress={() => {
                window.requestAnimationFrame(() => {
                  LayoutAnimation.configureNext(pickerAnimationSetting);
                  this.setState({
                    dateStartPickerVisible: !this.state.dateStartPickerVisible,
                    dateEndPickerVisible: false
                  });
                });
              }}
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
              onPress={() => {
                window.requestAnimationFrame(() => {
                  LayoutAnimation.configureNext(pickerAnimationSetting);
                  this.setState({
                    dateEndPickerVisible: !this.state.dateEndPickerVisible,
                    dateStartPickerVisible: false
                  });
                });
              }}
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
              defaultValue = {this.state.notes}
              placeholder = {'Notes'}
              placeholderTextColor = '#aaaaaa'
              onChangeText = {(text) => this.state.notes = text}
              style={styles.notes_text}
              multiline={true}
            />
          </View>
        </KeyboardAwareScrollView>
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start'
  },
  notes_text: {
    paddingTop: 10,
    paddingRight: 100,
    paddingBottom: 150,
    fontSize: 17,
    flex: 1,
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
})
