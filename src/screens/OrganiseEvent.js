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
  Alert
} from 'react-native';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import Event from '../util/Event';
import InviteeBox from '../components/InviteeBox';
import PendingEventDetails from './PendingEventDetails';

export default class OrganiseEvent extends PureComponent<Props> {
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
    let currentDate = moment(new Date(props.year_selected, props.month_selected, props.day_selected,
        today.getHours(), 0, 0, 0));
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    this.state = {
      title: '',
      location: '',
      start: currentDate.toDate(),
      end: currentDate.add(6, 'days').toDate(),
      notes: '',
      dateStartPickerVisible: false,
      dateEndPickerVisible: false,
      numOfInvitees: 0,
      inviteesAdded: []
    }
  }

  onNavigatorEvent(event) {
    if (event.type == 'NavBarButtonPress') {
      if (event.id == 'done') {
        if (this.state.numOfInvitees == 0) {
          alert('Why would you organise an event without inviting people? <_<');
        } else if (this.state.title == '') {
          alert('Your event needs a title dear...');
        } else {
          let eventData = {
            title: this.state.title,
            location: this.state.location,
            start: this.state.start,
            end: this.state.end,
            notes: this.state.notes,
            inviteesAdded: this.state.inviteesAdded
          }
          Alert.alert(
            'Permissions Required',
            'Requests for calendar access will be sent to the following invitees: ' +
              this.state.inviteesAdded.map((invitee) => ('\n' + invitee.displayName)),
            [
              {text: 'Cancel', onPress: () => {}, style: 'cancel'},
              {text: 'Send', onPress: () => {
                this.props.onOrganiseEvent(eventData);
                this.props.navigator.showModal({
                  screen: 'PlenR.PendingEvents',
                  title: 'Pending Events'
                })
              }}
            ],
            { cancelable: false }
          )
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
              end: moment(newDate).add(6, 'days').toDate()
            })}
          }
          mode='date'
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
              end: newDate,
              start: moment(newDate).subtract(6, 'days').toDate()
            })}
          }
          mode='date'
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
              placeholder = {'Title'}
              placeholderTextColor = '#aaaaaa'
              onChangeText = {(text) => this.setState({title: text})}
              style={styles.title_text}
              returnKeyType='next'
              ref={ref => {this._titleInput = ref}}
              onSubmitEditing={() => {this._locationInput && this._locationInput.focus()}}
            />
            <TextInput
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
          <View style={styles.gaps_between}>
            <Text style={styles.gap_text}>Select your invitees. Then choose the week your event will happen in.</Text>
          </View>
          <View style={styles.timing}>
            <TouchableHighlight
              onPress={() => {
                window.requestAnimationFrame(() => {
                  this.props.navigator.showModal({
                    screen: 'PlenR.AddInvitees',
                    title: 'Add Invitees',
                    animationType: 'slide-up',
                    passProps: {
                      onAddInvitee: (invitee) => {
                        this.setState({
                          inviteesAdded: this.state.inviteesAdded.concat(invitee),
                          numOfInvitees: this.state.numOfInvitees + 1
                        });
                        this.props.navigator.dismissModal();
                      }
                    }
                  })
                });
              }}
            >
              <View style={styles.start}>
                <View style={styles.start_underline}>
                  <Text style={styles.start_text}>Invitees</Text>
                  <Text style={styles.invitee_text}>{this.state.numOfInvitees == 0 ? 'None' : this.state.numOfInvitees}</Text>
                </View>
              </View>
            </TouchableHighlight>
            {this.state.inviteesAdded.map((invitee) => {
              return <InviteeBox key={invitee.id} info={invitee}/>
            })}
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
                  <Text style={styles.start_text}>Between</Text>
                  <Text style={styles.selection_text}>{this.formatDate(this.state.start)}</Text>
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
              <Text style={styles.start_text}>And</Text>
              <Text style={styles.selection_text}>{this.state.end.toDateString() == this.state.start.toDateString() ?
                    '' : this.formatDate(this.state.end)}</Text>
            </View>
            </TouchableHighlight>
            {this.renderEndDatePicker()}
          </View>
          <View style={styles.gaps_between}></View>
          <View style={styles.gaps_between}></View>
          <View style={styles.notes}>
            <TextInput
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
  invitee_text: {
    fontSize: 17,
    textAlign: 'right',
    paddingRight: 15,
    flex: 1,
    color: '#aaaaaa'
  }
})
