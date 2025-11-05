<template>
  <div class="myStoryComponent">
    <!-- Stories View -->
    <MyStorySliderComponent
      @clicked="(index) => storyClicked(index)"
      :stories="stories"
    ></MyStorySliderComponent>
    <div
      class="overlay"
      v-show="showSlider"
      :class="{ iphoneDevice: $q.platform.is.ios }"
    >
      <div class="stories_wrapper">
        <stories
          :autoplay="false"
          :duration="duration"
          ref="storiesComponent"
          :stories="stories"
        >
          <template v-slot:slide="{ story }">
            <div class="close-slide">
              <div class="icon-background" @click="stopStory()">
                <img src="/icons/closeIcon.svg" alt="" />
              </div>
            </div>
            <div class="story-uploadStoryContainer slide" @click="prevSlide">
              <UploadPostImgComponent
                ref="uploadPostImgComponent"
                @images-updated="handleImagesFromChild"
                :max="1"
              ></UploadPostImgComponent>
              <div class="bottom-bar uploadStoryBar">
                <div class="user">
                  <img
                    :src="story.userProfileImage"
                    alt=""
                    class="profile-image"
                  />
                  <div class="name">
                    {{ story.label }}
                  </div>
                </div>
                <div class="story-icons publishButton">
                  <q-btn>Publish</q-btn>
                </div>
              </div>
            </div>
          </template>
        </stories>
      </div>
    </div>
    <!-- /.overlay -->
  </div>
</template>
<script>
import Stories from "vue3-insta-stories";
import { ref } from "vue";
import UploadPostImgComponent from "./UploadPostImgComponent.vue";
import MyStorySliderComponent from "./MyStorySliderComponent.vue";

export default {
  components: { Stories, UploadPostImgComponent, MyStorySliderComponent },
  props: {
    stories: {
      type: Array,
      required: true
    }
  },
  emits: ["seen"],
  setup() {
    const storiesComponent = ref(null);
    const uploadedImages = ref([]);

    return {
      storiesComponent,
      uploadedImages
    };
  },
  data() {
    return {
      showSlider: false,
      duration: 5000
    };
  },
  methods: {
    // Actions
    handleImagesFromChild(imgs) {
      this.uploadedImages = imgs;
    },
    async storyClicked(index) {
      if (process.env.NODE_ENV === "development") {
        console.log(index);
      }
      this.storiesComponent.recalculateDimensions();
      setTimeout(() => {
        this.showSlider = true;
      }, 200);
      this.storiesComponent.playStory(index);
    },
    recalculateDimensions() {
      this.storiesComponent.recalculateDimensions();
    },
    stopStory() {
      if (this.uploadedImages.length !== 0) {
        this.$refs.uploadPostImgComponent.deleteImg();
      } else {
        this.storiesComponent.stopStory();
        this.showSlider = false;
      }
    },
    resetStory() {
      this.storiesComponent.resetStory();
    },
    playStory() {
      this.storiesComponent.playStory();
    },
    prevStory() {
      this.storiesComponent.prevStory();
    },
    nextStory() {
      this.storiesComponent.nextStory();
    },
    prevSlide() {
      this.storiesComponent.prevSlide();
    },
    nextSlide() {
      this.storiesComponent.nextSlide();
    },
    // Events
    // @ended="endedEvent"
    // @next_story="nextStoryEvent"
    // @prev_story="prevStoryEvent"
    // @prev_slide="prevSlideEvent"
    // @next_slide="nextSlideEvent"
    // @slide_changed="slideChangedEvent"
    // @swipe_up="swipe_up"
    // @swipe_down="swipe_down"
    // @swipe_left="swipe_left"
    // @swipe_right="swipe_right"
    endedEvent() {
      this.stopStory();
      this.showSlider = false;
    },
    nextStoryEvent(index) {
      this.$emit("seen", index);
    },
    swipe_left() {
      this.storiesComponent.nextStory();
    },
    swipe_right() {
      this.storiesComponent.prevStory();
    },
    swipe_down() {
      this.stopStory();
      this.showSlider = false;
    }
  }
};
</script>

<style lang="scss">
.myStoryComponent {
  padding: 0.8rem 0;
  padding-bottom: 0.5rem;
  display: flex;
  align-items: center;
  .container {
    background-color: rgb(82, 82, 82);
    background: rgb(82, 82, 82) !important;
    height: 38rem !important;
    .uploadedImgDiv {
      img {
        height: 38rem !important;
      }
    }
    * {
      object-fit: cover !important;
    }
  }
  .publishButton {
    background-color: black;
    border-radius: 0.5rem;
    width: 8rem;
    height: 2.5rem;
    span {
      font-family: poppins;
    }
  }
}
.close-slide {
  margin-top: 1rem;
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 111;
}
.icon-background {
  width: 40px;
  height: 40px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(255, 255, 255);
  background: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.2) 20%,
    rgba(255, 255, 255, 0.6) 120%
  );
  font-size: 20px;
  border-radius: 100%;
  cursor: pointer;
}
.story-icons {
  width: 25vw;
  display: flex;
  align-items: center;
  justify-content: center;
}
.overlay {
  position: fixed;
  height: 100%;
  z-index: 9999;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgb(82, 82, 82);
  margin-bottom: 0.5rem;

  .stories_wrapper {
    width: 100%;
    height: 100%;
    .slide {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      background-repeat: no-repeat !important;
      background-size: contain !important;
      background-position: center !important;
    }
  }
}
.slice {
  background-color: rgba(0, 0, 0, 0.5) !important;
}
.slice,
.progress {
  border-radius: 20px !important;
}
.bottom-bar {
  display: flex;
  align-items: center;
  bottom: 0px;
  position: absolute;
  right: 0;
  left: 0;
  justify-content: space-between;
  margin-bottom: 27px;
  padding: 0 20px;
}
.user {
  padding: 2px 2px;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  background-color: black;
  color: white;
  border-radius: 50px;
  .name {
    margin: 0 10px;
    font-size: 0.9rem;
    font-family: poppins;
  }
  .profile-image {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    padding: 0;
    margin: 0;
    box-sizing: content-box;
  }
}
</style>
