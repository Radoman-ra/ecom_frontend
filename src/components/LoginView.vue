<template>
  <div>
    <h1>Login</h1>
    <form @submit.prevent="login">
      <input
        v-model="email" 
        type="email" 
        placeholder="Email"
        required
      >
      <input
        v-model="password"
        type="password"
        placeholder="Password"
        required
      ></input>
      <button type="submit">
        Login
      </button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { login } from "../services/auth";
import { useStore } from "vuex";

export default defineComponent({
  setup() {
    const store = useStore();
    const loginUser = async () => {
      const response = await login({
        email: this.email,
        password: this.password,
      });
      store.commit("setToken", response.access_token);
      store.commit("setUser", response.user);
    };
    return { loginUser };
  },
  data() {
    return {
      email: "",
      password: "",
    };
  },
});
</script>
