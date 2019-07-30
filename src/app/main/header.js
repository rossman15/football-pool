import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Layout, Menu, Button} from 'antd'
import styles from './header.module.scss'

const { Header: AntdHeader } = Layout

class Header extends Component {

  static propTypes = {
    logout: PropTypes.func.isRequired,
    loggedIn: PropTypes.bool.isRequired,
    user: PropTypes.object
  }

  render() {
    const { logout, loggedIn } = this.props
    return (
      <AntdHeader className={styles.header}>
        <div className={styles.logo} />
        {loggedIn ? (
          <Fragment>
            <Menu
              theme="dark"
              className={styles.menu}
              mode="horizontal"
              defaultSelectedKeys={['1']}
            >
              <Menu.Item key="1">Pick Center</Menu.Item>
            </Menu>
            <Button className={styles.button} onClick={logout}>Logout</Button>
          </Fragment>
        ) : (
          <h3>Welcome to the Football Elimination Pool Website</h3>
        )}

      </AntdHeader>
    )
  }
}

export default Header
