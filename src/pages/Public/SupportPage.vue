<template>
  <div class="legal-page">
    <main class="legal-page__card">
      <h1>Help &amp; Support</h1>
      <p class="legal-page__updated">dreamhubb user support</p>

      <section>
        <h2>Contact us</h2>
        <p>
          For account help, reporting inappropriate content, blocking abusive users, or App Store review
          questions, contact:
          <a href="mailto:matej.kostun@gmail.com">matej.kostun@gmail.com</a>
        </p>
        <p>We aim to review safety reports within 24 hours on business days.</p>
      </section>

      <section>
        <h2>Report objectionable content</h2>
        <p>
          Open any post in the app, scroll to the bottom of the post detail screen, and tap
          <strong>Report a post</strong>. Choose a reason and submit details.
        </p>
      </section>

      <section>
        <h2>Block abusive users</h2>
        <p>
          On a post detail screen or a user profile, tap <strong>Block user</strong>. Blocked users are
          removed from your feed immediately and cannot interact with you through the app.
        </p>
        <p>
          Manage blocked accounts in the app under Settings → Blocked users.
        </p>
      </section>

      <section>
        <h2>Policies</h2>
        <p>
          <router-link :to="{ name: 'terms-of-use' }">Terms of Use</router-link>
          ·
          <router-link :to="{ name: 'privacy-policy' }">Privacy Policy</router-link>
        </p>
      </section>
    </main>
  </div>
</template>

<style scoped lang="scss">
.legal-page {
  min-height: 100dvh;
  background: #0b0b10;
  color: #f2f2f5;
  padding: 24px 16px 40px;
  box-sizing: border-box;
}

.legal-page__card {
  width: 100%;
  max-width: 880px;
  margin: 0 auto;
  background: #11111a;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 24px 18px;
}

.legal-page__updated {
  color: rgba(255, 255, 255, 0.65);
}

h1,
h2 {
  font-family: poppinsSemiBold, sans-serif;
}

h2 {
  margin-top: 22px;
}

a,
:deep(a) {
  color: #ff1f74;
}
</style>
