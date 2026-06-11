<template>
  <LegalPageShell>
    <h1>Privacy Policy</h1>
      <p class="legal-page__updated">Last updated: May 28, 2026</p>

      <nav class="legal-page__anchors" aria-label="Privacy sections">
        <a href="#" @click.prevent="scrollToSection('who-we-are')">Who We Are</a>
        <a href="#" @click.prevent="scrollToSection('data-we-collect')">Data We Collect</a>
        <a href="#" @click.prevent="scrollToSection('how-we-use-data')">How We Use Data</a>
        <a href="#" @click.prevent="scrollToSection('in-app-purchases')">In-App Purchases</a>
        <a href="#" @click.prevent="scrollToSection('how-we-share-data')">How We Share Data</a>
        <a href="#" @click.prevent="scrollToSection('data-retention')">Data Retention</a>
        <a href="#" @click.prevent="scrollToSection('your-rights')">Your Rights</a>
        <a href="#" @click.prevent="scrollToSection('contact')">Contact</a>
      </nav>

      <section id="who-we-are">
        <h2>Who We Are</h2>
        <p>
          dreamhubb is a social platform where users can create profiles, publish posts, and connect around
          dreams, ideas, and support. For the purposes of this app, the data controller is the owner of
          dreamhubb.com ("dreamhubb", "we", "us", "our").
        </p>
      </section>

      <section id="data-we-collect">
        <h2>Data We Collect</h2>
        <ul>
          <li>Account data (such as email address, username, and login-related data).</li>
          <li>Profile data (such as avatar, bio, location, and preferences).</li>
          <li>User content (posts, comments, text, and images you upload).</li>
          <li>Technical data (device/app diagnostics, IP address, and log/security events).</li>
          <li>Purchase-related data (product identifiers, transaction identifiers, and purchase status).</li>
        </ul>
      </section>

      <section id="how-we-use-data">
        <h2>How We Use Data</h2>
        <ul>
          <li>To create and manage user accounts.</li>
          <li>To operate social features (profiles, posts, interactions, moderation).</li>
          <li>To provide camera/photo upload functionality when you choose to use it.</li>
          <li>To process and validate token purchases and prevent fraud.</li>
          <li>To maintain security, troubleshoot issues, and improve app performance.</li>
        </ul>
      </section>

      <section id="in-app-purchases">
        <h2>In-App Purchases and Payments</h2>
        <p>
          On iOS, token purchases are processed through Apple In-App Purchases. We do not receive your full
          payment card details. We process purchase metadata required to verify transactions and grant virtual
          tokens.
        </p>
      </section>

      <section id="how-we-share-data">
        <h2>How We Share Data</h2>
        <p>We may share data only when needed to run the service, including:</p>
        <ul>
          <li>Hosting and backend infrastructure providers (including services hosted on Render).</li>
          <li>Media storage/processing provider Cloudinary for uploaded images.</li>
          <li>Payment ecosystems (Apple, and other payment providers where applicable).</li>
          <li>Authorities when required by law.</li>
        </ul>
      </section>

      <section id="data-retention">
        <h2>Data Retention</h2>
        <p>
          We keep personal data only as long as needed for account operations, legal obligations, security,
          dispute resolution, and legitimate business needs.
        </p>
      </section>

      <section id="your-rights">
        <h2>Your Rights</h2>
        <p>
          Depending on your location, you may have rights to request access, correction, deletion, restriction,
          or portability of your personal data, and to object to certain processing.
        </p>
      </section>

      <section id="children">
        <h2>Children's Privacy</h2>
        <p>
          dreamhubb is not intended for children under the age required by applicable law. If you believe a
          child provided personal data, contact us and we will address it.
        </p>
      </section>

      <section id="changes">
        <h2>Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Material updates will be reflected by changing
          the "Last updated" date on this page.
        </p>
      </section>

      <section id="contact">
        <h2>Contact</h2>
        <p>
          For privacy questions or requests, contact the dreamhubb owner at
          <a href="mailto:privacy@dreamhubb.com">privacy@dreamhubb.com</a>.
        </p>
      </section>
  </LegalPageShell>
</template>

<script setup lang="ts">
import LegalPageShell from "src/components/Public/LegalPageShell.vue";

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}
</script>

<style scoped lang="scss">
.legal-page__anchors {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 14px;
  margin: 18px 0 10px;
}

.legal-page__anchors a {
  color: #ff1f74;
  text-decoration: none;
  cursor: pointer;
}

ul {
  padding-left: 18px;
  margin: 0;
}

.body--light .legal-page__anchors a {
  color: #bd0043;
}
</style>
