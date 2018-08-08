import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'

import styles from './message-group.module.scss'

const MessageGroup = ({ messages, name, isOwnMessages }) => (
  <div className={classNames(styles.container, { [styles.ownMessages]: isOwnMessages })}>
    <div className={styles.messageGroup}>
      {messages.map((message, index) => (
        <div key={message.id} className={styles.message}>{message.message}</div>
      ))}
    </div>
    {!isOwnMessages && <div className={styles.name}>{name}</div>}
  </div>
)

MessageGroup.propTypes = {
  name: PropTypes.string.isRequired,
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired
    })
  ).isRequired,
  isOwnMessages: PropTypes.bool.isRequired
}

export default MessageGroup
