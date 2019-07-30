import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'

import styles from './team.module.scss'

const Team = ({ onClick, className, type, children }) => (
  <button
    onClick={onClick}
    className={classNames(className, styles.button, styles[type])}>
    {children}
  </button>
)

Team.propTypes = {
  onClick: PropTypes.func,
  className: PropTypes.string,
  children: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['primary', 'secondary'])
}

Team.defaultProps = {
  type: 'primary'
}

export default Team
