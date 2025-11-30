<template>
  <div class="post-page">
    <div class="postPage-carouselContainer">
      <q-carousel
        v-model="slide"
        swipeable
        animated
        infinite
        :autoplay="3500"
        :navigation-position="navPos"
        navigation
        navigation-icon="img:/icons/navigation-icon.svg"
        navigation-active-icon="img:/icons/navigationActive-icon.svg"
        class="postPage-carousel"
      >
        <q-carousel-slide
          v-for="(carousel, i) in carousels"
          :key="i"
          :name="carousel.value"
          class="column no-wrap flex-center postPage-singleCarousel"
          :img-src="carousel.img"
        >
          <div class="postPage-carouselTextContainer">
            <span class="carousel-title">{{ carousel.title }}</span>
            <span class="carousel-text">{{ carousel.text }}</span>
          </div>
        </q-carousel-slide>
      </q-carousel>
    </div>
    <div class="postPage-header postPgae-myDreamsContainer">
      <div class="postPage-headerContainer">
        <span class="postPage-title">My Dreams</span>
      </div>
      <PostComponent
        class="postPage-postComponent"
        :post="post"
      ></PostComponent>
    </div>
    <div
      v-for="(category, i) in categories"
      :key="i"
      class="postPage-postsContainer"
    >
      <div class="postPage-header">
        <div class="postPage-headerContainer">
          <span class="postPage-title">{{ category.title }}</span>
        </div>
        <PostComponent
          class="postPage-postComponent"
          :post="post"
        ></PostComponent>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { CarouselPost, Post } from "src/components/models";
import PostComponent from "src/components/doneeComponents/PostComponent.vue";

const slide = ref("1");
const navPos = ref<"top" | "right" | "bottom" | "left" | undefined>("top");

const categories = [
  { title: "Recently Acomplished" },
  { title: "Favourite Dreams" }
];
const carousels = ref([
  {
    value: "1",
    title: "Quote for the day",
    text: "“If you don't dream, you won't die, but even you won't be alive without them.”",
    img: "/icons/carousel-bg.svg"
  },
  {
    value: "2",
    title: "Quote for the day",
    text: "“We cannot solve problems with the kind of thinking we employed when we came up with them.”",
    img: "/icons/carousel-bg.svg"
  },
  {
    value: "3",
    title: "Quote for the day",
    text: "“Learn as if you will live forever, live like you will die tomorrow.”",
    img: "/icons/carousel-bg.svg"
  },
  {
    value: "4",
    title: "Quote for Tomi",
    text: "“I never dreamed about success. I worked for it.”",
    img: "/icons/carousel-bg.svg"
  }
] as CarouselPost[]);

const post = ref([
  {
    goalName: "Aurora Expeditione",
    goalImage: "/images/Auth/goalPicture.png",
    karma: 230000000,
    image: "/images/Auth/postBackground.png"
  },
  {
    goalName: "Aurora Expeditione",
    goalImage: "/images/Auth/goalPicture.png",
    karma: 230000000,
    image: "/images/Auth/postBackground.png"
  },
  {
    goalName: "Aurora Expeditione",
    goalImage: "/images/Auth/goalPicture.png",
    karma: 1213,
    image: "/images/Auth/postBackground.png"
  },
  {
    goalName: "Aurora Expeditione",
    goalImage: "/images/Auth/goalPicture.png",
    karma: 1213,
    image: "/images/Auth/postBackground.png"
  },
  {
    goalName: "Aurora Expeditione",
    goalImage: "/images/Auth/goalPicture.png",
    karma: 42010,
    image: "/images/Auth/postBackground.png"
  }
] as Post[]);
</script>
<style scoped lang="scss">
.post-page {
  .postPage-carouselContainer {
    margin: 1.3rem 0;
    image-rendering: auto;
    .postPage-carousel {
      background-color: rgba(34, 0, 113, 0.174);
      height: 7rem;
      .postPage-singleCarousel {
        background-size: cover;
        background-repeat: no-repeat;
        image-rendering: auto;
        background-position: 0rem 1rem;

        .postPage-carouselTextContainer {
          display: flex;
          flex-direction: column;
          padding-right: 26%;
          .carousel-text {
            color: white;
            font-family: poppinsBold;
            font-size: 0.8rem;
          }
          .carousel-title {
            color: $primary;
            font-family: poppins;
            font-size: 0.7rem;
            margin-bottom: 0.4rem;
          }
        }
      }
    }
  }
  .postPgae-myDreamsContainer {
    margin-bottom: 0.6rem;
  }

  .postPage-header {
    color: white;
    display: flex;
    align-items: center;
    flex-direction: column;
    height: 18rem;
    .postPage-headerContainer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 0 1.2rem;
    }
    .postPage-title {
      font-family: poppinsSemiBold;
      font-size: 1.3125rem;
    }
    .postPage-headerButton {
      font-family: poppins;
      font-weight: 400;
      width: 5.5rem;
      font-size: 1.1rem;
      text-transform: capitalize;
      word-spacing: 0.1rem;
      padding: 0;
    }
  }
}
</style>
<style lang="scss">
.q-carousel__navigation--top {
  top: 0.7rem !important;
  left: 73%;
}
.q-carousel__navigation-inner {
  margin-top: -0.5rem;
  flex: none;

  * {
    font-size: 0.3rem !important;
    height: 0.6rem !important;
    width: 0.6rem;
  }
}
.q-btn:before {
  box-shadow: none;
}
</style>
