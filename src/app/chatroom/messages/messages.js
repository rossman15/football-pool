import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Input from 'app/components/input/input'
import Button from 'app/components/button/button'
import Spinner from 'app/components/spinner/spinner'
import MessageGroup from './message-group/message-group'

import styles from './messages.module.scss'

const INTERVAL_TIME = 1000
const ARTIFITIAL_DELAY = 500

// Puts a list of messages into a like of MessageGroups so that
// we can group messgaes from the same user
const formatMessages = messages => {
  return messages.reduce((result, message) => {
    const lastGroup = result.length && result[result.length - 1]
    // if this message was sent by the same person as the last message then add it to the messageGroup
    if (result.length && message.name === lastGroup.name)
      lastGroup.messages.push(message)
    else
      result.push({ name: message.name, messages: [message] })
    return result
  }, [])
}

// Adding artificial delay to make it look like it is loading
class Messages extends Component {

  static propTypes = {
    username: PropTypes.string.isRequired,
    roomId: PropTypes.number.isRequired
  }

  state = {
    messageGroups: [],
    message: '',
    isLoading: true
  }

  constructor(props) {
    super(props);
    this.messagesRef = React.createRef();
  }

  async componentDidMount() {
    setTimeout(() => {
      this.loadData(this.props.roomId)
    }, ARTIFITIAL_DELAY)
  }

  componentWillUnmount() {
    this.unmounted = true
    clearInterval(this.interval)
  }

  async componentDidUpdate(prevProps, prevState) {
    // check to see if we are still in this room
    if (prevProps.roomId !== this.props.roomId) {
      this.setState({ isLoading: true })
      setTimeout(() => {
        this.loadData(this.props.roomId)
      }, ARTIFITIAL_DELAY)
    }
  }

  _loadData = async (roomId, callback) => {
    const res = await fetch(`/api/rooms/${roomId}/messages`)
    const json = await res.json()
    const messageGroups = formatMessages(json)
    if (this.props.roomId === roomId && !this.unmounted)
      this.setState({ messageGroups, isLoading: false }, callback)
  }

  loadData = (roomId, callback) => {
    clearInterval(this.interval)
    this._loadData(roomId, this.scrollToBottom)
    this.interval = setInterval(async () => {
      this._loadData(roomId)
    }, INTERVAL_TIME)
  }

  scrollToBottom = () => {
    this.messagesRef.current.scrollTop = this.messagesRef.current.scrollHeight;
  }

  sendMessage = async e => {
    e.preventDefault()

    // send API request
    const res = await fetch(`/api/rooms/${this.props.roomId}/messages`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: this.props.username,
        message: this.state.message
      })
    })

    if (res.status === 200) this.setState({ message: '' })

    // reload messages
    this._loadData(this.props.roomId, this.scrollToBottom)
  }

  handleChange = message => this.setState({ message })

  render() {
    const { username, roomId } = this.props
    const { messageGroups, isLoading } = this.state
    return (
      <div className={styles.container}>
        <div ref={this.messagesRef} className={styles.messages}>
          {isLoading ? (
            <Spinner />
          ) : messageGroups.map((messageGroup, index) => (
            <MessageGroup
              key={`${roomId}-${index}`}
              name={messageGroup.name}
              messages={messageGroup.messages}
              isOwnMessages={messageGroup.name === username}
            />
          ))}
        </div>
        <form onSubmit={this.sendMessage} className={styles.newMessage}>
          <Input
            className={styles.input}
            value={this.state.message}
            onChange={this.handleChange}
            placeholder="Type a message..." />
          <Button className={styles.button} type="secondary">Send</Button>
        </form>
      </div>
    )
  }
}

export default Messages
