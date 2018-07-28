import React, { Component } from 'react';

import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Button,
  TouchableHighlight,
  Platform,
  TextInput
} from 'react-native';

import InviteeBox from '../components/InviteeBox';

import firebase from 'react-native-firebase';

export default class AddInvitees extends Component<Props> {
  static navigatorStyle = {
    navBarNoBorder: true,
  };
  static navigatorButtons = {
    rightButtons: [
      {
        id: 'done',
        ...Platform.select({
          ios: {
            systemItem: 'done',
          },
          android: {
            title: 'done',
          }
        })
      },
    ]
  }

  constructor(props) {
    super(props);
    this.dataBaseRef = firebase.firestore().collection('users');
    this.state = {
      inviteeHits: []
    }
    this.unsubscribe = null;
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  onNavigatorEvent(event) {
    if (event.type == 'NavBarButtonPress') {
      if (event.id == 'done') {
        this.props.navigator.dismissModal();
      }
    }
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  renderSearchBar() {
    return (
      <View style={styles.search_bar}>
        <TextInput
          placeholder = {'Start typing your friends\' names'}
          placeholderTextColor = '#aaaaaa'
          style={styles.search_text}
          returnKeyType='search'
          onChangeText={(text) => this.retrieveInvitees(text)}
          autocorrect={false}
          autoCapitalize='none'
        />
      </View>
    )
  }

  retrieveInvitees(text) {
    let id = '';
    this.unsubscribe = this.dataBaseRef.onSnapshot((querySnapshot) => {
          let inviteeHits = [];
          querySnapshot.forEach((doc) => {
            if (doc.id !== this.props.currentUserId) {
              let data = doc.data();
              if (data.displayName.includes(text) || data.email.includes(text)) {
                let wrapper = {
                  id: doc.id,
                  displayName: data.displayName,
                  email: data.email
                }
                inviteeHits = inviteeHits.concat(wrapper);
              }
            }
          })
          this.setState({inviteeHits: inviteeHits});
        })
  }

  render() {
    return (
      <View style={styles.container}>
        {this.renderSearchBar()}
        {this.state.inviteeHits.map((invitee) => {
          return (
            <TouchableHighlight
              key={invitee.id}
              onPress={() => this.props.onAddInvitee(invitee)}
            >
              <InviteeBox info={invitee}/>
            </TouchableHighlight>
          )
        })}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  search_bar: {
    paddingLeft: 15,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dddddd',
    justifyContent: 'space-evenly',
  },
  search_text: {
    height: 45,
    fontSize: 17,
  }
})
