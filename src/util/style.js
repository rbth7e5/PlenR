
import { StyleSheet } from 'react-native'

export default function styleConstructor () {
  let style = {
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    box_container : {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    gap: {
      padding: 10,
      paddingLeft: 15
    },
    gap_text: {
      color: '#666666'
    },
    gap_title: {
      fontSize: 20,
      color: '#666666'
    },
    profile: {
      flexDirection: 'row',
      paddingRight: 30,
      paddingLeft: 30,
      paddingVertical: 15,
      backgroundColor: '#fff',
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: '#E6E8F0',
    },
    profile_info: {
      flex: 1,
      paddingLeft: 15,
    },
    title_one: {
      fontSize: 28
    },
    title_two: {
      fontSize: 22
    },
    title_three: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#aaaaaa'
    },
    headline: {
      fontSize: 17,
      fontWeight: 'bold'
    },
    body: {
      fontSize: 17
    },
    subhead: {
      fontSize: 15,
      color: '#555555'
    },
    footnote: {
      fontSize: 13
    },
    caption_one: {
      fontSize: 12
    },
    caption_two: {
      fontSize: 11
    },
    header: {
      paddingHorizontal: 30,
      height: 50,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: '#E6E8F0',
      backgroundColor: '#F5F5F6',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    calendar_box: {
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: '#f5f5f5',
      backgroundColor: '#fff',
    }
  }
  return StyleSheet.create(style)
}
