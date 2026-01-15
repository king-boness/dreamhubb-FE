import { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("src/pages/Auth/SplashScreenPage.vue"),
    name: "splash",
    meta: { requiresAuth: false }
  },
  {
    path: "/auth",
    component: () => import("src/layouts/Auth/AuthWelcomeLayout.vue"),
    name: "auth-welcome",
    meta: { guestOnly: true },
    children: [
      {
        path: "",
        component: () => import("src/pages/Auth/AuthWelcomePage.vue"),
        name: "auth-welcome-page"
      }
    ]
  },
  {
    path: "/auth-help",
    component: () => import("src/layouts/Auth/AuthWelcomeLayout.vue"),
    name: "auth-help",
    meta: { guestOnly: true },
    children: [
      {
        path: "",
        component: () => import("src/pages/Auth/AuthHelpOnboardingPage.vue"),
        name: "auth-help-page"
      }
    ]
  },
  {
    path: "/landing",
    component: () => import("src/layouts/Auth/LandingLayout.vue"),
    children: [
      { path: "", component: () => import("src/pages/Auth/LandingPage.vue"), name: "landing" },
      { path: "/login", component: () => import("src/pages/Auth/LoginPage.vue"), name: "login" }
    ]
  },
  // {
  //   path: "/",
  //   component: () => import("src/layouts/Auth/LandingLayout.vue"),
  //   children: [
  //     { path: "", component: () => import("src/pages/Auth/LandingPage.vue"), name: "landing" },
  //     { path: "login", component: () => import("src/pages/Auth/LoginPage.vue"), name: "login" }
  //   ]
  // },
  //  Register explainers
  {
    path: "/register/explainers",
    component: () => import("src/layouts/Auth/ExplainersLayout.vue"),
    name: "explainers",
    children: [
      {
        path: "1",
        component: () => import("src/pages/Auth/Explainers/ExplainersPage1.vue"),
        name: "explainers-page-1"
      },
      {
        path: "2",
        component: () => import("src/pages/Auth/Explainers/ExplainersPage2.vue"),
        name: "explainers-page-2"
      },
      {
        path: "3",
        component: () => import("src/pages/Auth/Explainers/ExplainersPage3.vue"),
        name: "explainers-page-3"
      },
      {
        path: "4",
        component: () => import("src/pages/Auth/Explainers/ExplainersPage4.vue"),
        name: "explainers-page-4"
      },
      {
        path: "5",
        component: () => import("src/pages/Auth/Explainers/ExplainersPage5.vue"),
        name: "explainers-page-5"
      }
    ]
  },
  // Onboarding Flow (New)
  {
    path: "/onboarding",
    component: () => import("src/layouts/OnBoarding/OnBoardingLayout.vue"),
    meta: { guestOnly: true },
    children: [
      {
        path: "",
        component: () => import("src/pages/Onboarding/OnboardingFlowPage.vue"),
        name: "onboarding",
        meta: { guestOnly: true }
      }
    ]
  },
  //  Register form
  {
    path: "/register/form",
    component: () => import("src/layouts/Auth/RegisterLayout.vue"),
    name: "registration"
  },

  {
    path: "/donor",
    meta: { requiresAuth: true, side: "donor" },
    name: "donor",
    component: () => import("src/layouts/Donor/DonorMainLayout.vue"),
    children: [
      {
        path: "posts",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/PostsPage.vue"),
        name: "donor-posts"
      },
      {
        path: "post-detail/:id",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/PostDetailPage.vue"),
        name: "donor-post-detail"
      },
      {
        path: "user/:userId",
        meta: { requiresAuth: true, side: "donor" },
        component: () => import("src/pages/Common/UserPublicProfilePage.vue"),
        name: "donor-user-profile"
      },
      {
        path: "filters",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/FiltersPage.vue"),
        name: "donor-filters"
      },
      {
        path: "inspirations",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/InspirationsPage.vue"),
        name: "donor-inspirations"
      },
      {
        path: "notifications",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/NotificationsPage.vue"),
        name: "donor-notifications"
      },
      {
        path: "tokens",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/TokensOnboardingPage.vue"),
        name: "donor-token"
      },
      {
        path: "tokenshop",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/TokensPage.vue"),
        name: "donor-tokenshop"
      },
      {
        path: "userprofile",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/UserProfilePage.vue"),
        name: "donor-userProfile"
      },
      {
        path: "myprofile",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/MyProfilePage.vue"),
        name: "donor-myprofile"
      },
      {
        path: "settings",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/AppSettingsPage.vue"),
        name: "donor-settings"
      },
      {
        path: "settings/password/confirmation",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/ResetPasswordPage.vue"),
        name: "donor-settings-passwordConfirmation"
      },
      {
        path: "settings/email",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/SettingsEmailPage.vue"),
        name: "donor-settings-email"
      },
      {
        path: "settings/email/confirmation",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/ResetEmailPage.vue"),
        name: "donor-settings-emailConfirmation"
      },
      {
        path: "settings/bio",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/SettingsBioPage.vue"),
        name: "donor-settings-bio"
      },
      {
        path: "settings/location",
        meta: { requiresAuth: true, hideFooter: true },
        component: () => import("src/pages/DonorPages/SettingsLocationPage.vue"),
        name: "donor-settings-location"
      },
      {
        path: "settings/privacy",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/SettingsPrivacyPage.vue"),
        name: "donor-settings-privacy"
      },
      {
        path: "post/:id/report",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/SettingsReportPage.vue"),
        name: "donor-post-report"
      },
      {
        path: "settings/language",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/SettingsLanguagePage.vue"),
        name: "donor-settings-language"
      },
      {
        path: "settings/ban",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/SettingsBanPage.vue"),
        name: "donor-settings-ban"
      },
      {
        path: "settings/about",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/SettingsAboutPage.vue"),
        name: "donor-settings-about"
      },
      {
        path: "settings/support",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/SettingsSupportPage.vue"),
        name: "donor-settings-support"
      },
      {
        path: "settings/faq",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/SettingsFaqPage.vue"),
        name: "donor-settings-faq"
      },
      {
        path: "settings/password",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/SettingsPasswordPage.vue"),
        name: "donor-settings-password"
      },
      {
        path: "help",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/HelpPage.vue"),
        name: "donor-help"
      },
      {
        path: "myprofile/donations",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/MyProfileDonationsPage.vue"),
        name: "donor-myprofile-donations"
      },
      {
        path: "myprofile/dreams",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/MyProfileDreamsPage.vue"),
        name: "donor-myprofile-dreams"
      },
      {
        path: "myprofile/problems",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/MyProfileProblemsPage.vue"),
        name: "donor-myprofile-problems"
      },
      {
        path: "myprofile/ideas",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/MyProfileIdeasPage.vue"),
        name: "donor-myprofile-ideas"
      },
      {
        path: "myprofile/reviews",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/MyProfileReviewsPage.vue"),
        name: "donor-myprofile-reviews"
      },
      {
        path: "userprofile/donations",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/UserProfileDonationsPage.vue"),
        name: "donor-userprofile-donations"
      },
      {
        path: "userprofile/dreams",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/UserProfileDreamsPage.vue"),
        name: "donor-userprofile-dreams"
      },
      {
        path: "userprofile/problems",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/UserProfileProblemsPage.vue"),
        name: "donor-userprofile-problems"
      },
      {
        path: "userprofile/ideas",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/UserProfileIdeasPage.vue"),
        name: "donor-userprofile-ideas"
      },
      {
        path: "userprofile/reviews",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/UserProfileReviewsPage.vue"),
        name: "donor-userprofile-reviews"
      },
      {
        path: "post-detail/details",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DoneePages/DreamDetailPage.vue"),
        name: "donor-post-details"
      },
      {
        path: "search",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/SearchPage.vue"),
        name: "donor-search"
      },
      {
        path: "onBoarding",
        meta: { requiresAuth: true },
        component: () => import("src/layouts/OnBoarding/OnBoardingLayout.vue"),
        name: "donor-onBoarding",
        children: [
          {
            path: "1",
            meta: { requiresAuth: true },
            component: () => import("src/pages/Auth/OnBoarding/OnBoardingPage1.vue"),
            name: "donor-onBoarding-page-1"
          },
          {
            path: "2",
            meta: { requiresAuth: true },
            component: () => import("src/pages/Auth/OnBoarding/OnBoardingPage2.vue"),
            name: "donor-onBoarding-page-2"
          },
          {
            path: "3",
            meta: { requiresAuth: true },
            component: () => import("src/pages/Auth/OnBoarding/OnBoardingPage3.vue"),
            name: "donor-onBoarding-page-3"
          },
          {
            path: "4",
            meta: { requiresAuth: true },
            component: () => import("src/pages/Auth/OnBoarding/OnBoardingPage4.vue"),
            name: "donor-onBoarding-page-4"
          }

        ]
      }

    ]
  },
  {
    path: "/donee",
    meta: { requiresAuth: true, side: "donee" },
    name: "donee",
    component: () => import("src/layouts/Donee/DoneeMainLayout.vue"),
    children: [
      {
        path: "posts",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DoneePages/PostPage.vue"),
        name: "donee-posts"
      },
      {
        path: "submit",
        meta: { requiresAuth: true },
        component: () => import("src/layouts/Donee/SubmitLayout.vue"),
        name: "submit",
        children: [
          {
            path: "1",
            meta: { requiresAuth: true },
            component: () => import("src/pages/SubmitProcess/SubmitPage1.vue"),
            name: "submit-1"
          },
          {
            path: "2",
            meta: { requiresAuth: true },
            component: () => import("src/pages/SubmitProcess/SubmitPage2.vue"),
            name: "submit-2"
          }
        ]
      },
      {
        path: "inspirations",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/InspirationsPage.vue"),
        name: "donee-inspirations"
      },
      {
        path: "userProfile",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DoneePages/UserProfilePage.vue"),
        name: "donee-userProfile"
      },
      {
        path: "userProfile/reviews",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/UserProfileReviewsPage.vue"),
        name: "donee-userProfile-reviews"
      },
      {
        path: "userProfile/donations",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/UserProfileDonationsPage.vue"),
        name: "donee-userProfile-donations"
      },
      {
        path: "userProfile/dreams",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/UserProfileDreamsPage.vue"),
        name: "donee-userProfile-dreams"
      },
      {
        path: "userProfile/problems",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/UserProfileProblemsPage.vue"),
        name: "donee-userProfile-problems"
      },
      {
        path: "userProfile/ideas",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/UserProfileIdeasPage.vue"),
        name: "donee-userProfile-ideas"
      },
      {
        path: "myprofile",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DoneePages/MyProfilePage.vue"),
        name: "donee-myprofile"
      },
      {
        path: "search",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DoneePages/SearchPage.vue"),
        name: "donee-search"
      },
      {
        path: "tokens",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/TokensOnboardingPage.vue"),
        name: "donee-token"
      },
      {
        path: "notifications",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/NotificationsPage.vue"),
        name: "donee-notifications"
      },
      {
        path: "tokenshop",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/TokensPage.vue"),
        name: "donee-tokenshop"
      },
      {
        path: "myprofile/donations",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/MyProfileDonationsPage.vue"),
        name: "donee-myprofile-donations"
      },
      {
        path: "myprofile/dreams",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/MyProfileDreamsPage.vue"),
        name: "donee-myprofile-dreams"
      },
      {
        path: "myprofile/problems",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/MyProfileProblemsPage.vue"),
        name: "donee-myprofile-problems"
      },
      {
        path: "myprofile/ideas",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/MyProfileIdeasPage.vue"),
        name: "donee-myprofile-ideas"
      },
      {
        path: "myprofile/reviews",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/MyProfileReviewsPage.vue"),
        name: "donee-myprofile-reviews"
      },
      {
        path: "post-detail",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/PostDetailPage.vue"),
        name: "donee-post-detail"
      },
      {
        path: "post-detail/topDream",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DoneePages/TopDreamPage.vue"),
        name: "donee-post-detail-topUp"
      },
      {
        path: "post-edit/:id",
        meta: { requiresAuth: true, hideMainHeader: true, hideFooter: true },
        component: () => import("src/pages/DoneePages/TopDreamPage.vue"),
        name: "donee-post-edit"
      },
      {
        path: "post-detail/details",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DoneePages/DreamDetailPage.vue"),
        name: "donee-post-details"
      },
      {
        path: "post-detail/accomplished",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DoneePages/AccomplishedDreamPage.vue"),
        name: "donee-post-details-accomplished"
      },
      {
        path: "post-detail/review",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DoneePages/DonatorReviewPage.vue"),
        name: "donee-post-details-review"
      },
      {
        path: "user/:userId",
        meta: { requiresAuth: true, side: "donee" },
        component: () => import("src/pages/Common/UserPublicProfilePage.vue"),
        name: "donee-user-profile"
      },
      {
        path: "postCreation",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DoneePages/PostCreationPage.vue"),
        name: "submit-postCreation"
      },
      {
        path: "postCreation/goal",
        meta: { requiresAuth: true, hideMainHeader: true },
        component: () => import("src/pages/DoneePages/PostGoalPickerPage.vue"),
        name: "donee-postCreation-goal"
      },
      {
        path: "postCreation/category",
        meta: { requiresAuth: true, hideMainHeader: true },
        component: () => import("src/pages/DoneePages/PostCategoryPickerPage.vue"),
        name: "donee-postCreation-category"
      },
      {
        path: "settings",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/AppSettingsPage.vue"),
        name: "donee-settings"
      },
      {
        path: "settings/password/confirmation",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/ResetPasswordPage.vue"),
        name: "donee-settings-passwordConfirmation"
      },
      {
        path: "settings/email",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/SettingsEmailPage.vue"),
        name: "donee-settings-email"
      },
      {
        path: "settings/email/confirmation",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/ResetEmailPage.vue"),
        name: "donee-settings-emailConfirmation"
      },
      {
        path: "settings/bio",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/SettingsBioPage.vue"),
        name: "donee-settings-bio"
      },
      {
        path: "settings/location",
        meta: { requiresAuth: true, hideFooter: true },
        component: () => import("src/pages/DonorPages/SettingsLocationPage.vue"),
        name: "donee-settings-location"
      },
      {
        path: "settings/privacy",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/SettingsPrivacyPage.vue"),
        name: "donee-settings-privacy"
      },
      {
        path: "post-detail/report",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/SettingsReportPage.vue"),
        name: "settings-report"
      },
      {
        path: "settings/language",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/SettingsLanguagePage.vue"),
        name: "donee-settings-language"
      },
      {
        path: "settings/ban",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/SettingsBanPage.vue"),
        name: "donee-settings-ban"
      },
      {
        path: "settings/about",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/SettingsAboutPage.vue"),
        name: "donee-settings-about"
      },
      {
        path: "settings/support",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/SettingsSupportPage.vue"),
        name: "donee-settings-support"
      },
      {
        path: "settings/faq",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/SettingsFaqPage.vue"),
        name: "donee-settings-faq"
      },
      {
        path: "settings/password",
        meta: { requiresAuth: true },
        component: () => import("src/pages/DonorPages/SettingsPasswordPage.vue"),
        name: "donee-settings-password"
      },
      {
        path: "onBoarding",
        meta: { requiresAuth: true },
        component: () => import("src/layouts/OnBoarding/OnBoardingLayout.vue"),
        name: "donee-onBoarding",
        children: [
          {
            path: "1",
            meta: { requiresAuth: true },
            component: () => import("src/pages/Auth/OnBoarding/OnBoardingPage1.vue"),
            name: "donee-onBoarding-page-1"
          },
          {
            path: "2",
            meta: { requiresAuth: true },
            component: () => import("src/pages/Auth/OnBoarding/OnBoardingPage2.vue"),
            name: "donee-onBoarding-page-2"
          },
          {
            path: "3",
            meta: { requiresAuth: true },
            component: () => import("src/pages/Auth/OnBoarding/OnBoardingPage3.vue"),
            name: "donee-onBoarding-page-3"
          },
          {
            path: "4",
            meta: { requiresAuth: true },
            component: () => import("src/pages/Auth/OnBoarding/OnBoardingPage4.vue"),
            name: "donee-onBoarding-page-4"
          }

        ]
      }
    ]
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue")
  }
];
export default routes;
