<template>
  <q-page class="donorPostsPage">
    <!-- Tabs: by help / by pay / by top -->
    <div class="donor-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="donor-tabs_button"
        :class="{ 'donor-tabs_button--active': activeTab === tab.value }"
        type="button"
        @click="setTab(tab.value)"
      >
        <img
          :src="tab.icon"
          :alt="tab.label"
          class="donor-tabs_icon"
        />
        <span class="donor-tabs_label">{{ tab.label }}</span>
      </button>
    </div>

    <!-- Filters button -->
    <div class="donorPosts-filtersWrapper">
      <button
        class="donor-filters_button"
        type="button"
        @click="handleOpenFilters"
      >
        <img
          :src="filtersIcon"
          alt=""
          class="donor-filters_icon"
        />
        <span>filters</span>
      </button>
    </div>

    <!-- Feed of posts -->
    <div class="donorPosts-feed">
    <div
        v-for="post in sortedPosts"
        :key="post.id"
        class="postCard"
        role="button"
        tabindex="0"
        @click="emitOpenPost(post)"
        @keyup.enter.space="emitOpenPost(post)"
    >
        <!-- Hero image with overlay -->
        <div class="postCard-imageWrapper">
          <img
            :src="post.imageUrl"
            :alt="post.dreamTitle"
            class="postCard-image"
          />

          <!-- Author badge (top left) -->
          <div class="postCard-authorBadge" @click.stop="emitOpenAuthor(post)">
            <q-avatar size="32px">
              <img :src="post.authorAvatarUrl" alt="" />
            </q-avatar>
            <div class="postCard-authorText">
              <div class="postCard-authorName">{{ post.authorName }}</div>
              <div class="postCard-authorBadgeLabel">{{ post.authorBadgeLabel }}</div>
            </div>
          </div>

          <!-- Category + Reward pills (bottom) -->
          <div class="postCard-titleRow">
            <div class="postCard-categoryPill">
              <q-icon
                name="img:/assets/icons/ui/icon-category-general.svg"
                class="postCard-categoryIcon"
                size="14px"
              />
              <span>{{ post.categoryLabel }}</span>
            </div>
            <div class="postCard-rewardPill">
              <q-icon
                name="img:/assets/icons/ui/icon-reward.svg"
                class="postCard-rewardIcon"
                size="14px"
              />
              <span>{{ post.tokenReward }}</span>
            </div>
          </div>
        </div>

        <!-- Text content -->
        <div class="postCard-body">
          <h3 class="postCard-title">{{ post.dreamTitle }}</h3>
          <div class="postCard-meta">
            <span class="postCard-location">
              <i class="fa-solid fa-location-dot"></i>
              {{ post.location }}
            </span>
            <span class="postCard-date">{{ formatDate(post.createdAt) }}</span>
          </div>
          <p class="postCard-preview">{{ post.previewText }}</p>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// Tab interface
interface DonorTab {
  value: "help" | "pay" | "top";
  label: string;
  icon: string;
}

// Tab icons - using existing SVG icons
const tabHelpIcon = new URL("../../assets/icons/byHelpHeart-icon.svg", import.meta.url).href; // srdiečko (heart)
const tabPayIcon = new URL("../../assets/icons/byPay-icon.svg", import.meta.url).href; // diamant (diamond)
const tabTopIcon = new URL("../../assets/icons/byTop-icon.svg", import.meta.url).href; // šípka hore (up arrow)

// Filters icon - custom sliders icon
const filtersIcon = new URL("../../assets/icons/icon-filters.svg", import.meta.url).href;

// Tabs definition
const tabs = ref<DonorTab[]>([
  { value: "help", label: "by help", icon: tabHelpIcon },
  { value: "pay", label: "by pay", icon: tabPayIcon },
  { value: "top", label: "by top", icon: tabTopIcon }
]);

// Active tab
const activeTab = ref<"help" | "pay" | "top">("help");

// Set tab handler
const setTab = (value: "help" | "pay" | "top") => {
  activeTab.value = value;
};

// Sorted posts - filtered by active tab, always sorted by tokenReward (descending)
const sortedPosts = computed(() => {
  const postsCopy = posts.value.filter(post => post.tab === activeTab.value);
  return postsCopy.sort((a, b) => {
    const aTokens = a.tokenReward ?? 0;
    const bTokens = b.tokenReward ?? 0;
    return bTokens - aTokens;
  });
});

// Mock data interface
interface DonorPost {
  id: number;
  backendPostId: number; // ID that exists in BE (e.g., 3)
  tab: "help" | "pay" | "top";
  authorName: string;
  authorAvatarUrl: string;
  authorBadgeLabel: string;
  dreamTitle: string;
  categoryLabel: string;
  tokenReward: number;
  previewText: string;
  location: string;
  createdAt: string;
  imageUrl: string;
}

// Mock posts data - 24 posts for "by help", 24 for "by pay", 24 for "by top" (72 total)
// All unique: unique author, tokenReward, location
// All dates from 2025
const posts = ref<DonorPost[]>([
  // BY HELP - 24 posts (lower token rewards: 30-200)
  {
    id: 1,
    backendPostId: 3,
    tab: "help",
    authorName: "Maria Garcia",
    authorAvatarUrl: "https://picsum.photos/seed/maria1/100/100",
    authorBadgeLabel: "Volunteer",
    dreamTitle: "School Supplies Drive",
    categoryLabel: "Education",
    tokenReward: 30,
    previewText: "Collecting and distributing school supplies to children who cannot afford basic learning materials.",
    location: "Philippines, Manila",
    createdAt: "01/15/2025",
    imageUrl: "https://picsum.photos/seed/school1/800/600"
  },
  {
    id: 2,
    backendPostId: 3,
    tab: "help",
    authorName: "Sarah Johnson",
    authorAvatarUrl: "https://picsum.photos/seed/sarah2/100/100",
    authorBadgeLabel: "Dreamer",
    dreamTitle: "Community Library Project",
    categoryLabel: "Education",
    tokenReward: 50,
    previewText: "Building a free community library to provide books and learning resources for children in underserved neighborhoods.",
    location: "Kenya, Nairobi",
    createdAt: "02/01/2025",
    imageUrl: "https://picsum.photos/seed/library2/800/600"
  },
  {
    id: 3,
    backendPostId: 3,
    tab: "help",
    authorName: "Tom Brown",
    authorAvatarUrl: "https://picsum.photos/seed/tom3/100/100",
    authorBadgeLabel: "Activist",
    dreamTitle: "Food Bank Network",
    categoryLabel: "Community",
    tokenReward: 60,
    previewText: "Creating a network of food banks to fight hunger and provide meals to families in need.",
    location: "Brazil, São Paulo",
    createdAt: "02/10/2025",
    imageUrl: "https://picsum.photos/seed/food3/800/600"
  },
  {
    id: 4,
    backendPostId: 3,
    tab: "help",
    authorName: "James Wilson",
    authorAvatarUrl: "https://picsum.photos/seed/james4/100/100",
    authorBadgeLabel: "Helper",
    dreamTitle: "Clean Water Initiative",
    categoryLabel: "Health",
    tokenReward: 75,
    previewText: "Installing clean water wells in rural villages to provide safe drinking water for families.",
    location: "Ethiopia, Addis Ababa",
    createdAt: "02/18/2025",
    imageUrl: "https://picsum.photos/seed/water4/800/600"
  },
  {
    id: 5,
    backendPostId: 3,
    tab: "help",
    authorName: "Amanda Lee",
    authorAvatarUrl: "https://picsum.photos/seed/amanda5/100/100",
    authorBadgeLabel: "Nurse",
    dreamTitle: "Medical Clinic in Rural Area",
    categoryLabel: "Health",
    tokenReward: 85,
    previewText: "Establishing a medical clinic to provide basic healthcare services to remote communities.",
    location: "Bangladesh, Dhaka",
    createdAt: "03/05/2025",
    imageUrl: "https://picsum.photos/seed/medical5/800/600"
  },
  {
    id: 6,
    backendPostId: 3,
    tab: "help",
    authorName: "Peter Schmidt",
    authorAvatarUrl: "https://picsum.photos/seed/peter6/100/100",
    authorBadgeLabel: "Teacher",
    dreamTitle: "Mobile Learning Center",
    categoryLabel: "Education",
    tokenReward: 95,
    previewText: "Creating a mobile learning center that travels to remote areas to provide education to children.",
    location: "Mongolia, Ulaanbaatar",
    createdAt: "03/12/2025",
    imageUrl: "https://picsum.photos/seed/mobile6/800/600"
  },
  {
    id: 7,
    backendPostId: 3,
    tab: "help",
    authorName: "Fatima Al-Rashid",
    authorAvatarUrl: "https://picsum.photos/seed/fatima7/100/100",
    authorBadgeLabel: "Social Worker",
    dreamTitle: "Women's Empowerment Center",
    categoryLabel: "Community",
    tokenReward: 105,
    previewText: "Building a center to provide skills training and support for women in underserved communities.",
    location: "Pakistan, Karachi",
    createdAt: "03/20/2025",
    imageUrl: "https://picsum.photos/seed/women7/800/600"
  },
  {
    id: 8,
    backendPostId: 3,
    tab: "help",
    authorName: "Kevin O'Brien",
    authorAvatarUrl: "https://picsum.photos/seed/kevin8/100/100",
    authorBadgeLabel: "Builder",
    dreamTitle: "Emergency Shelter Program",
    categoryLabel: "Community",
    tokenReward: 115,
    previewText: "Providing temporary housing and emergency shelters for families affected by natural disasters.",
    location: "Haiti, Port-au-Prince",
    createdAt: "04/02/2025",
    imageUrl: "https://picsum.photos/seed/shelter8/800/600"
  },
  {
    id: 9,
    backendPostId: 3,
    tab: "help",
    authorName: "Priya Sharma",
    authorAvatarUrl: "https://picsum.photos/seed/priya9/100/100",
    authorBadgeLabel: "Nutritionist",
    dreamTitle: "Nutrition Program for Children",
    categoryLabel: "Health",
    tokenReward: 125,
    previewText: "Implementing a nutrition program to combat malnutrition among children in impoverished areas.",
    location: "Nepal, Kathmandu",
    createdAt: "04/10/2025",
    imageUrl: "https://picsum.photos/seed/nutrition9/800/600"
  },
  {
    id: 10,
    backendPostId: 3,
    tab: "help",
    authorName: "Marcus Johnson",
    authorAvatarUrl: "https://picsum.photos/seed/marcus10/100/100",
    authorBadgeLabel: "Mentor",
    dreamTitle: "Youth Mentorship Program",
    categoryLabel: "Education",
    tokenReward: 135,
    previewText: "Creating mentorship opportunities for at-risk youth to guide them toward positive life choices.",
    location: "South Africa, Johannesburg",
    createdAt: "04/18/2025",
    imageUrl: "https://picsum.photos/seed/mentor10/800/600"
  },
  {
    id: 11,
    backendPostId: 3,
    tab: "help",
    authorName: "Yuki Nakamura",
    authorAvatarUrl: "https://picsum.photos/seed/yuki11/100/100",
    authorBadgeLabel: "Therapist",
    dreamTitle: "Mental Health Support Center",
    categoryLabel: "Health",
    tokenReward: 145,
    previewText: "Establishing a mental health center to provide counseling and support services to those in need.",
    location: "Japan, Osaka",
    createdAt: "04/25/2025",
    imageUrl: "https://picsum.photos/seed/mental11/800/600"
  },
  {
    id: 12,
    backendPostId: 3,
    tab: "help",
    authorName: "Elena Rodriguez",
    authorAvatarUrl: "https://picsum.photos/seed/elena12/100/100",
    authorBadgeLabel: "Coordinator",
    dreamTitle: "Disaster Relief Fund",
    categoryLabel: "Community",
    tokenReward: 155,
    previewText: "Organizing a disaster relief fund to provide immediate assistance to communities affected by emergencies.",
    location: "Mexico, Mexico City",
    createdAt: "05/03/2025",
    imageUrl: "https://picsum.photos/seed/disaster12/800/600"
  },
  {
    id: 13,
    backendPostId: 3,
    tab: "help",
    authorName: "Ahmed Hassan",
    authorAvatarUrl: "https://picsum.photos/seed/ahmed13/100/100",
    authorBadgeLabel: "Engineer",
    dreamTitle: "Solar Power for Villages",
    categoryLabel: "Technology",
    tokenReward: 165,
    previewText: "Installing solar panels in remote villages to provide clean and affordable electricity.",
    location: "Tanzania, Dar es Salaam",
    createdAt: "05/11/2025",
    imageUrl: "https://picsum.photos/seed/solar13/800/600"
  },
  {
    id: 14,
    backendPostId: 3,
    tab: "help",
    authorName: "Isabella Costa",
    authorAvatarUrl: "https://picsum.photos/seed/isabella14/100/100",
    authorBadgeLabel: "Veterinarian",
    dreamTitle: "Animal Rescue Shelter",
    categoryLabel: "Community",
    tokenReward: 175,
    previewText: "Building an animal rescue shelter to care for abandoned and injured animals in the community.",
    location: "Portugal, Lisbon",
    createdAt: "05/19/2025",
    imageUrl: "https://picsum.photos/seed/animal14/800/600"
  },
  {
    id: 15,
    backendPostId: 3,
    tab: "help",
    authorName: "Raj Patel",
    authorAvatarUrl: "https://picsum.photos/seed/raj15/100/100",
    authorBadgeLabel: "Developer",
    dreamTitle: "Digital Literacy Program",
    categoryLabel: "Education",
    tokenReward: 185,
    previewText: "Teaching digital skills and computer literacy to help people access opportunities in the digital age.",
    location: "India, Mumbai",
    createdAt: "05/27/2025",
    imageUrl: "https://picsum.photos/seed/digital15/800/600"
  },
  {
    id: 16,
    backendPostId: 3,
    tab: "help",
    authorName: "Sophie Martin",
    authorAvatarUrl: "https://picsum.photos/seed/sophie16/100/100",
    authorBadgeLabel: "Counselor",
    dreamTitle: "Refugee Support Services",
    categoryLabel: "Community",
    tokenReward: 195,
    previewText: "Providing comprehensive support services including housing, education, and job training for refugees.",
    location: "Jordan, Amman",
    createdAt: "06/04/2025",
    imageUrl: "https://picsum.photos/seed/refugee16/800/600"
  },
  {
    id: 17,
    backendPostId: 3,
    tab: "help",
    authorName: "Carlos Mendez",
    authorAvatarUrl: "https://picsum.photos/seed/carlos17/100/100",
    authorBadgeLabel: "Farmer",
    dreamTitle: "Sustainable Farming Training",
    categoryLabel: "Sustainability",
    tokenReward: 200,
    previewText: "Training farmers in sustainable agricultural practices to improve food security and environmental protection.",
    location: "Colombia, Bogotá",
    createdAt: "06/12/2025",
    imageUrl: "https://picsum.photos/seed/farming17/800/600"
  },
  {
    id: 18,
    backendPostId: 3,
    tab: "help",
    authorName: "Lily Chen",
    authorAvatarUrl: "https://picsum.photos/seed/lily18/100/100",
    authorBadgeLabel: "Artist",
    dreamTitle: "Art Therapy Program",
    categoryLabel: "Art & Culture",
    tokenReward: 190,
    previewText: "Using art therapy to help children and adults cope with trauma and express themselves creatively.",
    location: "Taiwan, Taipei",
    createdAt: "06/20/2025",
    imageUrl: "https://picsum.photos/seed/art18/800/600"
  },
  {
    id: 19,
    backendPostId: 3,
    tab: "help",
    authorName: "Mohammed Ali",
    authorAvatarUrl: "https://picsum.photos/seed/mohammed19/100/100",
    authorBadgeLabel: "Imam",
    dreamTitle: "Community Center",
    categoryLabel: "Community",
    tokenReward: 180,
    previewText: "Building a community center that serves as a gathering place for education, worship, and social activities.",
    location: "Indonesia, Jakarta",
    createdAt: "06/28/2025",
    imageUrl: "https://picsum.photos/seed/center19/800/600"
  },
  {
    id: 20,
    backendPostId: 3,
    tab: "help",
    authorName: "Emma Thompson",
    authorAvatarUrl: "https://picsum.photos/seed/emma20/100/100",
    authorBadgeLabel: "Librarian",
    dreamTitle: "Mobile Book Library",
    categoryLabel: "Education",
    tokenReward: 170,
    previewText: "Operating a mobile library that brings books and reading programs to remote and underserved communities.",
    location: "Canada, Vancouver",
    createdAt: "07/05/2025",
    imageUrl: "https://picsum.photos/seed/mobile20/800/600"
  },
  {
    id: 21,
    backendPostId: 3,
    tab: "help",
    authorName: "Diego Silva",
    authorAvatarUrl: "https://picsum.photos/seed/diego21/100/100",
    authorBadgeLabel: "Coach",
    dreamTitle: "Youth Sports Program",
    categoryLabel: "Sports",
    tokenReward: 160,
    previewText: "Creating sports programs for youth to promote physical health, teamwork, and positive life skills.",
    location: "Argentina, Buenos Aires",
    createdAt: "07/13/2025",
    imageUrl: "https://picsum.photos/seed/sports21/800/600"
  },
  {
    id: 22,
    backendPostId: 3,
    tab: "help",
    authorName: "Aisha Khan",
    authorAvatarUrl: "https://picsum.photos/seed/aisha22/100/100",
    authorBadgeLabel: "Midwife",
    dreamTitle: "Maternal Health Clinic",
    categoryLabel: "Health",
    tokenReward: 150,
    previewText: "Establishing a clinic focused on maternal and child health services in rural areas.",
    location: "Afghanistan, Kabul",
    createdAt: "07/21/2025",
    imageUrl: "https://picsum.photos/seed/maternal22/800/600"
  },
  {
    id: 23,
    backendPostId: 3,
    tab: "help",
    authorName: "Thomas Anderson",
    authorAvatarUrl: "https://picsum.photos/seed/thomas23/100/100",
    authorBadgeLabel: "Lawyer",
    dreamTitle: "Legal Aid Clinic",
    categoryLabel: "Community",
    tokenReward: 140,
    previewText: "Providing free legal services to low-income individuals who cannot afford legal representation.",
    location: "Ghana, Accra",
    createdAt: "07/29/2025",
    imageUrl: "https://picsum.photos/seed/legal23/800/600"
  },
  {
    id: 24,
    backendPostId: 3,
    tab: "help",
    authorName: "Mei Lin",
    authorAvatarUrl: "https://picsum.photos/seed/mei24/100/100",
    authorBadgeLabel: "Dentist",
    dreamTitle: "Free Dental Care Program",
    categoryLabel: "Health",
    tokenReward: 130,
    previewText: "Offering free dental care services and oral health education to underserved communities.",
    location: "Vietnam, Ho Chi Minh City",
    createdAt: "08/06/2025",
    imageUrl: "https://picsum.photos/seed/dental24/800/600"
  },
  // BY PAY - 24 posts (higher token rewards: 300-600)
  {
    id: 25,
    backendPostId: 3,
    tab: "pay",
    authorName: "Robert Kim",
    authorAvatarUrl: "https://picsum.photos/seed/robert25/100/100",
    authorBadgeLabel: "Investor",
    dreamTitle: "Renewable Energy Grid",
    categoryLabel: "Technology",
    tokenReward: 600,
    previewText: "Building a smart renewable energy grid to power entire cities with clean, sustainable electricity.",
    location: "Germany, Berlin",
    createdAt: "01/10/2025",
    imageUrl: "https://picsum.photos/seed/energy25/800/600"
  },
  {
    id: 26,
    backendPostId: 3,
    tab: "pay",
    authorName: "Chen Wei",
    authorAvatarUrl: "https://picsum.photos/seed/chen26/100/100",
    authorBadgeLabel: "Scientist",
    dreamTitle: "Space Exploration Mission",
    categoryLabel: "Science",
    tokenReward: 580,
    previewText: "Establishing a research laboratory dedicated to advancing space exploration and discovering new planets.",
    location: "China, Beijing",
    createdAt: "01/18/2025",
    imageUrl: "https://picsum.photos/seed/space26/800/600"
  },
  {
    id: 27,
    backendPostId: 3,
    tab: "pay",
    authorName: "Yuki Tanaka",
    authorAvatarUrl: "https://picsum.photos/seed/yuki27/100/100",
    authorBadgeLabel: "Designer",
    dreamTitle: "Smart City Infrastructure",
    categoryLabel: "Technology",
    tokenReward: 560,
    previewText: "Developing intelligent city infrastructure to improve urban living and reduce environmental impact.",
    location: "Japan, Tokyo",
    createdAt: "01/25/2025",
    imageUrl: "https://picsum.photos/seed/smart27/800/600"
  },
  {
    id: 28,
    backendPostId: 3,
    tab: "pay",
    authorName: "Mohamed Ali",
    authorAvatarUrl: "https://picsum.photos/seed/mohamed28/100/100",
    authorBadgeLabel: "Builder",
    dreamTitle: "Affordable Housing Complex",
    categoryLabel: "Community",
    tokenReward: 540,
    previewText: "Constructing affordable housing units for low-income families in urban areas.",
    location: "Egypt, Cairo",
    createdAt: "02/02/2025",
    imageUrl: "https://picsum.photos/seed/housing28/800/600"
  },
  {
    id: 29,
    backendPostId: 3,
    tab: "pay",
    authorName: "Michael Chen",
    authorAvatarUrl: "https://picsum.photos/seed/michael29/100/100",
    authorBadgeLabel: "Visionary",
    dreamTitle: "Ocean Conservation Project",
    categoryLabel: "Environment",
    tokenReward: 520,
    previewText: "Protecting marine life through sustainable practices and community education programs.",
    location: "Australia, Great Barrier Reef",
    createdAt: "02/09/2025",
    imageUrl: "https://picsum.photos/seed/ocean29/800/600"
  },
  {
    id: 30,
    backendPostId: 3,
    tab: "pay",
    authorName: "Anna Kowalski",
    authorAvatarUrl: "https://picsum.photos/seed/anna30/100/100",
    authorBadgeLabel: "Entrepreneur",
    dreamTitle: "Sustainable Fashion Brand",
    categoryLabel: "Fashion",
    tokenReward: 500,
    previewText: "Creating a sustainable fashion brand that uses recycled materials and ethical production methods.",
    location: "Poland, Warsaw",
    createdAt: "02/16/2025",
    imageUrl: "https://picsum.photos/seed/fashion30/800/600"
  },
  {
    id: 31,
    backendPostId: 3,
    tab: "pay",
    authorName: "Sophie Anderson",
    authorAvatarUrl: "https://picsum.photos/seed/sophie31/100/100",
    authorBadgeLabel: "Pioneer",
    dreamTitle: "Arctic Climate Research",
    categoryLabel: "Science",
    tokenReward: 480,
    previewText: "Conducting climate research in the Arctic to understand and document the effects of global warming.",
    location: "Norway, Svalbard",
    createdAt: "02/23/2025",
    imageUrl: "https://picsum.photos/seed/arctic31/800/600"
  },
  {
    id: 32,
    backendPostId: 3,
    tab: "pay",
    authorName: "Alex Rivera",
    authorAvatarUrl: "https://picsum.photos/seed/alex32/100/100",
    authorBadgeLabel: "Artist",
    dreamTitle: "Cultural Heritage Preservation",
    categoryLabel: "Art & Culture",
    tokenReward: 460,
    previewText: "Preserving indigenous art forms and traditional crafts for future generations.",
    location: "Peru, Cusco",
    createdAt: "03/02/2025",
    imageUrl: "https://picsum.photos/seed/culture32/800/600"
  },
  {
    id: 33,
    backendPostId: 3,
    tab: "pay",
    authorName: "John Doe",
    authorAvatarUrl: "https://picsum.photos/seed/john33/100/100",
    authorBadgeLabel: "Dreamer",
    dreamTitle: "Northern Lights Adventure",
    categoryLabel: "Travel",
    tokenReward: 440,
    previewText: "Witnessing the magical aurora borealis dancing across the Icelandic sky in a once-in-a-lifetime journey.",
    location: "Iceland, Reykjavik",
    createdAt: "03/09/2025",
    imageUrl: "https://picsum.photos/seed/aurora33/800/600"
  },
  {
    id: 34,
    backendPostId: 3,
    tab: "pay",
    authorName: "David Martinez",
    authorAvatarUrl: "https://picsum.photos/seed/david34/100/100",
    authorBadgeLabel: "Innovator",
    dreamTitle: "Desert Oasis Water System",
    categoryLabel: "Sustainability",
    tokenReward: 420,
    previewText: "Creating sustainable water solutions for communities living in arid desert regions.",
    location: "Morocco, Sahara",
    createdAt: "03/16/2025",
    imageUrl: "https://picsum.photos/seed/desert34/800/600"
  },
  {
    id: 35,
    backendPostId: 3,
    tab: "pay",
    authorName: "Nina Patel",
    authorAvatarUrl: "https://picsum.photos/seed/nina35/100/100",
    authorBadgeLabel: "Educator",
    dreamTitle: "Tech Education for All",
    categoryLabel: "Education",
    tokenReward: 400,
    previewText: "Providing coding education and computer access to underserved communities worldwide.",
    location: "India, Bangalore",
    createdAt: "03/23/2025",
    imageUrl: "https://picsum.photos/seed/tech35/800/600"
  },
  {
    id: 36,
    backendPostId: 3,
    tab: "pay",
    authorName: "Emma Wilson",
    authorAvatarUrl: "https://picsum.photos/seed/emma36/100/100",
    authorBadgeLabel: "Explorer",
    dreamTitle: "Swiss Alps Mountain Climb",
    categoryLabel: "Adventure",
    tokenReward: 380,
    previewText: "Conquering the majestic Matterhorn peak and exploring the breathtaking alpine landscapes of Switzerland.",
    location: "Switzerland, Zermatt",
    createdAt: "03/30/2025",
    imageUrl: "https://picsum.photos/seed/mountain36/800/600"
  },
  {
    id: 37,
    backendPostId: 3,
    tab: "pay",
    authorName: "Lisa Thompson",
    authorAvatarUrl: "https://picsum.photos/seed/lisa37/100/100",
    authorBadgeLabel: "Dreamer",
    dreamTitle: "New York City Skyline",
    categoryLabel: "Travel",
    tokenReward: 360,
    previewText: "Experiencing the iconic Manhattan skyline and visiting the Statue of Liberty in the city that never sleeps.",
    location: "USA, New York",
    createdAt: "04/06/2025",
    imageUrl: "https://picsum.photos/seed/nyc37/800/600"
  },
  {
    id: 38,
    backendPostId: 3,
    tab: "pay",
    authorName: "Carlos Rodriguez",
    authorAvatarUrl: "https://picsum.photos/seed/carlos38/100/100",
    authorBadgeLabel: "Chef",
    dreamTitle: "Barcelona Culinary Journey",
    categoryLabel: "Food",
    tokenReward: 340,
    previewText: "Opening a zero-waste restaurant that uses locally sourced ingredients and eliminates food waste.",
    location: "Spain, Barcelona",
    createdAt: "04/13/2025",
    imageUrl: "https://picsum.photos/seed/barcelona38/800/600"
  },
  {
    id: 39,
    backendPostId: 3,
    tab: "pay",
    authorName: "William Taylor",
    authorAvatarUrl: "https://picsum.photos/seed/william39/100/100",
    authorBadgeLabel: "Architect",
    dreamTitle: "Green Building Innovation",
    categoryLabel: "Technology",
    tokenReward: 320,
    previewText: "Designing and constructing eco-friendly buildings that minimize environmental impact and maximize energy efficiency.",
    location: "Netherlands, Amsterdam",
    createdAt: "04/20/2025",
    imageUrl: "https://picsum.photos/seed/green39/800/600"
  },
  {
    id: 40,
    backendPostId: 3,
    tab: "pay",
    authorName: "Olivia Brown",
    authorAvatarUrl: "https://picsum.photos/seed/olivia40/100/100",
    authorBadgeLabel: "Researcher",
    dreamTitle: "Cancer Research Laboratory",
    categoryLabel: "Science",
    tokenReward: 300,
    previewText: "Establishing a state-of-the-art research facility dedicated to finding new treatments for cancer.",
    location: "Sweden, Stockholm",
    createdAt: "04/27/2025",
    imageUrl: "https://picsum.photos/seed/cancer40/800/600"
  },
  {
    id: 41,
    backendPostId: 3,
    tab: "pay",
    authorName: "James Wilson",
    authorAvatarUrl: "https://picsum.photos/seed/james41/100/100",
    authorBadgeLabel: "CEO",
    dreamTitle: "AI Innovation Hub",
    categoryLabel: "Technology",
    tokenReward: 550,
    previewText: "Creating an innovation hub focused on developing artificial intelligence solutions for global challenges.",
    location: "USA, San Francisco",
    createdAt: "05/04/2025",
    imageUrl: "https://picsum.photos/seed/ai41/800/600"
  },
  {
    id: 42,
    backendPostId: 3,
    tab: "pay",
    authorName: "Sofia Martinez",
    authorAvatarUrl: "https://picsum.photos/seed/sofia42/100/100",
    authorBadgeLabel: "Director",
    dreamTitle: "Film Production Studio",
    categoryLabel: "Art & Culture",
    tokenReward: 530,
    previewText: "Building a film production studio to create documentaries and films that inspire positive change.",
    location: "France, Paris",
    createdAt: "05/11/2025",
    imageUrl: "https://picsum.photos/seed/film42/800/600"
  },
  {
    id: 43,
    backendPostId: 3,
    tab: "pay",
    authorName: "Daniel Kim",
    authorAvatarUrl: "https://picsum.photos/seed/daniel43/100/100",
    authorBadgeLabel: "Engineer",
    dreamTitle: "High-Speed Rail Network",
    categoryLabel: "Technology",
    tokenReward: 510,
    previewText: "Developing a high-speed rail network to connect major cities and reduce carbon emissions from transportation.",
    location: "South Korea, Seoul",
    createdAt: "05/18/2025",
    imageUrl: "https://picsum.photos/seed/rail43/800/600"
  },
  {
    id: 44,
    backendPostId: 3,
    tab: "pay",
    authorName: "Isabella Garcia",
    authorAvatarUrl: "https://picsum.photos/seed/isabella44/100/100",
    authorBadgeLabel: "Biologist",
    dreamTitle: "Marine Biology Research",
    categoryLabel: "Science",
    tokenReward: 490,
    previewText: "Conducting deep-sea research to discover new marine species and understand ocean ecosystems.",
    location: "Chile, Valparaíso",
    createdAt: "05/25/2025",
    imageUrl: "https://picsum.photos/seed/marine44/800/600"
  },
  {
    id: 45,
    backendPostId: 3,
    tab: "pay",
    authorName: "Lucas Silva",
    authorAvatarUrl: "https://picsum.photos/seed/lucas45/100/100",
    authorBadgeLabel: "Developer",
    dreamTitle: "Blockchain Platform",
    categoryLabel: "Technology",
    tokenReward: 470,
    previewText: "Creating a blockchain platform to increase transparency and efficiency in charitable donations.",
    location: "Singapore, Singapore",
    createdAt: "06/01/2025",
    imageUrl: "https://picsum.photos/seed/blockchain45/800/600"
  },
  {
    id: 46,
    backendPostId: 3,
    tab: "pay",
    authorName: "Maya Patel",
    authorAvatarUrl: "https://picsum.photos/seed/maya46/100/100",
    authorBadgeLabel: "Designer",
    dreamTitle: "Sustainable Architecture",
    categoryLabel: "Sustainability",
    tokenReward: 450,
    previewText: "Designing sustainable architectural solutions that integrate nature and technology for better living.",
    location: "UAE, Dubai",
    createdAt: "06/08/2025",
    imageUrl: "https://picsum.photos/seed/arch46/800/600"
  },
  {
    id: 47,
    backendPostId: 3,
    tab: "pay",
    authorName: "Ryan O'Connor",
    authorAvatarUrl: "https://picsum.photos/seed/ryan47/100/100",
    authorBadgeLabel: "Pilot",
    dreamTitle: "Electric Aircraft Development",
    categoryLabel: "Technology",
    tokenReward: 430,
    previewText: "Developing electric aircraft to revolutionize air travel and reduce aviation's carbon footprint.",
    location: "Ireland, Dublin",
    createdAt: "06/15/2025",
    imageUrl: "https://picsum.photos/seed/aircraft47/800/600"
  },
  {
    id: 48,
    backendPostId: 3,
    tab: "pay",
    authorName: "Zara Ali",
    authorAvatarUrl: "https://picsum.photos/seed/zara48/100/100",
    authorBadgeLabel: "Scientist",
    dreamTitle: "Quantum Computing Lab",
    categoryLabel: "Science",
    tokenReward: 410,
    previewText: "Establishing a quantum computing laboratory to advance computational capabilities and solve complex problems.",
    location: "UK, Cambridge",
    createdAt: "06/22/2025",
    imageUrl: "https://picsum.photos/seed/quantum48/800/600"
  },
  // BY TOP - 24 posts (medium token rewards: 200-400)
  {
    id: 49,
    backendPostId: 3,
    tab: "top",
    authorName: "Hiroshi Yamamoto",
    authorAvatarUrl: "https://picsum.photos/seed/hiroshi49/100/100",
    authorBadgeLabel: "Chef",
    dreamTitle: "Tokyo Sushi Masterclass",
    categoryLabel: "Food",
    tokenReward: 400,
    previewText: "Learning the art of traditional sushi making from master chefs in the heart of Tokyo.",
    location: "Japan, Tokyo",
    createdAt: "01/05/2025",
    imageUrl: "https://picsum.photos/seed/sushi49/800/600"
  },
  {
    id: 50,
    backendPostId: 3,
    tab: "top",
    authorName: "Giulia Rossi",
    authorAvatarUrl: "https://picsum.photos/seed/giulia50/100/100",
    authorBadgeLabel: "Artist",
    dreamTitle: "Venice Art Biennale",
    categoryLabel: "Art & Culture",
    tokenReward: 390,
    previewText: "Participating in the prestigious Venice Art Biennale to showcase contemporary art and cultural expression.",
    location: "Italy, Venice",
    createdAt: "01/12/2025",
    imageUrl: "https://picsum.photos/seed/venice50/800/600"
  },
  {
    id: 51,
    backendPostId: 3,
    tab: "top",
    authorName: "Marcus Johnson",
    authorAvatarUrl: "https://picsum.photos/seed/marcus51/100/100",
    authorBadgeLabel: "Athlete",
    dreamTitle: "Olympic Training Facility",
    categoryLabel: "Sports",
    tokenReward: 380,
    previewText: "Building a world-class training facility to prepare athletes for Olympic competition and excellence.",
    location: "USA, Colorado Springs",
    createdAt: "01/19/2025",
    imageUrl: "https://picsum.photos/seed/olympic51/800/600"
  },
  {
    id: 52,
    backendPostId: 3,
    tab: "top",
    authorName: "Elena Volkov",
    authorAvatarUrl: "https://picsum.photos/seed/elena52/100/100",
    authorBadgeLabel: "Musician",
    dreamTitle: "Moscow Philharmonic Concert",
    categoryLabel: "Art & Culture",
    tokenReward: 370,
    previewText: "Performing with the Moscow Philharmonic Orchestra in a once-in-a-lifetime musical experience.",
    location: "Russia, Moscow",
    createdAt: "01/26/2025",
    imageUrl: "https://picsum.photos/seed/philharmonic52/800/600"
  },
  {
    id: 53,
    backendPostId: 3,
    tab: "top",
    authorName: "Ahmed Al-Mansouri",
    authorAvatarUrl: "https://picsum.photos/seed/ahmed53/100/100",
    authorBadgeLabel: "Photographer",
    dreamTitle: "Sahara Desert Photography",
    categoryLabel: "Travel",
    tokenReward: 360,
    previewText: "Capturing the breathtaking beauty of the Sahara Desert through professional photography and storytelling.",
    location: "Morocco, Merzouga",
    createdAt: "02/03/2025",
    imageUrl: "https://picsum.photos/seed/sahara53/800/600"
  },
  {
    id: 54,
    backendPostId: 3,
    tab: "top",
    authorName: "Charlotte Dubois",
    authorAvatarUrl: "https://picsum.photos/seed/charlotte54/100/100",
    authorBadgeLabel: "Writer",
    dreamTitle: "Paris Literary Festival",
    categoryLabel: "Art & Culture",
    tokenReward: 350,
    previewText: "Attending the prestigious Paris Literary Festival to share stories and connect with fellow writers.",
    location: "France, Paris",
    createdAt: "02/10/2025",
    imageUrl: "https://picsum.photos/seed/literary54/800/600"
  },
  {
    id: 55,
    backendPostId: 3,
    tab: "top",
    authorName: "Ravi Kumar",
    authorAvatarUrl: "https://picsum.photos/seed/ravi55/100/100",
    authorBadgeLabel: "Yoga Instructor",
    dreamTitle: "Himalayan Yoga Retreat",
    categoryLabel: "Health",
    tokenReward: 340,
    previewText: "Leading a transformative yoga retreat in the serene mountains of the Himalayas.",
    location: "India, Rishikesh",
    createdAt: "02/17/2025",
    imageUrl: "https://picsum.photos/seed/yoga55/800/600"
  },
  {
    id: 56,
    backendPostId: 3,
    tab: "top",
    authorName: "Samantha Lee",
    authorAvatarUrl: "https://picsum.photos/seed/samantha56/100/100",
    authorBadgeLabel: "Dancer",
    dreamTitle: "Broadway Performance",
    categoryLabel: "Art & Culture",
    tokenReward: 330,
    previewText: "Performing on Broadway in New York City, the pinnacle of theatrical achievement.",
    location: "USA, New York",
    createdAt: "02/24/2025",
    imageUrl: "https://picsum.photos/seed/broadway56/800/600"
  },
  {
    id: 57,
    backendPostId: 3,
    tab: "top",
    authorName: "Fernando Santos",
    authorAvatarUrl: "https://picsum.photos/seed/fernando57/100/100",
    authorBadgeLabel: "Surfer",
    dreamTitle: "Pipeline Masters Competition",
    categoryLabel: "Sports",
    tokenReward: 320,
    previewText: "Competing in the legendary Pipeline Masters surfing competition in Hawaii.",
    location: "USA, Hawaii",
    createdAt: "03/03/2025",
    imageUrl: "https://picsum.photos/seed/pipeline57/800/600"
  },
  {
    id: 58,
    backendPostId: 3,
    tab: "top",
    authorName: "Yuki Nakamura",
    authorAvatarUrl: "https://picsum.photos/seed/yuki58/100/100",
    authorBadgeLabel: "Tea Master",
    dreamTitle: "Kyoto Tea Ceremony",
    categoryLabel: "Art & Culture",
    tokenReward: 310,
    previewText: "Mastering the ancient art of Japanese tea ceremony in the traditional tea houses of Kyoto.",
    location: "Japan, Kyoto",
    createdAt: "03/10/2025",
    imageUrl: "https://picsum.photos/seed/tea58/800/600"
  },
  {
    id: 59,
    backendPostId: 3,
    tab: "top",
    authorName: "Maria Santos",
    authorAvatarUrl: "https://picsum.photos/seed/maria59/100/100",
    authorBadgeLabel: "Flamenco Dancer",
    dreamTitle: "Seville Flamenco Festival",
    categoryLabel: "Art & Culture",
    tokenReward: 300,
    previewText: "Performing at the world-renowned Seville Flamenco Festival, celebrating Spanish culture and dance.",
    location: "Spain, Seville",
    createdAt: "03/17/2025",
    imageUrl: "https://picsum.photos/seed/flamenco59/800/600"
  },
  {
    id: 60,
    backendPostId: 3,
    tab: "top",
    authorName: "James Mitchell",
    authorAvatarUrl: "https://picsum.photos/seed/james60/100/100",
    authorBadgeLabel: "Climber",
    dreamTitle: "Mount Everest Base Camp",
    categoryLabel: "Adventure",
    tokenReward: 290,
    previewText: "Trekking to Mount Everest Base Camp, experiencing the majesty of the world's highest peak.",
    location: "Nepal, Everest Base Camp",
    createdAt: "03/24/2025",
    imageUrl: "https://picsum.photos/seed/everest60/800/600"
  },
  {
    id: 61,
    backendPostId: 3,
    tab: "top",
    authorName: "Sophie Laurent",
    authorAvatarUrl: "https://picsum.photos/seed/sophie61/100/100",
    authorBadgeLabel: "Pastry Chef",
    dreamTitle: "Paris Patisserie Masterclass",
    categoryLabel: "Food",
    tokenReward: 280,
    previewText: "Learning the secrets of French pastry making from master chefs in Parisian patisseries.",
    location: "France, Paris",
    createdAt: "03/31/2025",
    imageUrl: "https://picsum.photos/seed/patisserie61/800/600"
  },
  {
    id: 62,
    backendPostId: 3,
    tab: "top",
    authorName: "Diego Ramirez",
    authorAvatarUrl: "https://picsum.photos/seed/diego62/100/100",
    authorBadgeLabel: "Tango Dancer",
    dreamTitle: "Buenos Aires Tango Show",
    categoryLabel: "Art & Culture",
    tokenReward: 270,
    previewText: "Performing authentic Argentine tango in the birthplace of this passionate dance form.",
    location: "Argentina, Buenos Aires",
    createdAt: "04/07/2025",
    imageUrl: "https://picsum.photos/seed/tango62/800/600"
  },
  {
    id: 63,
    backendPostId: 3,
    tab: "top",
    authorName: "Li Wei",
    authorAvatarUrl: "https://picsum.photos/seed/li63/100/100",
    authorBadgeLabel: "Calligrapher",
    dreamTitle: "Beijing Calligraphy Exhibition",
    categoryLabel: "Art & Culture",
    tokenReward: 260,
    previewText: "Showcasing traditional Chinese calligraphy art in a prestigious exhibition in Beijing.",
    location: "China, Beijing",
    createdAt: "04/14/2025",
    imageUrl: "https://picsum.photos/seed/calligraphy63/800/600"
  },
  {
    id: 64,
    backendPostId: 3,
    tab: "top",
    authorName: "Emma Watson",
    authorAvatarUrl: "https://picsum.photos/seed/emma64/100/100",
    authorBadgeLabel: "Actor",
    dreamTitle: "West End Theatre Debut",
    categoryLabel: "Art & Culture",
    tokenReward: 250,
    previewText: "Making a debut performance on London's prestigious West End theatre stage.",
    location: "UK, London",
    createdAt: "04/21/2025",
    imageUrl: "https://picsum.photos/seed/westend64/800/600"
  },
  {
    id: 65,
    backendPostId: 3,
    tab: "top",
    authorName: "Carlos Mendez",
    authorAvatarUrl: "https://picsum.photos/seed/carlos65/100/100",
    authorBadgeLabel: "Guitarist",
    dreamTitle: "Flamenco Guitar Mastery",
    categoryLabel: "Art & Culture",
    tokenReward: 240,
    previewText: "Mastering the art of flamenco guitar under the guidance of renowned Spanish musicians.",
    location: "Spain, Granada",
    createdAt: "04/28/2025",
    imageUrl: "https://picsum.photos/seed/guitar65/800/600"
  },
  {
    id: 66,
    backendPostId: 3,
    tab: "top",
    authorName: "Aisha Khan",
    authorAvatarUrl: "https://picsum.photos/seed/aisha66/100/100",
    authorBadgeLabel: "Henna Artist",
    dreamTitle: "Traditional Henna Art",
    categoryLabel: "Art & Culture",
    tokenReward: 230,
    previewText: "Learning and practicing the ancient art of henna design from master artists in India.",
    location: "India, Jaipur",
    createdAt: "05/05/2025",
    imageUrl: "https://picsum.photos/seed/henna66/800/600"
  },
  {
    id: 67,
    backendPostId: 3,
    tab: "top",
    authorName: "Thomas Anderson",
    authorAvatarUrl: "https://picsum.photos/seed/thomas67/100/100",
    authorBadgeLabel: "DJ",
    dreamTitle: "Ibiza Music Festival",
    categoryLabel: "Art & Culture",
    tokenReward: 220,
    previewText: "Performing at the world-famous Ibiza music festival, sharing electronic music with thousands.",
    location: "Spain, Ibiza",
    createdAt: "05/12/2025",
    imageUrl: "https://picsum.photos/seed/ibiza67/800/600"
  },
  {
    id: 68,
    backendPostId: 3,
    tab: "top",
    authorName: "Mei Lin",
    authorAvatarUrl: "https://picsum.photos/seed/mei68/100/100",
    authorBadgeLabel: "Chef",
    dreamTitle: "Sichuan Cuisine Mastery",
    categoryLabel: "Food",
    tokenReward: 210,
    previewText: "Mastering the complex flavors and techniques of authentic Sichuan cuisine in Chengdu.",
    location: "China, Chengdu",
    createdAt: "05/19/2025",
    imageUrl: "https://picsum.photos/seed/sichuan68/800/600"
  },
  {
    id: 69,
    backendPostId: 3,
    tab: "top",
    authorName: "Lucas Brown",
    authorAvatarUrl: "https://picsum.photos/seed/lucas69/100/100",
    authorBadgeLabel: "Skier",
    dreamTitle: "Alpine Skiing Championship",
    categoryLabel: "Sports",
    tokenReward: 200,
    previewText: "Competing in the Alpine Skiing World Championship in the stunning Swiss Alps.",
    location: "Switzerland, St. Moritz",
    createdAt: "05/26/2025",
    imageUrl: "https://picsum.photos/seed/skiing69/800/600"
  },
  {
    id: 70,
    backendPostId: 3,
    tab: "top",
    authorName: "Zara Ali",
    authorAvatarUrl: "https://picsum.photos/seed/zara70/100/100",
    authorBadgeLabel: "Belly Dancer",
    dreamTitle: "Cairo Belly Dance Festival",
    categoryLabel: "Art & Culture",
    tokenReward: 390,
    previewText: "Performing traditional belly dance at the vibrant cultural festival in Cairo, Egypt.",
    location: "Egypt, Cairo",
    createdAt: "06/02/2025",
    imageUrl: "https://picsum.photos/seed/belly70/800/600"
  },
  {
    id: 71,
    backendPostId: 3,
    tab: "top",
    authorName: "Ryan O'Connor",
    authorAvatarUrl: "https://picsum.photos/seed/ryan71/100/100",
    authorBadgeLabel: "Photographer",
    dreamTitle: "Northern Lights Photography",
    categoryLabel: "Travel",
    tokenReward: 380,
    previewText: "Capturing the mesmerizing aurora borealis in the pristine wilderness of northern Scandinavia.",
    location: "Norway, Tromsø",
    createdAt: "06/09/2025",
    imageUrl: "https://picsum.photos/seed/aurora71/800/600"
  },
  {
    id: 72,
    backendPostId: 3,
    tab: "top",
    authorName: "Maya Patel",
    authorAvatarUrl: "https://picsum.photos/seed/maya72/100/100",
    authorBadgeLabel: "Bollywood Dancer",
    dreamTitle: "Mumbai Film Industry",
    categoryLabel: "Art & Culture",
    tokenReward: 370,
    previewText: "Performing in a Bollywood film production, bringing vibrant dance and music to the big screen.",
    location: "India, Mumbai",
    createdAt: "06/16/2025",
    imageUrl: "https://picsum.photos/seed/bollywood72/800/600"
  }
]);

// Handlers
const handleOpenFilters = () => {
  console.log("🔍 Filters button clicked! Navigating to filters page...");
  router.push({ name: "donor-filters" });
};

// Format date from MM/DD/YYYY to DD/MM/YYYY
const formatDate = (dateString: string): string => {
  const dateParts = dateString.split("/");
  if (dateParts.length === 3) {
    const [month, day, year] = dateParts;
    return `${day}/${month}/${year}`;
  }
  return dateString;
};

const emitOpenPost = (post: DonorPost) => {
  // Use backendPostId to navigate to existing BE post
  const targetId = post.backendPostId ?? post.id;
  // Pass post data as query params to ensure same values are shown in detail
  router.push({
    name: "donor-post-detail",
    params: { id: targetId },
    query: {
      imageUrl: post.imageUrl,
      tokenReward: post.tokenReward.toString(),
      dreamTitle: post.dreamTitle,
      createdAt: post.createdAt,
      location: post.location,
      authorName: post.authorName,
      authorAvatarUrl: post.authorAvatarUrl
    }
  });
};

const emitOpenAuthor = (post: DonorPost) => {
  console.log("TODO: Open author profile for", post.authorName);
  // router.push({ name: 'donor-author-profile', params: { username: post.authorName } })
};
</script>

<style lang="scss" scoped>
.donorPostsPage {
  padding: 0 16px 80px;
  min-height: 100vh;
}

// TABS
.donor-tabs {
  display: flex;
  gap: 12px;
  margin: 8px 0 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.donor-tabs_button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 12px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &.donor-tabs_button--active {
    color: #ff2c8b;

    &::after {
      content: "";
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 2px;
      background: #ff2c8b;
    }
  }

  &:hover:not(.donor-tabs_button--active) {
    color: rgba(255, 255, 255, 0.8);
  }
}

.donor-tabs_icon {
  width: 16px;
  height: 16px;
  display: block;
}

.donor-tabs_label {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: lowercase;
}

// FILTERS
.donorPosts-filtersWrapper {
    display: flex;
    justify-content: center;
  margin: 18px 0;
}

.donor-filters_button {
  display: flex;
    align-items: center;
  justify-content: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.08);
  border: none;
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  font-weight: 600;
  padding: 10px 32px;
  width: 85%;
  max-width: 300px;
  cursor: pointer;
  transition: background 0.2s ease;
  text-transform: lowercase;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
  }
}

.donor-filters_icon {
  width: 14px;
  height: 14px;
  display: block;
  flex-shrink: 0;
  filter: brightness(0) invert(1); // White color
  opacity: 0.8;
  }

// FEED
.donorPosts-feed {
  display: flex;
  flex-direction: column;
  gap: 18px; // Slightly tighter gap between cards
  padding-bottom: 20px;
}

// POST CARD
.postCard {
  border-radius: 24px; // Matching detail screen radius
  overflow: hidden;
  background: linear-gradient(180deg, #17151f 0%, #0d0b13 100%);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.7);
  }
}

.postCard-imageWrapper {
  position: relative;
  height: 240px;
  overflow: hidden;
  border-radius: 24px 24px 0 0; // Top radius matching detail screen
}

.postCard-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.postCard-authorBadge {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  align-items: center;
  gap: 6px; // Smaller gap
  padding: 4px 10px 4px 4px; // Smaller padding to avoid "chunky" look
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  cursor: pointer;
  transition: background 0.2s ease;
  z-index: 2;

  &:hover {
    background: rgba(0, 0, 0, 0.75);
  }
}

.postCard-authorText {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.postCard-authorName {
  font-size: 0.8rem; // Slightly smaller text
  font-weight: 600;
  color: #fff;
  line-height: 1.2;
}

.postCard-authorBadgeLabel {
  font-size: 0.65rem; // Smaller badge label
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.2;
}

.postCard-titleRow {
  position: absolute;
  bottom: 10px; // Smaller offset from bottom
  left: 12px;
  right: 10px; // Reward pill closer to right edge
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  z-index: 2;
}

.postCard-categoryPill {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 18px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 600;
  line-height: 1.2;
}

.postCard-rewardPill {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  border-radius: 18px;
  background: rgba(255, 44, 139, 0.2); // More pink background
  backdrop-filter: blur(8px);
  color: #ff2c8b;
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1.2;
  border: 1px solid rgba(255, 44, 139, 0.4); // Stronger border
}

.postCard-body {
  padding: 16px;
  padding-bottom: 18px; // Bottom padding 16-20px
  cursor: pointer;
}

.postCard-title {
  margin: 0 0 6px;
  font-size: 1.15rem; // Slightly larger, bold
  font-weight: 700;
  color: #fff;
  line-height: 1.3;
}

.postCard-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 0.72rem; // Fine-tuned font size
  color: rgba(255, 255, 255, 0.55); // Fine-tuned color
}

.postCard-location,
.postCard-date {
  display: flex;
  align-items: center;
  gap: 4px;

  i {
    font-size: 11px;
  }
}

.postCard-preview {
  margin: 0;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
  text-align: left;
  display: -webkit-box;
  -webkit-line-clamp: 3; // Max 3 lines
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
