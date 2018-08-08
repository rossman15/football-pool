import React, { Component } from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'

import styles from './rooms.module.scss'

class Rooms extends Component {

  static propTypes = {
    rooms: PropTypes.array.isRequired,
    selectRoom: PropTypes.func.isRequired,
    selectedRoomId: PropTypes.number
  }

  selectRoom = e => {
    const roomId = parseInt(e.target.getAttribute('data-room-id'), 10)
    this.props.selectRoom(roomId)
  }

  render() {
    const { rooms, selectedRoomId } = this.props
    return (
      <div className={styles.container}>
        {rooms.map(room =>
          <div
            key={room.id}
            data-room-id={room.id}
            className={classNames(styles.room, {
              [styles.currentRoom]: room.id === selectedRoomId
            })}
            onClick={this.selectRoom}
          >
            {room.name}
          </div>
        )}
      </div>
    )
  }
}

export default Rooms
