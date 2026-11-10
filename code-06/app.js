App({
  onLaunch() { console.log('[App] onLaunch') },
  onUnhandledRejection({ reason }) {
    // 未被 catch 的错误统一在这里兜底
    console.error('[App] unhandledRejection', reason && reason.message, reason && reason.type)
  }
})
