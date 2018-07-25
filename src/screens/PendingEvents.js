import React, { Component } from 'react';

import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Button,
  TouchableHighlight,
  Platform
} from 'react-native';

import styleConstructor from '../util/style';

import { List, ListItem } from 'react-native-elements';
import firebase from 'react-native-firebase';

export default class PendingEvents extends Component<Props> {
  static navigatorStyle = {
    largeTitle: true,
  }

  static navigatorButtons = {
    ...Platform.select({
      ios: {
        rightButtons: [
          {
            id: 'done',
            systemItem: 'done'
          }
        ],
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
    this.unsubscribe = null;
    this.state = {
      currentUser: null,
      pendingEvents: [],
    };
    this.styles = styleConstructor();
    this.unsubscribe_pending_events = null;
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  onNavigatorEvent(event) {
    if (event.type == 'NavBarButtonPress') {
      if (event.id == 'done') {
        this.props.navigator.dismissAllModals();
      }
    }
  }

  componentDidMount() {
    this.unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      this.setState({currentUser: user});
      this.unsubscribe_pending_events = firebase.firestore().collection('users').doc(user.uid).collection('pending_events')
          .onSnapshot((querySnapshot) => {
            let retrieved = [];
            querySnapshot.forEach((doc) => {
              let data = doc.data();
              let wrapper = {
                id: doc.id,
                title: data.title,
                start: data.start,
                end: data.end,
                location: data.location,
                notes: data.notes,
                inviteesAdded: data.inviteesAdded
              }
              retrieved.push(wrapper);
            })
            this.setState({ pendingEvents: retrieved });
          });
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
    this.unsubscribe_pending_events();
  }

  render() {
    if (this.state.pendingEvents.length == 0) {
      return (
        <View style={this.styles.box_container}>
          <Text style={this.styles.gap_title}>You have no pending events! Go organise some!</Text>
        </View>
      )
    }
    return (
      <ScrollView style={this.styles.container}>
        <View style={this.styles.gap}></View>
      {
        this.state.pendingEvents.map((event, i) => (
          <ListItem
            key={i}
            onPress={() => {
              this.props.navigator.push({
                screen: 'PlenR.PendingEventDetails',
                title: 'Details',
                passProps: {
                  event: event,
                  onAddEvent: this.props.onAddEvent
                }
              })
            }}
            containerStyle={this.styles.list_box}
            title={event.title}
            subtitle={event.location}
            underlayColor={'#F5F5F6'}
          />
        ))
      }
      </ScrollView>
    );
  }
}
