import React from 'react'
import ReactDOM from 'react-dom'
import 'scss/styles.scss'
import App from 'app/main/app'
import registerServiceWorker from './registerServiceWorker'

ReactDOM.render(<App />, document.getElementById('root'))
registerServiceWorker()
