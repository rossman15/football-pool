import React, { Component } from 'react'
import PropTypes from 'prop-types'

import UserInfo from './user-info/user-info'
import Rooms from './rooms/rooms'
import Messages from './messages/messages'
import RoomDetails from './room-details/room-details'

import styles from './chatroom.module.scss'

class ChatRoom extends Component {

  static propTypes = {
    username: PropTypes.string.isRequired
  }

  state = {
    rooms: [],
    selectedRoomId: null
  }

  async componentDidMount() {
    const res = await fetch('/api/rooms')
    const rooms = await res.json()
    this.setState({ rooms })
  }

  selectRoom = selectedRoomId => this.setState({ selectedRoomId })

  render() {
    const { username } = this.props
    const { rooms, selectedRoomId } = this.state
    return (
      <div className={styles.container}>
        <div className={styles.sidebar}>
          <UserInfo username={username} />
          <Rooms selectedRoomId={selectedRoomId} selectRoom={this.selectRoom} rooms={rooms} />
        </div>
        <div className={styles.messages}>
          {selectedRoomId !== null && <RoomDetails roomId={selectedRoomId} username={username} />}
          {selectedRoomId !== null && <Messages username={username} roomId={selectedRoomId} />}
        </div>
      </div>
    )
  }
}

export default ChatRoom
