/**
 * 独立分包：可脱离主包单独运行，扫码直达时只下载这一个包，启动极快。
 *
 * 代价：
 *   - 不能引用主包的任何资源（组件、工具函数都要复制一份）
 *   - App 未注册，getApp() 返回 undefined（可用 getApp({ allowDefault: true })）
 *   - 主包的 onLaunch 不执行，全局逻辑要在这里自己做一遍
 */
Component({
  data: { appState: '' },
  methods: {
    onLoad() {
      let state
      try {
        const app = getApp({ allowDefault: true })
        state = app ? '拿到（可能是默认对象）' : 'undefined'
      } catch (e) {
        state = 'throw: ' + e.message
      }
      this.setData({ appState: state })
    }
  }
})
