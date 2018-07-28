// @flow
import {
  VirtualizedList,
  View,
  TouchableOpacity,
  Image,
  Text,
  TouchableWithoutFeedback
} from 'react-native'
import _ from 'lodash'
import moment from 'moment'
import React from 'react'

import styleConstructor from './style'

import DayView from './DayView'

export default class EventCalendar extends React.Component {
  constructor(props) {
    super(props)
    this.styles = styleConstructor(props.styles)
    this.state = {
      date: moment(this.props.initDate),
      index: this.props.size
    }
  }

  static defaultProps = {
    size: 30,
    initDate: new Date(),
    formatHeader: 'DD MMMM YYYY'
  }

  _getItemLayout(data, index) {
    const { width } = this.props
    return { length: width, offset: width * index, index }
  };

  _getItem(events, index) {
    const date = moment(this.props.initDate).add(index - this.props.size, 'days')
    return _.filter(events, event => {
      const eventStartTime = moment(event.start)
      return eventStartTime >= date.clone().startOf('day') &&
        eventStartTime <= date.clone().endOf('day')
    })
  }

  _renderItem({ index, item }) {
    const { width, format24h, initDate, scrollToFirst } = this.props
    const date = moment(initDate).add(index - this.props.size, 'days')
    return (
      <DayView
        date={date}
        index={index}
        format24h={format24h}
        formatHeader={this.props.formatHeader}
        headerStyle={this.props.headerStyle}
        renderEvent={this.props.renderEvent}
        eventTapped={this.props.eventTapped}
        events={item}
        width={width}
        scrollEnabled={this.props.scrollEnabled}
        styles={this.styles}
        scrollToFirst={scrollToFirst}
      />
    )
  }

  _goToPage(index) {
    if (index < 0 || index >= this.props.size * 2) {
      return
    }
    const date = moment(this.props.initDate).add(index - this.props.size, 'days')
    this.refs.calendar.scrollToIndex({ index, animated: false })
    this.setState({ index, date })
  }

  renderWeekDays() {
    let weekDays = ["S", "M", "T", "W", "T", "F", "S"];
    let start = moment(this.props.event.start);
    let week = []
    while (start.isSameOrBefore(this.props.event.end, 'day')) {
      week.push(start);
      start = start.clone().add(1, 'days');
    }
    return (
      <View style={this.styles.top_bar}>
        <View style={this.styles.weekday}>
          {
            week.map((day, i) => {
              return (
                <View key={i} style={this.styles.weekday_view}>
                  <Text style={this.styles.weekday_text}>{weekDays[day.day()]}</Text>
                </View>
              )
            })
          }
        </View>
        <View style={this.styles.weekday}>
          {
            week.map((day, i) => {
              let diff_days = day.startOf('day').diff(this.state.date.startOf('day'), 'days');
              if (day.isSame(this.state.date, 'day')) {
                return (
                    <TouchableWithoutFeedback
                      key={i}
                      onPress={() => {
                        this._goToPage(this.state.index + diff_days)
                      }}
                      underlayColor="#fff"
                      style={{borderRadius: 10}}
                    >
                      <View style={this.styles.selected_view}>
                        <Text style={this.styles.selected_text}>{day.format('DD')}</Text>
                      </View>
                    </TouchableWithoutFeedback>
                )
              }
              return (
                <TouchableWithoutFeedback
                  key={i}
                  onPress={() => {
                    this._goToPage(this.state.index + diff_days);
                  }}
                  underlayColor="#f5f5f5"
                  style={{borderRadius: 10}}
                >
                  <View style={this.styles.day_view}>
                    <Text style={this.styles.day_text}>{day.format('DD')}</Text>
                  </View>
                </TouchableWithoutFeedback>
              )
            })
          }
        </View>
      </View>
    )
  }

  render() {
    const {
      width,
      virtualizedListProps,
      events,
      initDate,
      formatHeader,
      dateString
    } = this.props
    return (
      <View style={[this.styles.container, { width }]}>
        {/*<View style={this.styles.header}>
          <TouchableOpacity onPress={() => this._goToPage(this.state.index - 1)}>
            <Image source={require('./back.png')} style={this.styles.arrow} />
          </TouchableOpacity>
          <Text style={this.styles.headerText}>{this.state.date.format(formatHeader || 'DD MMMM YYYY')}</Text>
          <TouchableOpacity onPress={() => this._goToPage(this.state.index + 1)}>
            <Image source={require('./forward.png')} style={this.styles.arrow} />
          </TouchableOpacity>
        </View>*/}
        {this.renderWeekDays()}
        {
          dateString ?
            (
              <View style={this.styles.header}>
                <Text style={this.styles.headerText}>{this.state.date.format('dddd MMMM DD, YYYY')}</Text>
              </View>
            ) :
            null
        }
        <VirtualizedList
          ref='calendar'
          windowSize={2}
          initialNumToRender={2}
          initialScrollIndex={this.props.size}
          data={events}
          getItemCount={() => this.props.size * 2}
          getItem={this._getItem.bind(this)}
          keyExtractor={(item, index) => index.toString()}
          getItemLayout={this._getItemLayout.bind(this)}
          horizontal
          pagingEnabled
          renderItem={this._renderItem.bind(this)}
          style={{ width: width }}
          onMomentumScrollEnd={(event) => {
            const index = parseInt(event.nativeEvent.contentOffset.x / width)
            const date = moment(this.props.initDate).add(index - this.props.size, 'days')
            this.setState({ index, date })
          }}
          {...virtualizedListProps}
        />
      </View>

    )
  }
}
