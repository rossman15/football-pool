import React, { Component } from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'

import Input from 'app/components/input/input'
import Button from 'app/components/button/button'
import Spinner from 'app/components/spinner/spinner'
import styles from './login.module.scss'

class Login extends Component {

  static propTypes = {
    setUsername: PropTypes.func.isRequired
  }

  state = {
    username: '',
    isLoading: false
  }

  onSubmit = e => {
    e.preventDefault()
    const { username } = this.state
    if (username) {
      // show spinner for a little bit
      this.setState({ isLoading: true })
      setTimeout(() => {
        this.props.setUsername(username)
      }, 800)
    }
  }

  onChange = username => this.setState({ username })

  render() {
    const { isLoading } = this.state
    return (
      <form className={classNames(styles.container, { [styles.loading]: isLoading })} onSubmit={this.onSubmit}>
        {isLoading && <Spinner />}
        <Input className={styles.input} placeholder="Type your username..." value={this.state.username} onChange={this.onChange}></Input>
        <Button className={styles.button}>Join the DoorDash Chat!</Button>
      </form>
    )
  }
}

export default Login
