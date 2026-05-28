<template>
  <div class="legal-page">
    <main class="legal-page__card">
      <h1>Terms of Use</h1>
      <p class="legal-page__updated">Last updated: May 28, 2026</p>

      <section>
        <h2>Overview</h2>
        <p>
          These Terms of Use govern your use of dreamhubb applications and related services. By using
          dreamhubb, you agree to these terms.
        </p>
      </section>

      <section>
        <h2>Accounts and Content</h2>
        <p>
          You are responsible for your account and for content you post. You must not post unlawful, abusive,
          infringing, fraudulent, or harmful content.
        </p>
      </section>

      <section>
        <h2>Virtual Tokens and Purchases</h2>
        <p>
          Virtual tokens are provided as in-app digital goods. Purchases on iOS are processed by Apple under
          Apple's terms. Token availability and pricing may change.
        </p>
      </section>

      <section>
        <h2>Service Changes</h2>
        <p>
          We may update, suspend, or discontinue parts of the service at any time, including features and
          pricing, where allowed by law.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          For legal or policy questions, contact
          <a href="mailto:privacy@dreamhubb.com">privacy@dreamhubb.com</a>.
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
  box-sizing: border-box;
}

.legal-page__updated {
  margin-top: -4px;
  color: rgba(255, 255, 255, 0.65);
}

h1,
h2 {
  margin: 0 0 10px;
  font-family: poppinsSemiBold, sans-serif;
}

h1 {
  font-size: 2rem;
}

h2 {
  font-size: 1.2rem;
  margin-top: 22px;
}

p {
  line-height: 1.65;
}

a {
  color: #ff1f74;
}

.body--light .legal-page {
  background: #f2f4f8;
  color: #111218;
}

.body--light .legal-page__card {
  background: #ffffff;
  border-color: rgba(0, 0, 0, 0.08);
}

.body--light .legal-page__updated {
  color: rgba(0, 0, 0, 0.55);
}

.body--light a {
  color: #bd0043;
}
</style>
