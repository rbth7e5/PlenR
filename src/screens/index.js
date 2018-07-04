import { Navigation } from 'react-native-navigation';

import MyPlenR from './MyPlenR';
import AddEvent from './AddEvent';
import OrganiseEvent from './OrganiseEvent';
import EventDetails from './EventDetails';
import EditEvent from './EditEvent';
import Profile from './Profile';
import Notifications from './Notifications';

export function registerScreens(store, Provider) {
  Navigation.registerComponent('PlenR.MyPlenR', () => MyPlenR, store, Provider);
  Navigation.registerComponent('PlenR.AddEvent', () => AddEvent, store, Provider);
  Navigation.registerComponent('PlenR.OrganiseEvent', () => OrganiseEvent, store, Provider);
  Navigation.registerComponent('PlenR.EventDetails', () => EventDetails, store, Provider);
  Navigation.registerComponent('PlenR.EditEvent', () => EditEvent, store, Provider);
  Navigation.registerComponent('PlenR.Profile', () => Profile, store, Provider);
  Navigation.registerComponent('PlenR.Notifications', () => Notifications, store, Provider);
}
