import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import styles from './input.module.scss'

class Input extends Component {

  static propTypes = {
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    placeholder: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired
  }

  onChange = e => this.props.onChange(e.target.value)

  render() {
    const { value, placeholder, className } = this.props
    return (
      <input value={value} placeholder={placeholder} onChange={this.onChange} className={classNames(className, styles.input)}></input>
    )
  }
}

export default Input
