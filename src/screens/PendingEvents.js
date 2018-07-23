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
        <View style={styles.empty_view}>
          <Text style={styles.empty_view_text}>You have no pending events! Go organise some!</Text>
        </View>
      )
    }
    return (
      <ScrollView style={styles.container}>
        <List>
          {
            this.state.pendingEvents.map((event, i) => (
              <ListItem
                key={i}
                title={event.title}
                subtitle={event.location}
                onPress={() => {
                  this.props.navigator.push({
                    screen: 'PlenR.PendingEventDetails',
                    title: 'Details',
                    passProps: event
                  })
                }}
              />
            ))
          }
        </List>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  empty_view: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty_view_text: {
    padding: 20,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#aaaaaa',
    textAlign: 'center'
  },
  account_container: {
    padding: 15,
    flex: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#dddddd',
    backgroundColor: '#fff'
  },
  gap: {
    padding: 10,
  }
})
