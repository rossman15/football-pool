import React, { Component } from 'react'
import { Row, Col } from 'antd'
import PropTypes from 'prop-types'

import styles from './overview.module.scss'

class Overview extends Component {
  static propTypes = {
    authorization: PropTypes.string.isRequired,
    user: PropTypes.object.isRequired,
    week: PropTypes.number.isRequired
  }

  state = {}

  componentDidMount() {
    this.getPicks()
  }

  getPicks = async () => {
    const { authorization, userId } = this.props
    const res = await fetch('/api/visiblePicks', {
      method: 'GET',
      headers: { Accept: 'application/json', Authorization: authorization }
    })
    const picks = await res.json()
    if (res.status !== 200) this.setState({ loading: false })
    this.setState({
      loading: false,
      picks: picks[userId]
    })
  }

  render() {
    return <div className={styles.container}>YOOO</div>
  }
}

export default Overview
