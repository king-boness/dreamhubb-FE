<template>
  <LegalPageShell>
    <h1>Privacy Policy</h1>
      <p class="legal-page__updated">Last updated: October 7, 2026</p>

      <nav class="legal-page__anchors" aria-label="Privacy sections">
        <a href="#" @click.prevent="scrollToSection('who-we-are')">Who We Are</a>
        <a href="#" @click.prevent="scrollToSection('data-we-collect')">Data We Collect</a>
        <a href="#" @click.prevent="scrollToSection('how-we-use-data')">How We Use Data</a>
        <a href="#" @click.prevent="scrollToSection('legal-bases')">Legal Bases</a>
        <a href="#" @click.prevent="scrollToSection('ai-assisted-translation')">AI Translation</a>
        <a href="#" @click.prevent="scrollToSection('in-app-purchases')">Purchases &amp; Payments</a>
        <a href="#" @click.prevent="scrollToSection('how-we-share-data')">How We Share Data</a>
        <a href="#" @click.prevent="scrollToSection('international-transfers')">International Transfers</a>
        <a href="#" @click.prevent="scrollToSection('tracking-and-advertising')">Tracking</a>
        <a href="#" @click.prevent="scrollToSection('data-retention')">Data Retention</a>
        <a href="#" @click.prevent="scrollToSection('your-rights')">Your Rights</a>
        <a href="#" @click.prevent="scrollToSection('children')">Children</a>
        <a href="#" @click.prevent="scrollToSection('contact')">Contact</a>
      </nav>

      <section id="who-we-are">
        <h2>Who We Are</h2>
        <p>
          dreamhubb is a social platform where users can create profiles, publish posts, and connect around
          dreams, problems, ideas, and mutual support ("dreamhubb", "we", "us", "our").
        </p>
        <p>
          WolfPack Group, s. r. o. is the data controller responsible for the processing of personal data in
          connection with the dreamhubb service.
        </p>
        <p>
          WolfPack Group, s. r. o.<br />
          Čsl. armády 1853/12<br />
          075 01 Trebišov<br />
          Slovak Republic<br />
          IČO: 56651481<br />
          DIČ: 2122391678<br />
          Registered in the Commercial Register of the Municipal Court Košice, Section: Sro, Insert No.: 60901/V
        </p>
      </section>

      <section id="data-we-collect">
        <h2>Data We Collect</h2>
        <p>Depending on how you use dreamhubb, we may process:</p>
        <ul>
          <li>Account data, such as email address, username, and login-related data.</li>
          <li>Profile data, such as avatar, bio, coarse profile location, and preferences.</li>
          <li>Registration and account information, such as date of birth and gender.</li>
          <li>
            User content, such as posts, titles, descriptions, bios, comments/contributions, and uploaded images.
          </li>
          <li>
            Purchase-related information, such as transaction/purchase metadata and Token-related purchase
            history where applicable.
          </li>
          <li>
            Limited technical and security information, such as server-side operational/security logs and
            information used for abuse prevention and rate limiting.
          </li>
        </ul>
        <p>
          We do not collect GPS or precise device location. Profile location used in dreamhubb is coarse
          location information that you provide (for example continent, country, and city).
        </p>
      </section>

      <section id="how-we-use-data">
        <h2>How We Use Data</h2>
        <ul>
          <li>To create and manage user accounts.</li>
          <li>To operate profiles, posts, interactions, and related social features.</li>
          <li>To support moderation, abuse prevention, and service integrity.</li>
          <li>To provide camera/photo upload functionality when you choose to use it.</li>
          <li>To operate Token and account functionality, including related history and statistics.</li>
          <li>To maintain security, troubleshoot issues, and keep the service reliable.</li>
          <li>
            When you choose to use the Translate feature, to process the relevant post title and description
            or user bio to generate an on-demand translation.
          </li>
        </ul>
        <p>
          Translate is user-triggered and on-demand. The original content remains the default. Translation
          processing is performed only to provide the translation you request.
        </p>
      </section>

      <section id="legal-bases">
        <h2>Legal Bases for Processing</h2>
        <p>
          Where applicable data protection law requires a legal basis, we process personal data based on
          contract performance, legitimate interests, legal obligations, or consent, depending on the context.
        </p>
        <ul>
          <li>
            <strong>Performance of a contract / providing the service.</strong>
            This includes account creation and management, authentication, profiles, posts and interactions,
            requested Translate functionality, Token and account functionality, and providing core dreamhubb
            features.
          </li>
          <li>
            <strong>Legitimate interests.</strong>
            This includes security, fraud and abuse prevention, moderation, service integrity, troubleshooting,
            improving reliability, and protecting users and the service.
          </li>
          <li>
            <strong>Legal obligations.</strong>
            This includes accounting, tax or accounting records where applicable, responding to lawful requests,
            and retaining transaction records where retention is legally required.
          </li>
          <li>
            <strong>Consent.</strong>
            Only where a feature actually relies on consent under applicable law.
          </li>
        </ul>
      </section>

      <section id="ai-assisted-translation">
        <h2>AI-Assisted Translation</h2>
        <p>
          If you use Translate, dreamhubb may generate an on-demand translation of selected user-generated
          content.
        </p>
        <p>
          The app does not send translation content directly from the device to OpenAI. When you request a
          translation, the dreamhubb backend loads the relevant content from our database and sends only the
          fields needed for that request:
        </p>
        <ul>
          <li>for a post: title and description; and</li>
          <li>for a profile/user translation: bio.</li>
        </ul>
        <p>
          We do not send your username, user ID, email address, location, JWT/authentication tokens, or device
          metadata to OpenAI for translation.
        </p>
        <p>
          OpenAI processes this limited content as our translation provider for the purpose of generating the
          requested translation. dreamhubb configures translation requests to the OpenAI Responses API with
          <code>store: false</code>, which disables storage of the generated Response as application state for
          later retrieval. This does not necessarily eliminate all provider-side security or abuse-monitoring
          processing. OpenAI may retain limited API data for security and abuse-prevention purposes in
          accordance with its applicable API data policies. dreamhubb does not use this content for advertising
          or tracking.
        </p>
        <p>
          Under OpenAI's current API data policies, API inputs and outputs are not used to train OpenAI models
          by default unless the API customer explicitly opts in.
        </p>
        <p>
          Generated translations may be cached by dreamhubb for approximately 30 days to improve performance
          and reduce repeated external processing. The cache may include generated translation fields and
          source-language metadata. Cache keys may use a content hash, but the cached value may contain the
          translated fields themselves.
        </p>
        <p>
          Any additional retention or processing by OpenAI is governed by OpenAI’s applicable API data policies
          and settings, which may change over time.
        </p>
      </section>

      <section id="in-app-purchases">
        <h2>In-App Purchases and Payments</h2>
        <p>
          Token purchases on iOS are currently unavailable. The iOS app may still display Token-related
          historical or account statistics associated with your dreamhubb account.
        </p>
        <p>
          Where web-based Token purchases are available, they may be processed using Stripe. dreamhubb does
          not receive or store your full payment card details. Payment providers process payment details
          according to their own policies.
        </p>
        <p>
          We may store purchase or transaction metadata needed for the Token ledger, transaction verification,
          fraud prevention, accounting, dispute handling, or account history.
        </p>
      </section>

      <section id="how-we-share-data">
        <h2>How We Share Data</h2>
        <p>We do not sell personal data.</p>
        <p>We may share data only when needed to operate dreamhubb, including with:</p>
        <ul>
          <li>Render, for hosting, backend, and infrastructure.</li>
          <li>Cloudinary, for uploaded image/media storage and processing.</li>
          <li>
            OpenAI, for optional on-demand translation of post title and description or bio. Only the text
            needed for the requested translation is shared with OpenAI, not your account email, user ID, or
            location.
          </li>
          <li>Our SMTP/email provider, for account verification and service emails.</li>
          <li>Stripe, for web payment processing where available.</li>
          <li>Apple, for App Store and platform services.</li>
          <li>Authorities when required by law.</li>
        </ul>
      </section>

      <section id="international-transfers">
        <h2>International Data Transfers</h2>
        <p>
          Some of our service providers may process personal data outside the European Economic Area (EEA).
          Where such transfers occur, we use or rely on appropriate transfer mechanisms and safeguards required
          by applicable data protection law, taking into account the arrangements provided by the relevant
          service provider.
        </p>
      </section>

      <section id="tracking-and-advertising">
        <h2>Tracking and Advertising</h2>
        <p>
          dreamhubb does not use the personal data described in this policy for cross-app or cross-site
          tracking. The app does not currently use third-party advertising networks for behavioral advertising.
        </p>
      </section>

      <section id="data-retention">
        <h2>Data Retention</h2>
        <p>We keep personal data only as long as needed for the purposes described in this policy.</p>
        <ul>
          <li>
            Account, profile, and content data: for as long as needed to operate your account and the service,
            and as otherwise required for deletion requests or legal obligations.
          </li>
          <li>Translation cache: approximately 30 days.</li>
          <li>
            Transaction records: as needed for accounting, fraud prevention, dispute handling, and applicable
            legal obligations.
          </li>
          <li>
            Security and operational logs: for a limited period according to operational/security needs and
            applicable provider settings.
          </li>
        </ul>
      </section>

      <section id="your-rights">
        <h2>Your Rights</h2>
        <p>
          Depending on your location, you may have rights to request access, correction, deletion, restriction,
          or portability of your personal data; to object to certain processing; and, where applicable, to
          withdraw consent. You may also have the right to lodge a complaint with a competent data protection
          authority.
        </p>
        <p>
          To exercise your rights or ask a privacy question, contact us at
          <a href="mailto:matej.kostun@gmail.com">matej.kostun@gmail.com</a>.
        </p>
      </section>

      <section id="children">
        <h2>Children's Privacy</h2>
        <p>
          dreamhubb is not intended for children below the minimum age required under applicable law. If we
          become aware that a child’s personal data was processed in a manner that is not permitted under
          applicable law, we may take steps to delete that data.
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
          For privacy questions or requests, contact
          <a href="mailto:matej.kostun@gmail.com">matej.kostun@gmail.com</a>.
        </p>
        <p>
          WolfPack Group, s. r. o.<br />
          Čsl. armády 1853/12<br />
          075 01 Trebišov<br />
          Slovak Republic<br />
          IČO: 56651481
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

code {
  font-size: 0.95em;
}

.body--light .legal-page__anchors a {
  color: #bd0043;
}
</style>
