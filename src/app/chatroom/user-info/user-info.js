import React, { Component } from 'react'
import PropTypes from 'prop-types'

import styles from './user-info.module.scss'

class UserInfo extends Component {

  static propTypes = {
    username: PropTypes.string.isRequired
  }

  state = {
    minutesOnline: 0
  }

  componentDidMount() {
     // increment every minute
    this.interval = setInterval(() => {
      if (!this.unmounted)
        this.setState(prevState => ({
          minutesOnline: prevState.minutesOnline + 1
        }))
    }, 60000)
  }

  componentWillUnmount() {
    this.unmounted = true
    clearInterval(this.interval)
  }

  render() {
    const { minutesOnline } = this.state
    const minutesOnlineText = minutesOnline > 0
      ? `${minutesOnline} minute${minutesOnline > 1 ? 's' : ''}`
      : 'a few seconds'
    return (
      <div className={styles.container}>
        <h3>{this.props.username}</h3>
        <p>Online for {minutesOnlineText}</p>
      </div>
    )
  }
}

export default UserInfo
