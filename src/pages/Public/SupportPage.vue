<template>
  <LegalPageShell>
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
  </LegalPageShell>
</template>

<script setup lang="ts">
import LegalPageShell from "src/components/Public/LegalPageShell.vue";
</script>
