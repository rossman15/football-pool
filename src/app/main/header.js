import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Layout, Menu, Button } from 'antd'
import { OVERVIEW_PAGE_ID, PICKS_CENTER_PAGE_ID } from './app'
import styles from './header.module.scss'

const { Header: AntdHeader } = Layout

class Header extends Component {
  static propTypes = {
    logout: PropTypes.func.isRequired,
    onNavClick: PropTypes.func.isRequired,
    loggedIn: PropTypes.bool.isRequired,
    selectedPageId: PropTypes.bool.isRequired,
    user: PropTypes.object
  }

  render() {
    const { logout, selectedPageId, onNavClick, loggedIn } = this.props
    return (
      <AntdHeader className={styles.header}>
        <div className={styles.logo} />
        {loggedIn ? (
          <Fragment>
            <Menu
              theme="dark"
              className={styles.menu}
              onClick={onNavClick}
              mode="horizontal"
              selectedKeys={[selectedPageId]}
            >
              <Menu.Item key={OVERVIEW_PAGE_ID}>Overview</Menu.Item>
              <Menu.Item key={PICKS_CENTER_PAGE_ID}>Pick Center</Menu.Item>
            </Menu>
            <Button className={styles.button} onClick={logout}>
              Logout
            </Button>
          </Fragment>
        ) : (
          <h3>Welcome to the Football Elimination Pool Website</h3>
        )}
      </AntdHeader>
    )
  }
}

export default Header
