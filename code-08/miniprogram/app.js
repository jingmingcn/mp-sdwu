const { parseEntry, setEntryContext } = require('./utils/attribution')

App({
  onLaunch(options) {
    const entry = parseEntry()
    setEntryContext(entry)
    console.log('[App] 启动来源', entry, 'raw=', options)
  },
  globalData: { entry: null }
})
