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

import firebase from 'react-native-firebase';
import { List, ListItem, Avatar } from 'react-native-elements';

export default class Profile extends Component<Props> {
  static navigatorStyle = {
    largeTitle: true,
    navBarNoBorder: true
  }

  constructor(props) {
    super(props);
    this.state = {
      calendarList: [],
      currentUser: null,
    }
    this.styles = styleConstructor();
    this.dataBaseRef = firebase.firestore().collection('users')
    this.unsubscribe = [];
  }

  componentDidMount() {
    this.unsubscribe.push(firebase.auth().onAuthStateChanged((user) => {
      this.setState({currentUser: user});
      if (user) {
        this.unsubscribe.push(firebase.firestore().collection('users').doc(user.uid).collection('calendars')
            .where("tag", "==", "local")
            .onSnapshot((querySnapshot) => {
              let retrieved = [];
              querySnapshot.forEach((doc) => {
                let data = doc.data();
                let wrapper = {
                  id: doc.id,
                  title: data.title,
                  numOfEvents: data.events ? data.events.length : 0
                }
                retrieved.push(wrapper);
              })
              this.setState({ calendarList: retrieved });
            }));
      } else {
        this.setState({calendarList: []});
      }
    }));
  }

  componentWillUnmount() {
    this.unsubscribe.forEach((unsubscribe) => {
      unsubscribe();
    });
  }

  render() {
    return (
      <ScrollView style={this.styles.container}>
        <TouchableHighlight
          onPress={() => this.props.navigator.push({
            screen: 'PlenR.GoogleLogin',
            title: 'Account Details',
            animated: true,
          })}
          underlayColor={'#aaa'}
        >
          <View style={this.styles.profile}>
            {this.state.currentUser ? (
              this.state.currentUser.photoURL ?
                (<Avatar
                  large
                  rounded
                  source={{uri: this.state.currentUser.photoURL}}
                  activeOpacity={0.7}
                />) :
                (<Avatar
                  large
                  rounded
                  title=":("
                  activeOpacity={0.7}
                />)) :
              (<Avatar
                large
                rounded
                title=":("
                activeOpacity={0.7}
              />)
            }
            <View style={this.styles.profile_info}>
              <Text style={this.styles.headline}>{this.state.currentUser ? this.state.currentUser.displayName : 'Please Sign In!'}</Text>
              <Text style={this.styles.subhead}>{this.state.currentUser ? this.state.currentUser.email : 'Your profile details are as empty as my heart'}</Text>
            </View>
          </View>
        </TouchableHighlight>
        <View style={this.styles.gap}></View>
        {
          this.state.currentUser ?
            (
              <View style={this.styles.gap}>
                <Text style={this.styles.gap_text}>Your Local Calendars</Text>
              </View>

            ) :
            null
        }
        {
          this.state.calendarList.map((calendar, i) => {
            return (
              <ListItem
                key={i}
                title={calendar.title}
                subtitle={"Total events: " + calendar.numOfEvents.toString()}
                hideChevron
                containerStyle={this.styles.list_box}
              />
            )
          })
        }
      </ScrollView>
    );
  }
}
