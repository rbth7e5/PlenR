import { Navigation } from 'react-native-navigation';

import MyPlenR from './MyPlenR';
import AddEvent from './AddEvent';
import OrganiseEvent from './OrganiseEvent';
import EventDetails from './EventDetails';
import EditEvent from './EditEvent';
import Profile from './Profile';
import Notifications from './Notifications';
import GoogleLogin from './GoogleLogin';
import Loading from './Loading';
import CalendarBox from '../components/CalendarBox';
import AddInvitees from './AddInvitees';
import PendingEventDetails from './PendingEventDetails';
import PendingEvents from './PendingEvents';
import NotificationBox from '../components/NotificationBox';
import InvitationCard from './InvitationCard';

export function registerScreens(store, Provider) {
  Navigation.registerComponent('PlenR.MyPlenR', () => MyPlenR, store, Provider);
  Navigation.registerComponent('PlenR.AddEvent', () => AddEvent, store, Provider);
  Navigation.registerComponent('PlenR.OrganiseEvent', () => OrganiseEvent, store, Provider);
  Navigation.registerComponent('PlenR.EventDetails', () => EventDetails, store, Provider);
  Navigation.registerComponent('PlenR.EditEvent', () => EditEvent, store, Provider);
  Navigation.registerComponent('PlenR.Profile', () => Profile, store, Provider);
  Navigation.registerComponent('PlenR.Notifications', () => Notifications, store, Provider);
  Navigation.registerComponent('PlenR.GoogleLogin', () => GoogleLogin, store, Provider);
  Navigation.registerComponent('PlenR.Loading', () => Loading);
  Navigation.registerComponent('PlenR.CalendarBox', () => CalendarBox, store, Provider);
  Navigation.registerComponent('PlenR.AddInvitees', () => AddInvitees, store, Provider);
  Navigation.registerComponent('PlenR.PendingEventDetails', () => PendingEventDetails, store, Provider);
  Navigation.registerComponent('PlenR.PendingEvents', () => PendingEvents, store, Provider);
  Navigation.registerComponent('PlenR.NotificationBox', () => NotificationBox);
  Navigation.registerComponent('PlenR.InvitationCard', () => InvitationCard);
}
