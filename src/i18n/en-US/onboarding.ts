export default {
  // Content for the onboarding info modals (config/onboardingInfo.ts holds only key paths + icon ids)
  onboardingInfo: {
    side: {
      donor: {
        title: "Donors",
        highlight: "donors",
        description:
          "Donors are people who can give something valuable to others – time, advice, skills, contacts, money or other resources. They respond to dreams, problems or ideas shared by donees and choose how they want to help. Support can be full, partial or just a small step forward – it's always up to the donor's options and abilities.",
        ctaLabel: "PICK DONOR"
      },
      donee: {
        title: "Donees",
        highlight: "donees",
        description:
          "Donees are people who share their dreams, problems or ideas and are open to receiving help from others. On dreamhubb, a donee can ask for support in many forms – advice, feedback, skills, contacts, funding or other resources. You describe what you need and why it matters to you, and donors who resonate with your story can choose how they want to help. The support can be full, partial or just a small step forward – every bit counts.",
        ctaLabel: "PICK DONEE"
      }
    },
    goal: {
      dream: {
        title: "Dream",
        highlight: "dream",
        description:
          "On dreamhubb, dreams are meaningful goals or wishes you want to turn into reality – from personal growth to travel, career or passion plans. You share what you want to achieve and why it matters to you, and donors can help with advice, skills, contacts, funding or other resources to move your dream forward.",
        ctaLabel: "PICK DREAM"
      },
      problem: {
        title: "Problem",
        highlight: "problem",
        description:
          "On dreamhubb, problems are difficult situations you don't want to face alone – whether they're personal, financial, work-related, study-related or emotional. You describe what's going on, what you've already tried and what kind of help you need, and donors can offer perspective, guidance, resources or practical support to help you move closer to a solution.",
        ctaLabel: "PICK PROBLEM"
      },
      idea: {
        title: "Idea",
        highlight: "idea",
        description:
          "On dreamhubb, ideas are concepts or projects you'd like to explore, improve or launch – from apps and startups to creative, social or community initiatives. You share what your idea is about, what impact you'd like it to have and what kind of support you're looking for, so donors can join in with their know-how, feedback, contacts or partnerships.",
        ctaLabel: "PICK IDEA"
      }
    },
    category: {
      traveling: {
        title: "Travelling",
        highlight: "travelling",
        description:
          "On dreamhubb, traveling covers everything related to trips, moving abroad or exploring new places – from dream vacations and study stays to relocation or travel struggles. You share where you'd like to go or what you're dealing with, and the community can help with tips, contacts, hosting, funding or real-life experience.",
        ctaLabel: "PICK TRAVELLING"
      },
      health: {
        title: "Health",
        highlight: "health",
        description:
          "On dreamhubb, health is about your physical and mental well-being – from fitness goals and healthy habits to overcoming health challenges or burnout. You can share what you'd like to improve or what you're struggling with, and others can support you with motivation, knowledge, resources or guidance from their own journey.",
        ctaLabel: "PICK HEALTH"
      },
      possessions: {
        title: "Possessions",
        highlight: "possessions",
        description:
          "On dreamhubb, possessions include things you'd like to get, share, repair or let go of – from instruments, tech and equipment to housing items or tools. You can ask for help finding, funding, lending or donating specific things, or offer what you already have to someone who truly needs it.",
        ctaLabel: "PICK POSSESSIONS"
      },
      relationships: {
        title: "Relationships",
        highlight: "relationships",
        description:
          "On dreamhubb, relationships focus on connections with people – family, friends, partners, colleagues or new communities. You can share dreams of better relationships, problems you're facing or ideas for building meaningful connections, and others can respond with empathy, advice, mediating help or shared experience.",
        ctaLabel: "PICK RELATIONSHIPS"
      },
      learning: {
        title: "Learning",
        highlight: "learning",
        description:
          "On dreamhubb, learning is about growing your knowledge and skills – from school and university to online courses, languages, coding, arts or any craft. You can share what you want to learn or understand better, and donors can help with tutoring, mentoring, study materials, feedback or learning paths.",
        ctaLabel: "PICK LEARNING"
      },
      events: {
        title: "Events",
        highlight: "events",
        description:
          "On dreamhubb, events are gatherings, meetups, shows or community actions you'd like to create, join or save – from small local meetups to charity events or bigger projects. You can describe what kind of event you dream of or what problem you're facing with it, and others can help with organization, promotion, partners or participation.",
        ctaLabel: "PICK EVENTS"
      },
      profession: {
        title: "Profession",
        highlight: "profession",
        description:
          "On dreamhubb, profession is about your work life – job, career, business or freelancing. You can share your dream role, career challenges, startup ideas or transitions you're going through, and the community can support you with mentoring, networking, opportunities, feedback on your CV, portfolio or business plan.",
        ctaLabel: "PICK PROFESSION"
      },
      other: {
        title: "Other",
        highlight: "other",
        description:
          "On dreamhubb, other is a space for everything that doesn't clearly fit into a single category – or when you're simply not sure where your dream, problem or idea belongs. You briefly explain what it's about, and the community can not only help you, but also suggest where it might fit best, so your story reaches the right people.",
        ctaLabel: "PICK OTHER"
      }
    }
  },
  onboarding: {
    // Screen titles / instructions (intentionally lowercase to match the existing design)
    chooseYourSideTitle: "choose your side",
    postWillBeAbout: "the post will be about",
    fromCategory: "from category",
    youLiveIn: "you live in",
    swipeInstruction: "choose by swiping up or down",
    fillUpYourData: "Fill in your details",
    loadingExperience: "Loading your dream experience…",
    illustrationAlt: "Illustration",
    sideDonor: "Donor",
    sideDonee: "Donee",
    whoIsSide: "Who is {side}?",
    pickSide: "Pick {side}",
    legacySideBlurb:
      "Any person that can give or provide anything or any service that someone else might be interested in and find valuable. There is a variety of ways in which the donor can help donees. They can help fully, partially, or anything in between depending on their skills, means, and abilities.",
    password: {
      requirementsTitle: "Password requirements",
      minLength: "At least 8 characters",
      uppercase: "At least one uppercase letter (A–Z)",
      number: "At least one number (0–9)",
      special: "At least one special character (e.g. ! {'@'} # $ % _ )"
    },
    validation: {
      enterValidEmail: "Enter a valid email address.",
      passwordRequirementsNotMet: "Password does not meet the requirements.",
      repeatPasswordRequired: "Repeat password is required.",
      continentRequired: "Continent is required.",
      countryRequired: "Country is required.",
      cityRequired: "City is required.",
      termsRequired: "You must accept the Terms of Use and Privacy Policy to continue.",
      emailAlreadyRegistered: "This email is already registered. Please choose another one or log in.",
      validDate: "Must be a valid date.",
      validEmail: "Must be a valid email.",
      cityRequiredSelect: "City is required. Please select a valid city.",
      fillAllRequired: "Please fill in all required fields.",
      locationProcessFailed: "Failed to process your location. Please make sure you selected a valid continent, country, and city (if applicable).",
      validationError: "Validation error"
    },
    location: {
      dialogTitle: "Enable Location Services",
      dialogBody: "Would you like to automatically fill in your location based on your current position?",
      noThanks: "No, thanks",
      allow: "Allow",
      fetchFailed: "Failed to get your location. Please select manually."
    },
    // Demo options for legacy RegistrationPage4 (proper names; kept localizable)
    registerDemo: {
      countries: {
        usa: "USA",
        canada: "Canada",
        mexico: "Mexico"
      },
      states: {
        alabama: "Alabama",
        alaska: "Alaska",
        arizona: "Arizona",
        arkansas: "Arkansas",
        california: "California"
      },
      cities: {
        newYork: "New York",
        losAngeles: "Los Angeles",
        chicago: "Chicago",
        houston: "Houston",
        phoenix: "Phoenix"
      }
    },
    // AuthHelpOnboardingPage slides
    help: {
      slide1Title: "It's all about help",
      slide1Text:
        "dreamhubb connects people through dreams, problems, and ideas. Share what you want to achieve — and find others ready to lift you up.",
      slide2Title: "Help others, let others help you",
      slide2Text:
        "Offer advice, experience, contacts, or a small act of support. When you need it, the community is here to give back.",
      slide3Title: "Earn Tokens by helping",
      slide3Text:
        "Every kind action earns Tokens — recognition for the goodwill you bring to dreamhubb and the people you support.",
      slide4Title: "Even partial help can push someone towards their dream",
      slide4Text:
        "You do not have to solve everything at once. A useful tip, a warm word, or an introduction can move someone meaningfully closer.",
      slide5Line1: "Now let's accomplish our",
      slide5Line2: "dreams with",
      slide5Text:
        "Join a community where giving and receiving support becomes a natural part of everyday life."
    },
    // Legacy token explainer pages (OnBoardingPage1-4)
    tokens: {
      page1Title: "Headline of how it works",
      page1Text:
        "We connect dreamers with those who are willing to support their goals, creating a community of support and motivation. Start fulfilling your own dreams or help someone else fulfill theirs today with Tokens.",
      page2Title: "What you can do with your tokens",
      page2Option: "We connect dreamers with those",
      page3Title: "Cash flow",
      page4Title: "And now you are good to go!",
      page4Text:
        "Start fulfilling your own dreams or help someone else fulfill theirs today with Tokens."
    }
  }
};
