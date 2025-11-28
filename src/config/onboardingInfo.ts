export interface InfoConfig {
  title: string;
  highlight: string;
  description: string;
  ctaLabel?: string;
  icon?: string;
}

export const sideInfo: Record<string, InfoConfig> = {
  donor: {
    title: "Donors",
    highlight: "donors",
    description: "Donors are people who can give something valuable to others – time, advice, skills, contacts, money or other resources. They respond to dreams, problems or ideas shared by donees and choose how they want to help. Support can be full, partial or just a small step forward – it's always up to the donor's options and abilities.",
    ctaLabel: "PICK DONOR",
    icon: "favorite"
  },
  donee: {
    title: "Donees",
    highlight: "donees",
    description: "Donees are people who share their dreams, problems or ideas and are open to receiving help from others. On dreamhubb, a donee can ask for support in many forms – advice, feedback, skills, contacts, funding or other resources. You describe what you need and why it matters to you, and donors who resonate with your story can choose how they want to help. The support can be full, partial or just a small step forward – every bit counts.",
    ctaLabel: "PICK DONEE",
    icon: "diamond"
  }
};

export const goalInfo: Record<string, InfoConfig> = {
  dream: {
    title: "Dream",
    highlight: "dream",
    description: "On dreamhubb, dreams are meaningful goals or wishes you want to turn into reality – from personal growth to travel, career or passion plans. You share what you want to achieve and why it matters to you, and donors can help with advice, skills, contacts, funding or other resources to move your dream forward.",
    ctaLabel: "PICK DREAM",
    icon: "cloud"
  },
  problem: {
    title: "Problem",
    highlight: "problem",
    description: "On dreamhubb, problems are difficult situations you don't want to face alone – whether they're personal, financial, work-related, study-related or emotional. You describe what's going on, what you've already tried and what kind of help you need, and donors can offer perspective, guidance, resources or practical support to help you move closer to a solution.",
    ctaLabel: "PICK PROBLEM",
    icon: "error_outline"
  },
  idea: {
    title: "Idea",
    highlight: "idea",
    description: "On dreamhubb, ideas are concepts or projects you'd like to explore, improve or launch – from apps and startups to creative, social or community initiatives. You share what your idea is about, what impact you'd like it to have and what kind of support you're looking for, so donors can join in with their know-how, feedback, contacts or partnerships.",
    ctaLabel: "PICK IDEA",
    icon: "lightbulb"
  }
};

export const categoryInfo: Record<string, InfoConfig> = {
  traveling: {
    title: "Travelling",
    highlight: "travelling",
    description: "On dreamhubb, traveling covers everything related to trips, moving abroad or exploring new places – from dream vacations and study stays to relocation or travel struggles. You share where you'd like to go or what you're dealing with, and the community can help with tips, contacts, hosting, funding or real-life experience.",
    ctaLabel: "PICK TRAVELLING",
    icon: "public"
  },
  health: {
    title: "Health",
    highlight: "health",
    description: "On dreamhubb, health is about your physical and mental well-being – from fitness goals and healthy habits to overcoming health challenges or burnout. You can share what you'd like to improve or what you're struggling with, and others can support you with motivation, knowledge, resources or guidance from their own journey.",
    ctaLabel: "PICK HEALTH",
    icon: "local_hospital"
  },
  possessions: {
    title: "Possessions",
    highlight: "possesions",
    description: "On dreamhubb, possession includes things you'd like to get, share, repair or let go of – from instruments, tech and equipment to housing items or tools. You can ask for help finding, funding, lending or donating specific things, or offer what you already have to someone who truly needs it.",
    ctaLabel: "PICK POSSESSIONS",
    icon: "home"
  },
  relationships: {
    title: "Relationships",
    highlight: "relationships",
    description: "On dreamhubb, relationships focus on connections with people – family, friends, partners, colleagues or new communities. You can share dreams of better relationships, problems you're facing or ideas for building meaningful connections, and others can respond with empathy, advice, mediating help or shared experience.",
    ctaLabel: "PICK RELATIONSHIPS",
    icon: "favorite"
  },
  learning: {
    title: "Learning",
    highlight: "learning",
    description: "On dreamhubb, learning is about growing your knowledge and skills – from school and university to online courses, languages, coding, arts or any craft. You can share what you want to learn or understand better, and donors can help with tutoring, mentoring, study materials, feedback or learning paths.",
    ctaLabel: "PICK LEARNING",
    icon: "school"
  },
  events: {
    title: "Events",
    highlight: "events",
    description: "On dreamhubb, events are gatherings, meetups, shows or community actions you'd like to create, join or save – from small local meetups to charity events or bigger projects. You can describe what kind of event you dream of or what problem you're facing with it, and others can help with organisation, promotion, partners or participation.",
    ctaLabel: "PICK EVENTS",
    icon: "event"
  },
  profession: {
    title: "Profession",
    highlight: "profession",
    description: "On dreamhubb, profession is about your work life – job, career, business or freelancing. You can share your dream role, career challenges, startup ideas or transitions you're going through, and the community can support you with mentoring, networking, opportunities, feedback on your CV, portfolio or business plan.",
    ctaLabel: "PICK PROFESSION",
    icon: "work"
  },
  other: {
    title: "Other",
    highlight: "other",
    description: "On dreamhubb, other is a space for everything that doesn't clearly fit into a single category – or when you're simply not sure where your dream, problem or idea belongs. You briefly explain what it's about, and the community can not only help you, but also suggest where it might fit best, so your story reaches the right people.",
    ctaLabel: "PICK OTHER",
    icon: "more_horiz"
  }
};
