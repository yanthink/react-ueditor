import React from 'react'
import PropTypes from 'prop-types'
import styles from './index.less'

const loaded = []

function loadScript (src) {
  if (loaded[src]) return loaded[src]

  loaded[src] = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.async = true
    script.src = src
    script.onload = e => resolve(e)
    script.onerror = e => reject(e)
    document.body.appendChild(script)
  })

  return loaded[src]
}

class UEditor extends React.Component {

  static propTypes = {
    id: PropTypes.string,
    value: PropTypes.string,
    style: PropTypes.object,
    onChange: PropTypes.func,
  }

  constructor (props) {
    super(props)

    const { id = `ueditor${(Date.now())}`, style, ...config } = this.props
    this.id = id
    this.config = config
    this.style = style
    this.setContentByWillReceiveProps = false
    this.setContentByContentChange = false

    const { value } = this.props
    this.state = {
      editorReady: false,
      value,
    }
  }

  componentDidMount () {
    require.ensure([], require => {
      require('./ueditor.config')
      loadScript('//apps.bdimg.com/libs/ueditor/1.4.3.1/ueditor.all.min.js').then(() => {
        this.initUE()
      })
    })
  }

  componentWillReceiveProps (nextProps) {
    const { value } = nextProps
    this.setState({ value })
    if (this.state.editorReady && !this.setContentByContentChange) {
      this.setContentByWillReceiveProps = true
      this.ue.setContent(value)
      this.setContentByWillReceiveProps = false
    }
  }

  componentWillUnmount () {
    if (this.state.editorReady) {
      this.ue.destroy()
    }
  }

  initUE = () => {
    this.ue = new window.UE.ui.Editor(this.config)
    this.ue.render(this.id)
    this.ue.ready(() => {
      this.setState({ editorReady: true })

      const { value } = this.state
      if (value) {
        this.ue.setContent(value)
      }
      this.ue.addListener('contentChange', () => {
        if (!this.setContentByWillReceiveProps) {
          this.setContentByContentChange = true
          const value = this.ue.getContent()
          this.props.onChange(value)
          this.setContentByContentChange = false
        }
      })
      // this.ue.execCommand('serverparam', { token: '' })
    })
  }

  render () {
    return (
      <div className={styles.ueditor} id={this.id} style={this.style} />
    )
  }
}

export default UEditor
