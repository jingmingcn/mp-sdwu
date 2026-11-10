Component({
  data: {
    effects: '',
    // 用微信官方示例视频，避免依赖外部资源
    videoSrc: 'https://storage.360buyimg.com/jdc-article/watermark.mp4'
  },
  methods: {
    onEffects(e) { this.setData({ effects: e.detail.value.join(' ') }) }
  }
})
