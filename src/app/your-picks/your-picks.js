import React, { Component } from 'react'
import { message, Button, Table } from 'antd'
import _ from 'lodash'
import PropTypes from 'prop-types'

import styles from  './your-picks.module.scss'

class YourPicks extends Component {
  static propTypes = {
    authorization: PropTypes.string.isRequired
  }

  state = {
    loading: true,
    teamId: null,
    picks: []
  }

  componentDidMount() {
    this.getPicks()
  }

  getPicks = async () => {
    const { authorization } = this.props
    const res = await fetch('/api/pastPicks', {
      method: 'GET',
      headers: { 'Accept': 'application/json', 'Authorization': authorization },
    })
    const picks = await res.json()
    if (res.status !== 200) this.setState({ loading: false })
    this.setState({
      loading: false,
      picks
    })
  }

  render() {
    const { userId, week, user } = this.props
    const { picks } = this.state
    const columns = picks.map(pick => (
      {
        title: `Week ${pick.week}`,
        dataIndex: `week${pick.week}`,
        key: `week${pick.week}`,
      }
    ))
    const dataSource = [
      _.reduce(picks, (result, pick) => {
        result[`week${pick.week}`] = pick.teamId
        return result
      }, {})
    ]
    return (
      <div className={styles.yourPicks}>
        <h3>Previous Picks</h3>
        <Table size="middle" pagination={false} dataSource={dataSource} columns={columns} />
      </div>
    )
  }
}

export default YourPicks
