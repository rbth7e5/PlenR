
import { StyleSheet, Dimensions } from 'react-native'

var {height, width} = Dimensions.get('window');

export default function styleConstructor () {
  let style = {
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    box_container : {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f5f5f5'
    },
    card_container: {
      justifyContent: 'space-between',
      height: height * 5/6,
      width: width - 20,
      borderRadius: 30,
      backgroundColor: '#fff',
      padding: 20,
      paddingBottom: 10,
      shadowColor: '#555555',
      shadowOffset: {height: 1},
      shadowOpacity: 50,
      shadowRadius: 5,
    },
    gap: {
      padding: 10,
      paddingLeft: 15,
      justifyContent: 'center',
      alignItems: 'center',
    },
    gap_text: {
      color: '#666666'
    },
    gap_title: {
      fontSize: 20,
      color: '#666666',
      textAlign: 'center',
      paddingHorizontal: 50
    },
    profile: {
      flexDirection: 'row',
      paddingRight: 15,
      paddingLeft: 15,
      paddingVertical: 15,
      backgroundColor: '#fff',
      borderBottomWidth: 1,
      borderColor: '#ccc',
    },
    card_header: {
      flexDirection: 'row',
      width: width - 20,
      borderTopStartRadius: 15,
      paddingBottom: 10,
    },
    card_margin_text: {
      fontSize: 17,
      color: '#555555'
    },
    card_content: {
      flexDirection: 'row',
      paddingTop: 15,
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
      fontSize: 17,
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
      borderColor: '#ccc',
      backgroundColor: '#F5F5F6',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    list_box: {
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: '#ccc',
      backgroundColor: '#fff',
    }
  }
  return StyleSheet.create(style)
}
