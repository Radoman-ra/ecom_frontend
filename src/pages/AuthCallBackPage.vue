<template>
  <div>
    <p>Redirecting...</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import Cookies from 'js-cookie'

export default defineComponent({
  setup() {
    const router = useRouter()

    const saveTokensAndRedirect = () => {
      const urlParams = new URLSearchParams(window.location.search)
      const accessToken = urlParams.get('access_token')
      const refreshToken = urlParams.get('refresh_token')
      const ACCESS_TOKEN_EXPIRE_MINUTES = 15
      const REFRESH_TOKEN_EXPIRE_DAYS = 7
      console.log(accessToken)
      console.log(refreshToken)

      if (accessToken && refreshToken) {
        Cookies.set('access_token', accessToken, {
          expires: ACCESS_TOKEN_EXPIRE_MINUTES / (24 * 60),
          secure: true
        })

        Cookies.set('refresh_token', refreshToken, {
          expires: REFRESH_TOKEN_EXPIRE_DAYS,
          secure: true
        })

        router.push('/')
      } else {
        console.error('Tokens are missing from URL')
      }
    }

    return {
      saveTokensAndRedirect
    }
  },

  mounted() {
    this.saveTokensAndRedirect()
  }
})
</script>
