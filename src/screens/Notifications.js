import React, { Component } from 'react';

import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Button,
  TouchableHighlight,
  FlatList,
} from 'react-native';

import firebase from 'react-native-firebase';

import NotificationBox from '../components/NotificationBox';
import styleConstructor from '../util/style';

export default class Notifications extends Component<Props> {
  static navigatorStyle = {
    largeTitle: true,
  }

  constructor(props) {
    super(props);
    this.state = {
      currentUser: null,
      notifications_list: []
    };
    this.styles = styleConstructor();
    this.unsubscribe = [];
  }

  componentDidMount() {
    this.unsubscribe.push(firebase.auth().onAuthStateChanged((user) => {
      this.setState({currentUser: user});
      if (user) {
        this.unsubscribe.push(firebase.firestore().collection('users').doc(user.uid).collection('notifications')
            .onSnapshot((querySnapshot) => {
              let retrieved = [];
              querySnapshot.forEach((doc) => {
                let data = doc.data();
                let wrapper = {
                  id: doc.id,
                  ...data
                }
                if (!wrapper.seen) {
                  this.props.navigator.showInAppNotification({
                    screen: "PlenR.NotificationBox", // unique ID registered with Navigation.registerScreen
                    passProps: {
                      type: 'push',
                      ...wrapper
                    }, // simple serializable object that will pass as props to the in-app notification (optional)
                    autoDismissTimerSec: 2000 // auto dismiss notification in seconds
                  });
                }
                retrieved.push(wrapper);
              })
              this.setState({ notifications_list: retrieved });
            }));
      } else {
        this.setState({ notifications_list: [] });
      }
    }));
  }

  componentWillUnmount() {
    this.unsubscribe.forEach((unsubscribe) => {
      unsubscribe();
    });
  }

  render() {
    if (this.state.notifications_list.length == 0) {
      return (
        <View style={this.styles.box_container}>
          <Text style={this.styles.gap_title}>You have no notifications!</Text>
        </View>
      )
    }
    return (
      <ScrollView style={this.styles.container}>
        {
          this.state.notifications_list.map((notif, i) => {
            return (
              <NotificationBox
                key={i}
                onSeen={() => {
                  firebase.firestore().collection('users').doc(this.state.currentUser.uid).collection('notifications')
                    .doc(notif.id)
                    .update({
                      seen: true
                    });
                }}
                {...notif}
              />
            )
          })
        }
      </ScrollView>
    );
  }
}
