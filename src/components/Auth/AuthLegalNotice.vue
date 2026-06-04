<template>
  <p class="authLegalNotice">
    By continuing, you agree to our
    <router-link class="authLegalNotice-link" :to="{ name: 'terms-of-use' }">Terms of Use</router-link>
    and
    <router-link class="authLegalNotice-link" :to="{ name: 'privacy-policy' }">Privacy Policy</router-link>.
    dreamhubb has <strong>zero tolerance</strong> for objectionable content and abusive users.
  </p>
</template>

<style scoped lang="scss">
.authLegalNotice {
  margin: 1rem 0 0;
  font-size: 0.8rem;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.72);
  text-align: center;
  max-width: 22rem;
}

.authLegalNotice-link {
  color: #ff4db8;
  text-decoration: underline;
}
</style>
