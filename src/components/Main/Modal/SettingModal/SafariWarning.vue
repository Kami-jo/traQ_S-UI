<template>
  <section v-if="showSafariWarning">
    Safariを利用していてかつ、アプリまたはPWAをインストールをしていない場合は、
    7日間の使用がなかった際にここの設定情報が消えることがあります。 詳細は
    <a
      href="https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/"
    >
      Webkitの公式ブログの記事
    </a>
    をご覧ください。
  </section>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { isSafari, isIOSApp, isPWA } from '@/lib/util/browser'

export default defineComponent({
  name: 'SafariWarning',
  setup() {
    const showSafariWarning = isSafari() && !isIOSApp() && !isPWA()

    return { showSafariWarning }
  }
})
</script>
