// @flow
import { StyleSheet } from 'react-native'

const calendarHeight = 2400
// const eventPaddingLeft = 4
const leftMargin = 50 - 1

export default function styleConstructor (
  theme = {}
) {
  let style = {
    container: {
      flex: 1,
      backgroundColor: '#ffff',
      ...theme.container
    },
    contentStyle: {
      backgroundColor: '#ffff',
      height: calendarHeight + 10
    },
    header: {
      paddingHorizontal: 30,
      height: 50,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: 'rgb(216,216,216)',
      backgroundColor: '#fff',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.header
    },
    headerText: {
      fontSize: 16
    },
    arrow: {
      width: 15,
      height: 15,
      resizeMode: 'contain'
    },
    event: {
      position: 'absolute',
      backgroundColor: '#F5F5F5',
      opacity: 0.8,
      borderColor: 'rgb(216,216,216)',
      borderWidth: 1,
      borderRadius: 5,
      paddingLeft: 4,
      minHeight: 25,
      flex: 1,
      paddingTop: 5,
      paddingBottom: 0,
      flexDirection: 'column',
      alignItems: 'flex-start',
      overflow: 'hidden',
      ...theme.event
    },
    eventTitle: {
      color: '#615B73',
      fontWeight: '600',
      minHeight: 15,
      ...theme.eventTitle
    },
    eventSummary: {
      color: '#615B73',
      fontSize: 12,
      flexWrap: 'wrap',
      ...theme.eventSummary
    },
    eventTimes: {
      marginTop: 3,
      fontSize: 10,
      fontWeight: 'bold',
      color: '#615B73',
      flexWrap: 'wrap',
      ...theme.eventTimes
    },
    line: {
      height: 1,
      position: 'absolute',
      left: leftMargin,
      backgroundColor: 'rgb(216,216,216)',
      ...theme.line
    },
    lineNow: {
      height: 1,
      position: 'absolute',
      left: leftMargin,
      backgroundColor: 'red',
      ...theme.line
    },
    timeLabel: {
      position: 'absolute',
      left: 15,
      color: 'rgb(170,170,170)',
      fontSize: 10,
      fontFamily: 'Helvetica Neue',
      fontWeight: '500',
      ...theme.timeLabel
    },
    weekday:{
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    weekday_view: {
      width: 40,
      justifyContent: 'center',
      alignItems: 'center'
    },
    weekday_text: {
      fontSize: 13,
      textAlign: 'center',
    },
    selected_view: {
      height: 40,
      width: 40,
      borderRadius: 20,
      backgroundColor: '#f5f5f5',
      justifyContent: 'center',
      alignItems: 'center',
    },
    selected_text: {
      fontSize: 17,
    },
    day_view: {
      height: 40,
      width: 40,
      borderRadius: 20,
      backgroundColor: '#fff',
      justifyContent: 'center',
      alignItems: 'center',
    },
    day_text: {
      fontSize: 17,
    },
    top_bar: {
      backgroundColor: '#fff',
      height: 80,
      justifyContent: 'space-evenly'
    },
  }
  return StyleSheet.create(style)
}
