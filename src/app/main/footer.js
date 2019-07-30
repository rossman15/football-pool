import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Layout, Button} from 'antd'
import styles from './footer.module.scss'

const { Footer: AntdFooter } = Layout

const downloadCSV = (csv, filename) => {
  var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  if (navigator.msSaveBlob) { // IE 10+
     navigator.msSaveBlob(blob, filename);
  } else {
    var link = document.createElement("a");
    if (link.download !== undefined) { // feature detection
      // Browsers that support HTML5 download attribute
      var url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}

class Footer extends Component {

  static propTypes = {
    week: PropTypes.number.isRequired,
    authorization: PropTypes.string.isRequired,
    user: PropTypes.object
  }

  dowloadPastPicks = async () => {
    const { week, authorization } = this.props
    const filename = `Week ${week - 1}`
    const res = await fetch(`/api/pastPicksCSV`, {
      method: 'GET',
      headers: { 'Accept': 'application/json', 'Authorization': authorization },
    })
    const csv = await res.text()
    downloadCSV(csv, filename)
  }

  dowloadAllPicks = async () => {
    const { week, authorization } = this.props
    const filename = `Week ${week}`
    const res = await fetch(`/api/picksCSV`, {
      method: 'GET',
      headers: { 'Accept': 'application/json', 'Authorization': authorization },
    })
    const csv = await res.text()
    downloadCSV(csv, filename)
  }

  render() {
    const { user, week } = this.props
    return (
      <AntdFooter>
        <div className={styles.footer}>
          <Button disabled={week < 2} onClick={this.dowloadPastPicks}>Download Pool Spreadsheet</Button>
          {user.isAdmin && <Button onClick={this.dowloadAllPicks}>Download All Picks</Button>}
        </div>
      </AntdFooter>
    )
  }
}

export default Footer
