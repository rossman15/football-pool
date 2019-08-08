import React, { Component } from 'react'
import _ from 'lodash'
import { message, Layout } from 'antd'

import Header from './header'
import Footer from './footer'
import Home from 'app/home/home'
import PickCenter from 'app/pick-center/pick-center'
import Overview from 'app/overview/overview'
import Spinner from 'app/components/spinner/spinner'
import styles from './app.module.scss'

const { Content } = Layout

export const OVERVIEW_PAGE_ID = '1'
export const PICKS_CENTER_PAGE_ID = '2'

class App extends Component {
  state = {
    user: null,
    userId: null,
    authorization: null,
    week: null,
    loading: true,
    selectedPageId: OVERVIEW_PAGE_ID // must be string for ant design
  }

  componentDidMount() {
    this.login()
    this.getWeek()
  }

  login = async () => {
    const authorization = localStorage.getItem('authorization')
    const user = localStorage.getItem('user')
    if (!authorization) return this.setState({ loading: false })
    const userJson = JSON.parse(user)
    console.log('AUTH', authorization)

    const res = await fetch(`/api/${userJson.id}/login`, {
      method: 'POST',
      headers: { Accept: 'application/json', Authorization: authorization }
    })
    const json = await res.json()
    if (!json.id) return this.setState({ loading: false })
    this.setState({
      authorization: json.authorization,
      userId: json.id,
      user: json,
      loading: false
    })
  }

  getWeek = async () => {
    const res = await fetch('/api/week', {
      method: 'GET',
      headers: { Accept: 'application/json' }
    })
    const json = await res.json()
    if (!json.week) return this.setState({ loading: false })
    this.setState({ week: json.week })
  }

  handleLogin = async (userId, passcode) => {
    const res = await fetch(`/api/${userId}/login`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ passcode })
    })

    const user = await res.json()
    const authorization = user.authorization
    if (!authorization) return message.error('Wrong Passcode', 4, _.noop)

    // set local storage
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('authorization', authorization)
    localStorage.setItem('isAdmin', user.isAdmin)

    this.setState({
      user,
      userId: user.id,
      authorization
    })
  }

  logout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('authorization')
    this.setState({
      user: null,
      authorization: null,
      userId: null
    })
  }

  onNavClick = e => this.setState({ selectedPageId: e.key })

  render() {
    const {
      user,
      loading,
      week,
      userId,
      authorization,
      selectedPageId
    } = this.state
    return (
      <div className={styles.app}>
        <Layout>
          <Header
            selectedPageId={selectedPageId}
            onNavClick={this.onNavClick}
            loggedIn={!!authorization}
            logout={this.logout}
            user={user}
          />
          <Content className={styles.content}>
            {loading ? (
              <Spinner />
            ) : authorization ? (
              (() => {
                switch (selectedPageId) {
                  case OVERVIEW_PAGE_ID:
                    return (
                      <Overview
                        week={week}
                        user={user}
                        authorization={authorization}
                      />
                    )
                  case PICKS_CENTER_PAGE_ID:
                    return (
                      <PickCenter
                        week={week}
                        user={user}
                        authorization={authorization}
                      />
                    )
                  default:
                    return <div>Error. Contact Ross.</div>
                }
              })()
            ) : (
              <Home onLogin={this.handleLogin} userId={userId} user={user} />
            )}
          </Content>
          {!loading && authorization && (
            <Footer authorization={authorization} user={user} week={week} />
          )}
        </Layout>
      </div>
    )
  }
}

export default App
