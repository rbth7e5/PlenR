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

registerScreens(store, Provider);

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August",
  "September", "October", "November", "December"];

Navigation.startTabBasedApp({
  tabs: [
    {
      label: 'My PlenR',
      screen: 'PlenR.MyPlenR',
      title: monthNames[new Date().getMonth()],
      subtitle: new Date().getFullYear().toString(),
      icon: require('./icons/calendar.png'),
      selectedIcon: require('./icons/calendar_selected.png'),
      navigatorStyle: {
        navBarSubtitleFontSize: 13,
      }
    },
    {
      label: 'Profile',
      screen: 'PlenR.Profile',
      title: 'Profile',
      icon: require('./icons/profile.png'),
      selectedIcon: require('./icons/profile_selected.png'),
    },
    {
      label: 'Notifications',
      screen: 'PlenR.Notifications',
      title: 'Notifications',
      icon: require('./icons/notifications.png'),
      selectedIcon: require('./icons/notifications_selected.png'),
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
