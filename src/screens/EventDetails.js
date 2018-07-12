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

export default class EventDetails extends Component<Props> {
  static navigatorStyle = {
    navBarNoBorder: true,
  };
  static navigatorButtons = {
    rightButtons: [
      {
        id: 'edit',
        ...Platform.select({
          ios: {
            systemItem: 'edit',
          },
          android: {
            title: 'edit',
          }
        })
      },
    ]
  }

  constructor(props) {
    super(props);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    this.state = {
      event: this.props.event,
    }
  }

  onNavigatorEvent(event) {
    if (event.type == 'NavBarButtonPress') {
      if (event.id == 'edit') {
        if (this.state.event.isImported) {
          alert('Sorry! Editing of Imported Events not supported yet!');
        } else {
          this.props.navigator.showModal({
            screen: 'PlenR.EditEvent',
            title: 'Edit Event',
            animationType: 'slide-up',
            passProps: {
              event: this.props.event,
              onDeleteEvent: (event) => {
                this.props.onDeleteEvent(event);
                this.props.navigator.popToRoot();
              },
              onEditEvent: (event) => {
                this.setState({
                  event: event,
                });
                this.props.onAddEvent(event);
              }
            }
          });
        }
      }
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

  renderTime(start, end) {
    if (start.getFullYear() == end.getFullYear()
        && start.getMonth() == end.getMonth()
        && start.getDate() == end.getDate()) {
      return (
        <View style={styles.timing}>
          <Text>{start.toDateString()}</Text>
          <Text>{this.formatDateAMPM(start) + ' to ' + this.formatDateAMPM(end)}</Text>
        </View>
      )
    } else {
      return (
        <View style={styles.timing}>
          <Text>{this.formatDateAMPM(start) + ' ' + start.toDateString()}</Text>
          <Text>{'to ' + this.formatDateAMPM(end) + ' ' + end.toDateString()}</Text>
        </View>
      )
    }
  }

  renderNotes(notes) {
    if (!notes) {
      return (
        <Text></Text>
      )
    } else {
      return (
        <View style={styles.notes}>
          <Text style={styles.notes_title}>Notes</Text>
          <Text style={styles.notes_text}>{notes}</Text>
        </View>
      )
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView>
          <View style={styles.header}>
            <Text style={styles.title}>{this.state.event.title}</Text>
            <Text style={styles.location}>{this.state.event.location}</Text>
          </View>
          {this.renderTime(this.state.event.start, this.state.event.end)}
          {this.renderNotes(this.state.event.notes)}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    paddingLeft: 20,
    paddingRight: 20,
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
  },
  location: {
    fontSize: 15,
    color: '#555555',
  },
  timing: {
    paddingTop: 20,
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
  notes: {
    flex: 1,
    paddingTop: 20,
  },
  notes_title: {
    fontSize: 17,
  },
  notes_text: {
    fontSize: 15,
    color: '#555555',
  },
  context_content: {
    paddingTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content_text: {
    backgroundColor: '#555555',
    color: '#fff',
    padding: 5,
    flex: 1
  },
  delete_button: {
  }
})
