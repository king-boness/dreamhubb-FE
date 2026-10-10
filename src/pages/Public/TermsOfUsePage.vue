<template>
  <LegalPageShell>
    <h1>{{ t("legal.terms.title") }}</h1>
    <p class="legal-page__updated">{{ t("legal.lastUpdated", { date: lastUpdatedDisplay }) }}</p>
    <p v-if="showEnglishOnlyNotice" class="legal-page__notice">{{ t("legal.englishOnlyNotice") }}</p>

    <nav class="legal-page__anchors" :aria-label="t('legal.terms.navAria')">
      <a href="#" @click.prevent="scrollToSection('overview')">{{ t("legal.terms.anchors.overview") }}</a>
      <a href="#" @click.prevent="scrollToSection('who-we-are')">{{ t("legal.terms.anchors.whoWeAre") }}</a>
      <a href="#" @click.prevent="scrollToSection('eligibility-and-accounts')">{{ t("legal.terms.anchors.accounts") }}</a>
      <a href="#" @click.prevent="scrollToSection('user-generated-content')">{{ t("legal.terms.anchors.userContent") }}</a>
      <a href="#" @click.prevent="scrollToSection('acceptable-use')">{{ t("legal.terms.anchors.acceptableUse") }}</a>
      <a href="#" @click.prevent="scrollToSection('community-help')">{{ t("legal.terms.anchors.communityHelp") }}</a>
      <a href="#" @click.prevent="scrollToSection('virtual-tokens')">{{ t("legal.terms.anchors.tokens") }}</a>
      <a href="#" @click.prevent="scrollToSection('purchases-and-payments')">{{ t("legal.terms.anchors.purchases") }}</a>
      <a href="#" @click.prevent="scrollToSection('ai-assisted-translation')">{{ t("legal.terms.anchors.aiTranslation") }}</a>
      <a href="#" @click.prevent="scrollToSection('intellectual-property')">{{ t("legal.terms.anchors.ip") }}</a>
      <a href="#" @click.prevent="scrollToSection('service-availability')">{{ t("legal.terms.anchors.service") }}</a>
      <a href="#" @click.prevent="scrollToSection('disclaimers-and-liability')">{{ t("legal.terms.anchors.liability") }}</a>
      <a href="#" @click.prevent="scrollToSection('privacy')">{{ t("legal.terms.anchors.privacy") }}</a>
      <a href="#" @click.prevent="scrollToSection('governing-law')">{{ t("legal.terms.anchors.governingLaw") }}</a>
      <a href="#" @click.prevent="scrollToSection('changes')">{{ t("legal.terms.anchors.changes") }}</a>
      <a href="#" @click.prevent="scrollToSection('contact')">{{ t("legal.terms.anchors.contact") }}</a>
    </nav>

    <section id="overview">
      <h2>Overview</h2>
      <p>
        These Terms of Use ("Terms") govern your use of the dreamhubb applications, website, and related
        services operated by WolfPack Group, s. r. o. ("dreamhubb", "we", "us", "our").
      </p>
      <p>
        By creating an account or otherwise using dreamhubb where permitted by law, you agree to these Terms.
        If you do not agree, please do not use the service.
      </p>
    </section>

    <section id="who-we-are">
      <h2>Who We Are</h2>
      <p>
        WolfPack Group, s. r. o. is the service provider, operator, and contracting entity for dreamhubb,
        including where paid services are available.
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
      <p>
        Contact:
        <a href="mailto:matej.kostun@gmail.com">matej.kostun@gmail.com</a>
      </p>
    </section>

    <section id="eligibility-and-accounts">
      <h2>Eligibility and Accounts</h2>
      <p>
        You must be legally capable of using dreamhubb and meet the minimum age required under applicable law.
        dreamhubb is not intended for children below that minimum age.
      </p>
      <p>
        You are responsible for the accuracy of the information you provide when registering and for keeping
        your login credentials secure. You must not share your account in a way that compromises the security
        or integrity of the service.
      </p>
      <p>
        We may require email verification before certain features become available. You may delete your account
        directly in the app via Settings → Delete account.
      </p>
      <p>
        We may restrict, suspend, or terminate an account where reasonably necessary for serious violations of
        these Terms, abuse, fraud, or security risk, subject to applicable law.
      </p>
    </section>

    <section id="user-generated-content">
      <h2>User-Generated Content</h2>
      <p>
        dreamhubb allows you to submit content such as Dreams, Problems, Ideas, titles, descriptions, bios,
        comments/contributions, and images ("User Content").
      </p>
      <p>
        You retain ownership of your User Content. You grant WolfPack Group a non-exclusive licence to host,
        store, technically process, display, distribute within dreamhubb, and moderate your User Content, and
        otherwise use it as needed to operate and provide the service.
      </p>
      <p>
        This licence is limited to operating dreamhubb. It does not transfer ownership of your User Content to
        us and does not give us an unlimited right to use your content for unrelated advertising or other
        purposes outside the service. This licence lasts only for as long as reasonably necessary to operate
        dreamhubb and to handle deletion, backup, security, or legal obligations.
      </p>
      <p>
        You are responsible for the User Content you submit and must have the rights needed to grant the
        licence above.
      </p>
    </section>

    <section id="acceptable-use">
      <h2>Acceptable Use and Moderation</h2>
      <p>
        dreamhubb has zero tolerance for objectionable or abusive use of the service. You must not post or
        engage in:
      </p>
      <ul>
        <li>unlawful content;</li>
        <li>harassment, threats, or hate speech;</li>
        <li>sexual content involving minors;</li>
        <li>fraud, scams, or deceptive practices;</li>
        <li>spam;</li>
        <li>intellectual-property infringement;</li>
        <li>abusive or harmful behavior; or</li>
        <li>harmful or misleading impersonation.</li>
      </ul>
      <p>
        You may report posts and block users in the app. Blocked users are removed from your feed.
      </p>
      <p>
        We may moderate User Content, remove content, and restrict or suspend accounts that violate these
        Terms. We aim to review reports responsibly, but we do not guarantee immediate removal of every
        reported item.
      </p>
    </section>

    <section id="community-help">
      <h2>Community Help and Contributions</h2>
      <p>
        dreamhubb lets people share dreams, problems, and ideas and connect with others who may help through
        experience, advice, contacts, time, skills, or other support.
      </p>
      <p>
        dreamhubb provides the platform and tools for these interactions. We do not guarantee that you will
        receive help, that a dream, problem, or idea will be successfully resolved, or that all User Content is
        accurate or complete. You remain responsible for your own decisions and for how you interact with other
        users. If you interact with others offline, please proceed carefully.
      </p>
    </section>

    <section id="virtual-tokens">
      <h2>Virtual Tokens</h2>
      <p>
        Tokens are virtual in-app units used for selected dreamhubb features. Depending on the features
        available to you, Tokens may be obtained through supported in-app activities, bonuses, or purchase
        where a purchase flow is available. Tokens may be used for selected post-related actions and support
        functionality within dreamhubb.
      </p>
      <p>
        Specific bonus amounts, package prices, and reward values may change over time and are not fixed by
        these Terms.
      </p>
      <p>
        Tokens are not fiat money, do not have a guaranteed cash value, cannot be withdrawn for money, cannot
        be redeemed for fiat currency, cannot be traded outside dreamhubb, and are not cryptocurrency. Tokens
        do not create a bank account or stored-value account with us.
      </p>
      <p>
        If you send or allocate Tokens to a post (sometimes described in the app as a Token contribution or
        similar support action), that action is a virtual Token action within dreamhubb. It is not automatically
        a financial gift, charitable donation, bank transfer, or direct payment to another person.
      </p>
    </section>

    <section id="purchases-and-payments">
      <h2>Purchases and Payments</h2>
      <p>
        Token purchases on iOS are currently unavailable.
      </p>
      <p>
        Where web-based purchases are available, they may be processed through Stripe. WolfPack Group, s. r. o. provides the paid dreamhubb service, while Stripe processes the payment.
        dreamhubb does not store your full payment card details. Stripe processes payment details according to
        its own terms and privacy notices.
      </p>
      <p>
        Prices, availability, and package composition may change, subject to applicable law. Changes will not
        retroactively remove statutory rights you already have in respect of a completed purchase.
      </p>
      <p>
        Refund, cancellation, and withdrawal rights apply as required by applicable law and, where relevant,
        payment-provider rules. Statutory consumer rights remain unaffected.
      </p>
    </section>

    <section id="ai-assisted-translation">
      <h2>AI-Assisted Translation</h2>
      <p>
        dreamhubb may offer an on-demand Translate feature as a convenience. Machine-generated translations may
        contain mistakes or omissions. The original user-submitted content remains the authoritative version.
        We do not guarantee perfect translation accuracy.
      </p>
      <p>
        How personal data is processed for Translate is described in our
        <a href="https://dreamhubb.com/privacy">Privacy Policy</a>.
      </p>
    </section>

    <section id="intellectual-property">
      <h2>Intellectual Property of dreamhubb</h2>
      <p>
        The dreamhubb name, branding, software, user interface, graphics, and other service materials are owned
        or licensed by WolfPack Group, s. r. o. Using dreamhubb does not give you ownership of the service or
        those materials.
      </p>
      <p>
        User Content remains yours as described in the User-Generated Content section. These Terms do not claim
        ownership of third-party or open-source components that WolfPack Group does not own.
      </p>
    </section>

    <section id="service-availability">
      <h2>Service Availability and Changes</h2>
      <p>
        We may update, improve, suspend, or discontinue parts of dreamhubb, including features and presentation,
        subject to applicable law. Maintenance windows, outages, and temporary interruptions may also occur.
      </p>
      <p>
        If you have paid for a service, any changes or interruptions remain subject to your rights under
        applicable law.
      </p>
    </section>

    <section id="disclaimers-and-liability">
      <h2>Disclaimers and Liability</h2>
      <p>
        User Content may be inaccurate or incomplete. Help outcomes are not guaranteed. The service may
        occasionally be unavailable. Third-party services (such as hosting, payments, media, or translation
        providers) have their own terms and practices.
      </p>
      <p>
        Nothing in these Terms excludes or limits rights or liability that cannot be excluded or limited under
        applicable law.
      </p>
    </section>

    <section id="privacy">
      <h2>Privacy</h2>
      <p>
        How we process personal data is described in our Privacy Policy at
        <a href="https://dreamhubb.com/privacy">https://dreamhubb.com/privacy</a>.
      </p>
    </section>

    <section id="governing-law">
      <h2>Governing Law and Disputes</h2>
      <p>
        These Terms are governed by the laws of the Slovak Republic, without depriving consumers of mandatory
        protections available under the law of their country of residence.
      </p>
      <p>
        Disputes are handled by courts or other competent bodies as determined by applicable law.
      </p>
    </section>

    <section id="changes">
      <h2>Changes to These Terms</h2>
      <p>
        We may update these Terms from time to time. Material updates will be reflected by changing the
        "Last updated" date on this page and, where required by law, by providing appropriate notice.
      </p>
      <p>
        Changes apply subject to applicable law and do not allow us to change completed paid transactions
        retroactively in an arbitrary way.
      </p>
    </section>

    <section id="contact">
      <h2>Contact</h2>
      <p>
        For questions about these Terms, contact
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
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import LegalPageShell from "src/components/Public/LegalPageShell.vue";
import {
  hasApprovedSkLegalBody,
  legalLastUpdatedDisplay
} from "src/config/legalDocuments";

const { t, locale } = useI18n();
const lastUpdatedDisplay = legalLastUpdatedDisplay("terms");
const showEnglishOnlyNotice = computed(() => {
  if (hasApprovedSkLegalBody("terms")) return false;
  const code = String(locale.value || "");
  return code !== "en-US" && code !== "en-GB";
});

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

.legal-page__notice {
  margin: 12px 0 0;
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(255, 31, 116, 0.12);
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.95rem;
  line-height: 1.5;
}

.body--light .legal-page__anchors a {
  color: #bd0043;
}

.body--light .legal-page__notice {
  background: rgba(189, 0, 67, 0.08);
  color: rgba(17, 18, 24, 0.85);
}
</style>
