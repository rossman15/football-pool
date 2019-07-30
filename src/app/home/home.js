import React, { Component } from 'react'
import { Select, Input, Button } from 'antd'
import _ from 'lodash'
import PropTypes from 'prop-types'

import styles from  './home.module.scss'

class Home extends Component {

  static propTypes = {
    onLogin: PropTypes.func.isRequired
  }

  state = {
    users: [],
    userId: null,
    passcode: ''
  }

  componentDidMount() {
    this.getUsers()
  }

  getUsers = async () => {
    const res = await fetch('/api/users', {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    })
    const users = await res.json()
    if (res.status === 200)
      this.setState({ users: _.sortBy(users, user => user.name) })
  }

  changeUsername = userId => {
    this.setState({ userId })
  }

  changePasscode = ({ target: {value: passcode } }) => {
    this.setState({ passcode })
  }

  handleLogin = e => {
    e.preventDefault()
    const { passcode, userId } = this.state
    if (!userId || !passcode) return
    this.props.onLogin(userId, passcode)
  }

  render() {
    const { users, userId, passcode } = this.state
    return (
      <div className={styles.home}>
        <div className={styles.hello}>Hello! Please Login.</div>
        <form onSubmit={this.handleLogin}>
          <label>Name:</label>
          <Select
            showSearch
            optionFilterProp="children"
            value={userId}
            onChange={this.changeUsername}>
            {users.map(username => (
              <Select.Option key={username.id} value={username.id}>
                {username.name}
              </Select.Option>
            ))}
          </Select>
          <label>Passcode:</label>
          <Input value={passcode} onChange={this.changePasscode} />
          <Button htmlType="submit" className={styles.button} type="primary">Login</Button>
        </form>
      </div>
    )
  }
}

export default Home
