import React, { Component, Fragment } from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'

import styles from './room-details.module.scss'

const INTERVAL_TIME = 1000

class RoomDetails extends Component {

  static propTypes = {
    roomId: PropTypes.number.isRequired,
    username: PropTypes.string.isRequired
  }

  state = {
    details: { users: [] }
  }

  async componentDidMount() {
    this.loadData(this.props.roomId)
  }

  componentWillUnmount() {
    this.unmounted = true
    clearInterval(this.interval)
  }

  async componentDidUpdate(prevProps, prevState) {
    // reload details when room changes
    if (prevProps.roomId !== this.props.roomId) {
      this.setState({ isLoading: true })
      this.loadData(this.props.roomId)
    }
  }

  _loadData = async roomId => {
    const res = await fetch(`/api/rooms/${roomId}`)
    const details = await res.json()
    if (this.props.roomId === roomId && !this.unmounted)
      this.setState({ details })
  }

  loadData = roomId => {
    clearInterval(this.interval)
    this._loadData(roomId)
    this.interval = setInterval(async () => {
      this._loadData(roomId)
    }, INTERVAL_TIME)
  }

  render() {
    const { username } = this.props
    const { details } = this.state
    const shortenedUsers = details.users.slice(0, 10)
    return (
      <div className={styles.container}>
        <h2>{details.name}</h2>
        <p>
          {shortenedUsers.map((user, index) => (
            <Fragment key={user}>
              <span
                className={classNames({ [styles.currentUser]: user === username })}
              >
                {user}
              </span>
              {index === shortenedUsers.length - 1 ? '' : ', '}
            </Fragment>
          ))}
          {details.users.length > 10 && ', ...'}
        </p>
      </div>
    )
  }
}

export default RoomDetails
