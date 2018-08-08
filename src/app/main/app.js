import React, { Component } from 'react'

import Login from 'app/login/login'
import ChatRoom from 'app/chatroom/chatroom'

class App extends Component {

  state = {
    username: ''
  }

  setUsername = username => {
    this.setState({ username })
  }

  render() {
    const { username } = this.state
    return (
      <div className="app">
        {!!username ? (
          <ChatRoom username={username} />
        ) : (
          <Login setUsername={this.setUsername}></Login>
        )}
      </div>
    )
  }
}

export default App
