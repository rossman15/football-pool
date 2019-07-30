import React, { Component } from 'react'
import { Row, Col } from 'antd'
import PropTypes from 'prop-types'

import MakePick from 'app/make-pick/make-pick'
import YourPicks from 'app/your-picks/your-picks'
import styles from  './pick-center.module.scss'

class PickCenter extends Component {

  static propTypes = {
    authorization: PropTypes.string.isRequired,
    user: PropTypes.object.isRequired,
    week: PropTypes.number.isRequired
  }

  state = {
  }

  render() {
    const { week, authorization } = this.props
    return (
      <div className={styles.container}>
        <Row>
          <Col>
            <div className={styles.content}>
              <Row>
                <Col className={styles.week} span={20} offset={2}>
                  <h2>Week {week}</h2>
                </Col>
              </Row>
              <Row>
                <Col span={20} offset={2}>
                  <MakePick authorization={authorization} />
                </Col>
              </Row>
              <Row>
                <Col span={20} offset={2}>
                  <YourPicks authorization={authorization} />
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </div>
    )
  }
}

export default PickCenter
