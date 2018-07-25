/**
 * PlenR
 * @author Chen Caijie
 * @author Tan Wei Yang
 */

import React, { Component } from 'react';
import { Navigation } from 'react-native-navigation';
import { registerScreens, registerScreenVisibilityListener } from './screens';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';

registerScreens(store, Provider);

Navigation.startTabBasedApp({
  tabs: [
    {
      label: 'My PlenR',
      screen: 'PlenR.MyPlenR',
      icon: require('./icons/calendar.png'),
      navigatorStyle: {
        navBarSubtitleFontSize: 13,
        navBarTransparent: true,
        navBarTranslucent: true,
        drawUnderNavBar: true,
      }
    },
    {
      label: 'Profile',
      screen: 'PlenR.Profile',
      title: 'Profile',
      icon: require('./icons/profile.png'),
    },
    {
      label: 'Notifications',
      screen: 'PlenR.Notifications',
      title: 'Notifications',
      icon: require('./icons/notifications.png'),
    }
  ],
  appStyle: {
    orientation: 'portrait',
  }
})

function eventHandler(eventsArray = [], action) {
  switch (action.type) {
    case 'ADD':
    return eventsArray.concat(action.event)
    default:
    return eventsArray
  }
}

const store = createStore(eventHandler);
