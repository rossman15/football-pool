import React, { Component } from 'react'
import { Table } from 'antd'
import PropTypes from 'prop-types'
import _ from 'lodash'

import styles from './overview.module.scss'

const picksSorter = (a, b) => {
  const aKeys = Object.keys(a).sort()
  const bKeys = Object.keys(b).sort()
  const aLength = aKeys.length
  const bLength = bKeys.length
  if (aLength > bLength) return -1
  if (aLength < bLength) return 1
  if (!aLength) return 0
  const lastPick_a = a[aKeys[aLength - 1]]
  const lastPick_b = b[bKeys[bLength - 1]]
  if (lastPick_a < lastPick_b) return -1
  if (lastPick_a > lastPick_b) return 1
  if (a.name < b.name) return -1
  if (a.name > b.name) return 1
  return 0
}

class Overview extends Component {
  static propTypes = {
    authorization: PropTypes.string.isRequired,
    user: PropTypes.object.isRequired,
    week: PropTypes.number.isRequired
  }

  state = {
    dataSource: [],
    columns: [],
    loading: true
  }

  componentDidMount() {
    this.getPicks()
  }

  // get all visible picks and transform it into tabe format
  getPicks = async () => {
    const { authorization } = this.props
    const res = await fetch('/api/allVisiblePicks', {
      method: 'GET',
      headers: { Accept: 'application/json', Authorization: authorization }
    })

    // return if error
    if (res.status !== 200) return this.setState({ loading: false })
    const respJson = await res.json()
    const dataSource = []
    let maxPicks = 0
    Object.keys(respJson).forEach(userId => {
      const picks = respJson[userId]
      if (picks.length < 1) return
      if (picks.length > maxPicks) maxPicks = picks.length
      const newDataObj = { key: userId, name: picks[0].name }
      picks.forEach((pick, idx) => {
        newDataObj[`week${pick.week}`] = pick.teamId
      })
      dataSource.push(newDataObj)
    })
    const columns = [{ title: 'Name', dataIndex: 'name', key: 'name' }]
    for (let i = 0; i < maxPicks; ++i) {
      const key = `week${i + 1}`
      columns.push({ title: `Week${i + 1}`, dataIndex: key, key })
    }
    setTimeout(
      () =>
        this.setState({
          loading: false,
          dataSource: dataSource.sort(picksSorter),
          columns
        }),
      500
    )
  }

  render() {
    const { dataSource, loading, columns } = this.state
    return (
      <div className={styles.container}>
        <Table
          scroll={{ y: true }}
          loading={loading}
          dataSource={dataSource}
          columns={columns}
          size="small"
          pagination={false}
        ></Table>
      </div>
    )
  }
}

export default Overview
