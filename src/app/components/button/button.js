import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'

import styles from './button.module.scss'

const Button = ({ onClick, className, type, children }) => (
  <button
    onClick={onClick}
    className={classNames(className, styles.button, styles[type])}>
    {children}
  </button>
)

Button.propTypes = {
  onClick: PropTypes.func,
  className: PropTypes.string,
  children: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['primary', 'secondary'])
}

Button.defaultProps = {
  type: 'primary'
}

export default Button
