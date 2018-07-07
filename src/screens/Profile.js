import React, { Component } from 'react';

import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Button,
  TouchableHighlight,
} from 'react-native';

export default class Profile extends Component<Props> {
  static navigatorStyle = {
    largeTitle: true,
  }

  constructor(props) {
    super(props);
    this.state = {
      calendarList: [],
    }
  }

  handleEvents = (calendarID, events_unparsed) => {
    this.props.navigator.handleDeepLink({
      link: 'googleEvents`' + calendarID + '`' + events_unparsed,
    });
  }

  render() {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.account_container}>
          <Button
            title='Google'
            onPress={() => this.props.navigator.push({
              screen: 'PlenR.GoogleLogin',
              title: 'Calendars',
              passProps: {
                onRetrieveEvents: this.handleEvents,
              },
              animated: true,
            })}
          />
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  account_container: {
    padding: 15,
    flex: 1,
    borderBottomWidth: 1,
    borderColor: '#dddddd'
  }
})
