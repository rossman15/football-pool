import React from 'react'

/*
  * This component will load your data on componentDidMount and also
    each time a certain prop changes -> 'compareProp'
  * This component will inject into your component:
      - data: response from the load data function
      - isLoading: wether or not we are loading datas
*/
const LoadData = (compareProp, loadData) => Component => {
  return class LoadData extends React.Component {
    state = {
      isLoading: true
    }

    async componentDidMount() {
      const data = await loadData(this.props)
      this.setState({ isLoading: false, data })
    }

    async componentDidUpdate(prevProps, prevState) {
      if (this.props[compareProp] !== prevProps[compareProp]) {
        this.setState({
          isLoading: true
        })
        const data = await loadData(this.props)
        this.setState({ isLoading: false, data })
      }
    }

    render() {
      const { isLoading, data } = this.state
      return <Component {...this.props} data={data} isLoading={isLoading} />
    }
  }
}
export default LoadData
