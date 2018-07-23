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
  Alert
} from 'react-native';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import firebase from 'react-native-firebase';

import Event from '../util/Event';

export default class PendingEventDetails extends PureComponent<Props> {
  static navigatorStyle = {
    navBarNoBorder: true,
    largeTitle: false,
  };

  static navigatorButtons = {
    ...Platform.select({
      ios: {
        rightButtons: [
          {
            id: 'create',
            systemItem: 'add',
          },
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
    this.state = {
      currentUser: null
    };
    this.unsubscribe = null;
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  componentDidMount() {
    this.unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      this.setState({currentUser: user});
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  onNavigatorEvent(event) {
    if (event.type == 'NavBarButtonPress') {
      if (event.id == 'create') {
        this.props.navigator.showModal({
          screen: 'PlenR.AddEvent',
          title: 'Add Event',
          animationType: 'slide-up',
          
        });
      }
    }
  }

  render(){
    const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    return (
      <View style={styles.container}>
        <ScrollView style={styles.container} horizontal={true}>
          <View style={styles.gaps_between}>
            {weekDays.map((day) => {
                return(<Text key={day} style={styles.weekday_text}>{day}</Text>);
              })}
          </View>
        </ScrollView>
        <View style={styles.delete_button}>
          <Button onPress={() => Alert.alert(
                'Confirm Event Deletion',
                'Deleted events cannot be recovered!',
                [
                  {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                  {text: 'Confirm', onPress: () => {
                    firebase.firestore().collection('users').doc(this.state.currentUser.uid).collection('pending_events')
                      .doc(this.props.id)
                      .delete()
                      .then(() => {
                        this.props.navigator.popToRoot();
                      })
                      .catch((error) => {
                        alert("Failed to delete!");
                      })
                  }},
                ]
              )
            }
            title='Delete'
            color='#ff0000'
          />
        </View>
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
  weekday_text: {
    fontSize: 13,
    textAlign: 'center',
    flex: 1,
    padding: 5
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
