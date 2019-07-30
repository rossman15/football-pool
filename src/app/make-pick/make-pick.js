import React, { Component } from 'react'
import { message, Button, Select } from 'antd'
import _ from 'lodash'
import PropTypes from 'prop-types'
import teams from 'app/config/teams'

import Spinner  from 'app/components/spinner/spinner'

import styles from  './make-pick.module.scss'

class MakePick extends Component {

  static propTypes = {
    authorization: PropTypes.string.isRequired
  }

  state = {
    loading: true,
    teamId: null,
    unsavedPick: null
  }

  componentDidMount() {
    this.getPick()
  }

  getPick = async () => {
    const { authorization } = this.props
    const res = await fetch('/api/pick', {
      method: 'GET',
      headers: { 'Accept': 'application/json', 'Authorization': authorization },
    })
    const pick = await res.json()
    if (!pick.teamId) this.setState({ loading: false })
    this.setState({
      loading: false,
      teamId: pick.teamId,
      unsavedPick: pick.teamId
    })
  }

  savePick = async e => {
    e.preventDefault()
    const { teamId, unsavedPick } = this.state
    console.log(teamId, unsavedPick);

    const { authorization } = this.props
    const res = await fetch('/api/pick', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': authorization },
      body: JSON.stringify({ teamId: unsavedPick })
    })
    const pick = await res.json()
    if (res.status !== 200) return message.error(pick.error || 'Error', 4, _.noop)
    this.setState({ teamId: pick.teamId, unsavedPick: pick.teamId })
  }

  changeUnsavedPick = unsavedPick => this.setState({ unsavedPick })

  render() {
    const { teamId, loading, unsavedPick } = this.state
    return (
      <div className={styles.makePick}>
        <form onSubmit={this.savePick}>
          <div className={styles.pick}>
            <h3>Your Pick</h3>
              {loading
                ? <Spinner />
                : teamId
                  ? (
                    <div className={styles.pickLogoContainer}>
                      {teams.images[teamId] && (
                        <div
                          className={styles.pickLogo}
                          style={{backgroundImage: `url(${teams.images[teamId]})`}}
                        />
                      )}
                      {teams.map[teamId]}
                    </div>
                  )
                  : 'You have not picked yet'
              }
          </div>
          <Select
            showSearch
            className={styles.select}
            optionFilterProp="children"
            value={unsavedPick}
            onChange={this.changeUnsavedPick}
          >
            {teams.list.map(team => (
              <Select.Option key={team.id} value={team.id}>
                {team.name}
              </Select.Option>
            ))}
          </Select>
          <Button htmlType="submit">{`${teamId ? 'Change' : 'Make'} Pick`}</Button>
        </form>
      </div>
    )
  }
}

export default MakePick
