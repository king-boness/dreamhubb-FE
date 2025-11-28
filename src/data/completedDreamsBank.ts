// src/data/completedDreamsBank.ts
export interface CompletedDreamCard {
  id: number;
  title: string; // napr. "Aurora Expedition"
  userName: string; // napr. "Felix Thornberg"
  avatarUrl: string; // URL na avatar (môže byť zatial externý placeholder)
  imageUrl: string; // URL obrázku sna (tiež placeholder / externý obrázok)
  location?: string; // napr. "Iceland"
  completedAt?: string; // napr. "2025-03-12"
}

export const completedDreamsBank: CompletedDreamCard[] = [
  {
    id: 1,
    title: "Aurora Expedition",
    userName: "Felix Thornberg",
    avatarUrl: "https://picsum.photos/seed/felix-avatar/80/80",
    imageUrl: "https://picsum.photos/seed/aurora/400/260",
    location: "Iceland",
    completedAt: "2025-03-12"
  },
  {
    id: 2,
    title: "Eyes Surgery",
    userName: "Eric Doe",
    avatarUrl: "https://picsum.photos/seed/eric-avatar/80/80",
    imageUrl: "https://picsum.photos/seed/eyes/400/260",
    location: "Japan",
    completedAt: "2025-04-02"
  },
  {
    id: 3,
    title: "Driving Tesla",
    userName: "Katie Horvath",
    avatarUrl: "https://picsum.photos/seed/katie-avatar/80/80",
    imageUrl: "https://picsum.photos/seed/tesla/400/260",
    location: "USA",
    completedAt: "2025-01-20"
  },
  {
    id: 4,
    title: "Mountain Climbing",
    userName: "Sarah Johnson",
    avatarUrl: "https://picsum.photos/seed/sarah-avatar/80/80",
    imageUrl: "https://picsum.photos/seed/mountain/400/260",
    location: "Switzerland",
    completedAt: "2025-02-15"
  },
  {
    id: 5,
    title: "Learning Piano",
    userName: "Michael Chen",
    avatarUrl: "https://picsum.photos/seed/michael-avatar/80/80",
    imageUrl: "https://picsum.photos/seed/piano/400/260",
    location: "Austria",
    completedAt: "2025-03-01"
  },
  {
    id: 6,
    title: "Ocean Conservation",
    userName: "Emma Wilson",
    avatarUrl: "https://picsum.photos/seed/emma-avatar/80/80",
    imageUrl: "https://picsum.photos/seed/ocean/400/260",
    location: "Australia",
    completedAt: "2025-02-28"
  },
  {
    id: 7,
    title: "Art Exhibition",
    userName: "David Martinez",
    avatarUrl: "https://picsum.photos/seed/david-avatar/80/80",
    imageUrl: "https://picsum.photos/seed/art/400/260",
    location: "France",
    completedAt: "2025-03-10"
  },
  {
    id: 8,
    title: "Tech Startup",
    userName: "Lisa Anderson",
    avatarUrl: "https://picsum.photos/seed/lisa-avatar/80/80",
    imageUrl: "https://picsum.photos/seed/tech/400/260",
    location: "USA",
    completedAt: "2025-01-25"
  }
];
