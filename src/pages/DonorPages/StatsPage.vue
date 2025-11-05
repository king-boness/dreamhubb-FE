<template>
  <div class="statsPage">
    <div class="overwiev-stats">
      <div class="overwievTitleDiv">
        <span class="overwievTitle">Overview</span>
      </div>
      <div class="karmaUsed"></div>
      <div v-for="(card, i) in cards" :key="i" class="cardContainer">
        <div class="karmaGainedCard">
          <div class="karmaGainedTitleDiv">
            <span class="karmaGainedTitle">{{ card.overview.title }}</span>
          </div>
          <div class="overwievDonationsDiv">
            <img
              :src="card.overview.comesFromImg"
              alt=""
              class="karmaGainedImgGift"
            />
            <span class="karmaGainedDescription">{{
              card.overview.comesFrom
            }}</span>
          </div>
          <div class="karmaValue">
            <img
              src="/icons/KarmaIcon.png"
              alt=""
              class="karmaGainedImgKarma"
            />
            <span class="karmaGainedKarmaValue">{{
              formatNumber(card.overview.comesFromValue)
            }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="detailed-stats">
      <div class="DetailedStats-div">
        <span class="DetailedStats-Title">Detailed Stats</span>
      </div>
      <div class="usedOnStats">
        <div class="usedOnStats-title"><span>used on</span></div>
        <div class="usedOnStats-categories">
          <div class="usedOn-buttonsDiv">
            <q-btn
              :class="{ 'usedOn-button': true, active: model === 'onDream' }"
              @click="model = 'onDream'"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="12"
                viewBox="0 0 16 12"
                fill="none"
                class="icon"
              >
                <path
                  d="M12.9 4.69341C12.6761 3.55856 12.0651 2.53665 11.1714 1.80225C10.2777 1.06784 9.15674 0.666487 8 0.666748C6.07333 0.666748 4.4 1.76008 3.56667 3.36008C2.58682 3.46597 1.68067 3.93022 1.02233 4.66363C0.363981 5.39704 -0.000114468 6.34787 2.69952e-08 7.33341C2.69952e-08 9.54008 1.79333 11.3334 4 11.3334H12.6667C14.5067 11.3334 16 9.84008 16 8.00008C16 6.24008 14.6333 4.81341 12.9 4.69341Z"
                  fill="#BD0043"
                />
              </svg>
            </q-btn>
            <q-btn
              :class="{ 'usedOn-button': true, active: model === 'onProblem' }"
              @click="model = 'onProblem'"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                class="icon"
              >
                <g clip-path="url(#clip0_491_37483)">
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M0 4C0 2.93913 0.421427 1.92172 1.17157 1.17157C1.92172 0.421427 2.93913 0 4 0L12 0C13.0609 0 14.0783 0.421427 14.8284 1.17157C15.5786 1.92172 16 2.93913 16 4V12C16 13.0609 15.5786 14.0783 14.8284 14.8284C14.0783 15.5786 13.0609 16 12 16H4C2.93913 16 1.92172 15.5786 1.17157 14.8284C0.421427 14.0783 0 13.0609 0 12V4ZM6.996 4.165C6.97456 4.02042 6.98454 3.87291 7.02525 3.73253C7.06597 3.59216 7.13646 3.4622 7.23194 3.35153C7.32741 3.24086 7.44561 3.15206 7.5785 3.0912C7.71139 3.03033 7.85584 2.99883 8.002 2.99883C8.14816 2.99883 8.29261 3.03033 8.4255 3.0912C8.55838 3.15206 8.67659 3.24086 8.77207 3.35153C8.86754 3.4622 8.93803 3.59216 8.97875 3.73253C9.01946 3.87291 9.02944 4.02042 9.008 4.165L8 11L6.996 4.165ZM8 11C8.26522 11 8.51957 11.1054 8.70711 11.2929C8.89464 11.4804 9 11.7348 9 12C9 12.2652 8.89464 12.5196 8.70711 12.7071C8.51957 12.8946 8.26522 13 8 13C7.73478 13 7.48043 12.8946 7.29289 12.7071C7.10536 12.5196 7 12.2652 7 12C7 11.7348 7.10536 11.4804 7.29289 11.2929C7.48043 11.1054 7.73478 11 8 11Z"
                    fill="#BD0043"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_491_37483">
                    <rect width="16" height="16" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </q-btn>
            <q-btn
              :class="{ 'usedOn-button': true, active: model === 'onIdea' }"
              @click="model = 'onIdea'"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 18 16"
                fill="none"
                class="icon icons-left"
              >
                <path
                  d="M11.0001 14.5C11.0001 14.6326 10.9474 14.7598 10.8537 14.8536C10.7599 14.9473 10.6327 15 10.5001 15H5.50011C5.3675 15 5.24032 14.9473 5.14656 14.8536C5.05279 14.7598 5.00011 14.6326 5.00011 14.5C5.00011 14.3674 5.05279 14.2402 5.14656 14.1465C5.24032 14.0527 5.3675 14 5.50011 14H10.5001C10.6327 14 10.7599 14.0527 10.8537 14.1465C10.9474 14.2402 11.0001 14.3674 11.0001 14.5ZM13.5001 6.50001C13.5018 7.33311 13.3135 8.15562 12.9496 8.90505C12.5857 9.65448 12.0558 10.3111 11.4001 10.825C11.2763 10.9185 11.1757 11.0393 11.1063 11.1781C11.0369 11.3169 11.0006 11.4699 11.0001 11.625V12C11.0001 12.2652 10.8948 12.5196 10.7072 12.7071C10.5197 12.8947 10.2653 13 10.0001 13H6.00011C5.73489 13 5.48054 12.8947 5.293 12.7071C5.10547 12.5196 5.00011 12.2652 5.00011 12V11.625C4.99968 11.472 4.96459 11.3211 4.89748 11.1837C4.83036 11.0462 4.73297 10.9257 4.61261 10.8313C3.95828 10.3209 3.42822 9.66878 3.06231 8.92398C2.69641 8.17917 2.50418 7.36108 2.50011 6.53126C2.48136 3.55001 4.89386 1.06876 7.86886 1.00001C8.60232 0.981648 9.33203 1.11039 10.0149 1.37863C10.6978 1.64688 11.3201 2.0492 11.845 2.56184C12.3698 3.07449 12.7867 3.68708 13.071 4.36346C13.3553 5.03985 13.5012 5.76632 13.5001 6.50001ZM10.3564 6.64376C10.2616 6.54987 10.1335 6.4972 10.0001 6.4972C9.86668 6.4972 9.73866 6.54987 9.64386 6.64376L8.00011 8.29376L6.35636 6.64376C6.25921 6.56403 6.13588 6.52328 6.01035 6.52945C5.88483 6.53561 5.76608 6.58825 5.67721 6.67712C5.58835 6.76599 5.53571 6.88473 5.52955 7.01026C5.52338 7.13578 5.56413 7.25911 5.64386 7.35626L7.50011 9.20626V11.5C7.50011 11.6326 7.55279 11.7598 7.64656 11.8536C7.74032 11.9473 7.8675 12 8.00011 12C8.13272 12 8.25989 11.9473 8.35366 11.8536C8.44743 11.7598 8.50011 11.6326 8.50011 11.5V9.20626L10.3564 7.35626C10.4502 7.26147 10.5029 7.13344 10.5029 7.00001C10.5029 6.86659 10.4502 6.73856 10.3564 6.64376Z"
                  fill="#BD0043"
                />
              </svg>
            </q-btn>
          </div>
        </div>
        <div class="usedOnStats-value">
          <img src="/icons/KarmaIcon.png" alt="" />
          <span>{{ formatNumber(stats.usedKarma?.[model]) }}</span>
        </div>
      </div>
      <div class="usedOnStats-categoryContainer">
        <span class="usedOnStats-categoryTitle"
          >Category specific spending</span
        >
        <div class="usedOnStats-spendingContainer">
          <q-select
            v-model="selectedCategory"
            :options="options"
            behavior="menu"
            borderless
            class="registerDatas usedOnStats-spendingSelect"
          >
            <template v-slot:selected-item="scope">
              <q-icon
                :name="`img:${scope.opt.icon}`"
                class="usedOnStats-spendingIcon"
              />
              <span class="usedOnStats-spendingText"
                >{{ scope.opt.label }}
              </span>
            </template>

            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-icon
                    class="usedOnStats-dropdownSpendingIcon"
                    :name="`img:${scope.opt.icon}`"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="usedOnStats-dropdownSpendingText">{{
                    scope.opt.label
                  }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
          <div class="usedOnStats-value usedOnStats-spendingValue">
            <img src="/icons/KarmaIcon.png" alt="" />
            <span>{{ formatNumber(selectedCategory.tokens) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { Stats, specificSpending } from "src/components/models";
import { formatNumber } from "src/components/partials/FunctionsComponent.vue";

const model = ref("onDream");
const selectedCategory = ref({
  label: "Events",
  value: "Events",
  icon: "/icons/events-icon.svg",
  tokens: 10
});
const options = ref([
  {
    label: "Events",
    value: "Events",
    icon: "/icons/events-icon.svg",
    tokens: 10
  },
  {
    label: "Health",
    value: "Health",
    icon: "/icons/health-icon.svg",
    tokens: 400
  },
  {
    label: "Learning",
    value: "Learning",
    icon: "/icons/learning-icon.svg",
    tokens: 10
  },
  {
    label: "Possesions",
    value: "Possesions",
    icon: "/icons/possesion-icon.svg",
    tokens: 1200
  },
  {
    label: "Proffesion",
    value: "Proffesion",
    icon: "/icons/proffesion-icon.svg",
    tokens: 10
  },
  {
    label: "Relationships",
    value: "Relationships",
    icon: "/icons/relationship-icon.svg",
    tokens: 10
  },
  {
    label: "The Other",
    value: "Other",
    icon: "/icons/others-icon.svg",
    tokens: 10
  },
  {
    label: "Travelling",
    value: "Travelling",
    icon: "/icons/travelling-icon.svg",
    tokens: 2000
  }
] as specificSpending[]);

const stats = ref({
  usedKarma: {
    onDream: 543,
    onProblem: 5234,
    onIdea: 153,
    onDonation: 2345
  }
} as Stats);
const cards = ref([
  {
    overview: {
      title: "Gained From",
      comesFrom: "Donations",
      comesFromImg: "/icons/giftIcon-red.svg",
      comesFromValue: 145
    }
  },
  {
    overview: {
      title: "Gained From",
      comesFrom: "Donations",
      comesFromImg: "/icons/giftIcon-red.svg",
      comesFromValue: 145
    }
  },
  {
    overview: {
      title: "karma remaining",
      comesFromValue: 2400
    }
  }
] as Stats[]);
</script>
<style scoped lang="scss">
.usedOnStats-spendingContainer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 1rem;
}
.usedOnStats-spendingValue {
  display: flex;
  align-items: center;
  background-color: rgba(189, 0, 67, 0.1);
  height: 2.5rem;
  width: auto;
  border-radius: 0.6rem;
  padding: 0.3rem 0.6rem;
  img {
    height: 1.2rem;
  }

  span {
    color: $primary;
    font-family: poppinsBold;
    margin-left: 0.1rem;
    font-size: 1rem;
  }
}
.usedOnStats-categoryContainer {
  color: white;
  display: flex;
  justify-content: center;
  align-items: start;
  flex-direction: column;
  font-family: poppins;
  font-weight: 600;
  margin-top: 2rem;
}
.usedOnStats-spendingSelect {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1rem 0;
  margin-left: -0.2rem;
  width: 15rem;
}
.usedOnStats-spendingIcon {
  margin-right: 0.5rem;
  scale: 1.3;
}
.usedOnStats-spendingText {
  font-family: poppins;
}
.usedOnStats-dropdownSpendingText {
  @extend .usedOnStats-spendingText;
  margin-left: -1.5rem;
}
.usedOnStats-dropdownSpendingIcon {
  scale: 0.8;
}
.cardContainer {
  width: 100%;
}
.usedOn-buttonsDiv {
  display: flex;
  gap: 0.5rem;
  justify-content: start;
  margin-right: 1.1rem;
  .usedOn-button {
    border: 0.1rem solid $primary;
    border-radius: 0.6rem;
    height: 2.9rem;
    width: 2.9rem;

    .icon {
      scale: 1.7;
    }
    .icons-left {
      margin-left: 0.1rem;
      scale: 2;
    }
  }
}
.usedOn-button.active {
  background-color: $primary;
  svg {
    * {
      fill: white;
      opacity: 1 !important;
    }
  }
}
.statsPage {
  padding-top: 1rem;
}
.overwiev-stats {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  padding: 0 1rem;

  .overwievTitleDiv {
    display: flex;
    justify-content: start;
    width: 100%;
    margin-bottom: 0.8rem;

    .overwievTitle {
      color: white;
      font-family: poppinsSemiBold;
      font-size: 1rem;
    }
  }

  .karmaGainedCard {
    background: linear-gradient(
      108.46deg,
      rgba(37, 37, 37, 0.405) 0%,
      rgba(23, 23, 23, 0.33) 100%
    );
    // background-color: pink;
    height: 3.6rem;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1rem;
    margin-bottom: 0.5rem;
    border-radius: 0.8rem;

    .karmaGainedTitleDiv {
      width: 0.8rem;
      display: flex;

      .karmaGainedTitle {
        color: white;
        font-size: 0.7rem;
        font-family: poppins;
        line-height: 0.9rem;
        text-transform: Uppercase;
      }
    }

    .overwievDonationsDiv {
      margin-left: 4.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      position: fixed;

      .karmaGainedImgGift {
        height: 1.7rem;
        margin-right: 0.5rem;
        margin-bottom: 0.2rem;
      }

      .karmaGainedDescription {
        color: white;
        font-family: poppins;
        font-size: 0.9rem;
      }
    }

    .karmaValue {
      display: flex;
      align-items: center;
      background-color: rgba(189, 0, 67, 0.1);
      height: 2.5rem;
      width: auto;
      border-radius: 0.6rem;
      padding: 0.3rem 0.6rem;

      .karmaGainedImgKarma {
        height: 1.2rem;
      }

      .karmaGainedKarmaValue {
        color: $primary;
        font-family: poppinsBold;
        margin-left: 0.1rem;
        font-size: 1rem;
      }
    }
  }
}

.detailed-stats {
  justify-content: center;
  flex-direction: column;
  align-items: center;
  padding: 0 1rem;

  .usedOnStats {
    background: linear-gradient(
      108.46deg,
      rgba(37, 37, 37, 0.525) 0%,
      rgba(23, 23, 23, 0.33) 100%
    );
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0rem 1rem;
    margin: 0 auto;
    border-radius: 0.8rem;
    width: 100%;
    height: 3.8rem;

    .usedOnStats-title {
      color: white;
      font-size: 0.7rem;
      font-family: poppins;
      line-height: 0.9rem;
      text-transform: Uppercase;
      width: 0.8rem;
    }
    .usedOnStats-categories {
      position: fixed;
      margin-left: 2.8rem;
    }
    .usedOnStats-value {
      display: flex;
      align-items: center;
      background-color: rgba(189, 0, 67, 0.1);
      height: 2.5rem;
      width: auto;
      border-radius: 0.6rem;
      padding: 0.3rem 0.6rem;

      img {
        height: 1.2rem;
      }

      span {
        color: $primary;
        font-family: poppinsBold;
        margin-left: 0.1rem;
        font-size: 1rem;
      }
    }
  }
}
</style>
