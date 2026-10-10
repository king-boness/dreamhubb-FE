export default {
  settingsPages: {
    deleteAccount: {
      title: "Delete Account",
      body: "This action permanently deletes your account and hides your posts. To continue, type:",
      phrase: "I want to delete my account: {username}",
      inputAria: "Confirm account deletion",
      deleted: "Your account has been deleted."
    },
    faq: {
      description: "Common questions about dreamhubb, Tokens, and your account.",
      q1: {
        title: "What is dreamhubb?",
        text: "dreamhubb is a social help platform where people can share dreams, problems, and ideas, and receive support from others."
      },
      q2: {
        title: "What are Tokens?",
        text: "Tokens are an in-app virtual currency used to support posts inside dreamhubb. Tokens are not cash and cannot be withdrawn."
      },
      q3: {
        title: "Can I withdraw Tokens?",
        text: "No. Tokens are only used inside dreamhubb and cannot be exchanged for money."
      },
      q4: {
        title: "How can I report content?",
        text: "Open a post detail and tap \"Report a post\". You can also contact support from Settings."
      },
      q5: {
        title: "How can I delete my account?",
        text: "Go to Settings and tap \"Delete account\". You will be asked to confirm before deletion."
      },
      q6: {
        title: "How can I contact support?",
        text: "Go to Settings → Help & Support or email {email}."
      },
      q7: {
        title: "Are token purchases available on iOS?",
        text: "Token purchases on iOS are temporarily unavailable while Apple In-App Purchase validation is finalized."
      }
    },
    ban: {
      heading: "Blocked users",
      rules1: "Blocked users cannot appear in your feed. Their posts are removed immediately when you block them.",
      rules2: "To report harmful content, open a post and use {report}. For urgent issues, visit {support} or email {email}.",
      supportLink: "Support",
      empty: "You have not blocked anyone yet.",
      userFallback: "User #{id}",
      unblock: "Unblock",
      unblocked: "User unblocked."
    },
    email: {
      requestCode: "Request code →",
      confirmationCode: "Enter Confirmation Code",
      newEmail: "New Email Address",
      repeatNewEmail: "Repeat New Email Address",
      changeEmailCta: "Change email"
    },
    bio: {
      placeholder: "Tell something about yourself..."
    },
    password: {
      oldPassword: "Old Password",
      forgotOldPassword: "I don’t remember my password",
      repeatNewPassword: "Repeat New Password",
      requestReset: "Request reset",
      resetCodeSent: "We sent you your reset code on Email Address {email}",
      resetCode: "Reset Code",
      resendCode: "Resend code →",
      confirmCode: "Confirm code"
    },
    privacy: {
      receiveEmailMarketing: "Receive Email Marketing",
      receiveEmailMarketingSecondary: "Receive additional email updates",
      trackingPreferences: "Tracking preferences",
      terms: "Terms and Conditions",
      policy: "Privacy Policy",
      saved: "Privacy settings saved"
    },
    support: {
      intro:
        "Need help with your account, a post, or reporting inappropriate content? Contact our support team and we will respond as soon as possible.",
      emailLabel: "Email:",
      reviewPolicies: "You can also review our {privacy} and {terms}.",
      privacyLink: "Privacy Policy",
      termsLink: "Terms of Use",
      reportHint: "To report a post, open any post and tap {report} at the bottom of the detail screen."
    },
    report: {
      description:
        "Help us keep dreamhubb safe. Select a reason and describe the issue. Our team will review your report.",
      inappropriateContent: "Inappropriate Content",
      hateSpeech: "Hate speech or Racism",
      wrongCategory: "Wrong Category",
      wrongSubcategory: "Wrong Subcategory",
      tellUsMore: "Tell us more about the problem...",
      selectCategory: "Select the Correct Category",
      selectSubcategory: "Select the Correct Subcategory",
      sendReport: "Send Report",
      missingPostId: "Post ID is missing. Open report from a post detail screen."
    }
  }
};
