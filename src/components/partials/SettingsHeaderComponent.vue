<template>
    <div class="header row" style="
      background-color: #111;
      position: sticky;
      top: 0;
      left: 0;
      z-index: 999;
      height: 4.9rem;
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.3rem 1rem !important;
    ">
        <div class="row" style="">
            <q-btn class="settingsHeader-button"><img src="/icons/arrowIcon.svg" alt="" /></q-btn>
        </div>
        <div class="row">
            <div class="row items-center" style="margin-left: 0.4rem">
                <svg width="49" height="49" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g opacity="0.8">
                        <path
                            d="M31 31L26.65 26.65M29 21C29 25.4183 25.4183 29 21 29C16.5817 29 13 25.4183 13 21C13 16.5817 16.5817 13 21 13C25.4183 13 29 16.5817 29 21Z"
                            stroke="#FAFAFA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </g>
                </svg>
            </div>
            <div class="tokens row">
                <!-- <input readonly type="text" class="displayKarma"/> -->
                <div class="displayKarma">
                    <div class="textWrapper">
                        <img src="/icons/KarmaIcon.png" alt="" class="navbarKarmaIcon" />
                        <span id="karmaValue">{{ formatNumber(props.karma) }}</span>
                    </div>
                    <!-- TODO: zmensenie velkosti pisma ked je vacsia dlzka -->
                    <div class="navbarButtonDiv">
                        <a href="#" style="
                width: 3rem;
                height: 2.2rem;
                display: flex;
                justify-content: center;
                align-items: center;
              "><img src="/images/Auth/tokenButton.png" class="addTokenButton" alt="" /></a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { defineProps } from "vue";
import { formatNumber } from "src/components/partials/FunctionsComponent.vue";
interface Props {
    karma: number;
}
/* eslint-disable */

const props: Props = defineProps({
    karma: {
        type: Number,
        required: true
    }
});
</script>

<style lang="scss" scoped>
.settingsHeader-button {
    margin: 0 0.4rem;
    width: 2.8rem;
    height: 2.8rem;
    border-radius: 2rem;
    background: linear-gradient(90deg,
            rgba(44, 44, 44, 0.832) 10%,
            rgba(67, 66, 66, 0.986) 100%);

}
</style>
// TODO:urobit globalnu funkciu
