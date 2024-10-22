<template>
  <div>
    <p>Redirecting...</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  setup() {
    const router = useRouter()

    const saveTokensAndRedirect = () => {
      const urlParams = new URLSearchParams(window.location.search)
      const accessToken = urlParams.get('access_token')
      const refreshToken = urlParams.get('refresh_token')

      if (accessToken && refreshToken) {
        localStorage.setItem('access_token', accessToken)
        localStorage.setItem('refresh_token', refreshToken)

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
