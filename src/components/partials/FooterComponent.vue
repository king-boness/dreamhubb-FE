<template>
  <div
    class="footer row col-12"
    :class="{ 'iphoneDevice-footer': $q.platform.is.ios }"
  >
    <q-btn
      :ripple="false"
      @click="$router.push({ name: 'donor-posts' })"
      class="button-footer"
      :class="{ active: $route.name === 'donor-posts' }"
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="footer-marginClass"
      >
        <g opacity="0.4">
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M23.5588 8.50798L17.2752 3.31253C15.1585 1.56249 12.1749 1.56249 10.0582 3.31253L3.77447 8.50798C2.64236 9.44402 2 10.8632 2 12.344V20.4461C2 23.077 4.02318 25.3333 6.66667 25.3333H9C10.2887 25.3333 11.3333 24.2887 11.3333 23V19.2058C11.3333 17.727 12.4441 16.6518 13.6667 16.6518C14.8892 16.6518 16 17.727 16 19.2058V23C16 24.2887 17.0446 25.3333 18.3333 25.3333H20.6667C23.3102 25.3333 25.3333 23.077 25.3333 20.4461V12.344C25.3333 10.8632 24.691 9.44402 23.5588 8.50798Z"
            fill="#FCFCFC"
          />
        </g>
      </svg>
      <span class="footer-pageName footer-marginClass">Home</span>
    </q-btn>
    <q-btn
      :ripple="false"
      @click="$router.push({ name: 'donor-inspirations' })"
      class="button-footer"
      :class="{ active: $route.name === 'donor-inspirations' }"
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="exploreIcon footer-marginClass"
      >
        <path
          d="M7.595 21.105L16.345 17.01C16.485 16.94 16.6133 16.8467 16.73 16.73C16.8467 16.6133 16.94 16.485 17.01 16.345L21.105 7.595C21.1983 7.385 21.1577 7.19227 20.9832 7.0168C20.8077 6.84227 20.615 6.80167 20.405 6.895L11.655 10.99C11.515 11.06 11.3867 11.1533 11.27 11.27C11.1533 11.3867 11.06 11.515 10.99 11.655L6.895 20.405C6.80167 20.615 6.84273 20.8077 7.0182 20.9832C7.19273 21.1577 7.385 21.1983 7.595 21.105V21.105ZM14 15.4C13.6033 15.4 13.2711 15.2656 13.0032 14.9968C12.7344 14.7289 12.6 14.3967 12.6 14C12.6 13.6033 12.7344 13.2706 13.0032 13.0018C13.2711 12.7339 13.6033 12.6 14 12.6C14.3967 12.6 14.7294 12.7339 14.9982 13.0018C15.2661 13.2706 15.4 13.6033 15.4 14C15.4 14.3967 15.2661 14.7289 14.9982 14.9968C14.7294 15.2656 14.3967 15.4 14 15.4ZM14 28C12.0633 28 10.2433 27.6323 8.54 26.8968C6.83667 26.1623 5.355 25.165 4.095 23.905C2.835 22.645 1.83773 21.1633 1.1032 19.46C0.367733 17.7567 0 15.9367 0 14C0 12.0633 0.367733 10.2433 1.1032 8.54C1.83773 6.83667 2.835 5.355 4.095 4.095C5.355 2.835 6.83667 1.83727 8.54 1.1018C10.2433 0.367267 12.0633 0 14 0C15.9367 0 17.7567 0.367267 19.46 1.1018C21.1633 1.83727 22.645 2.835 23.905 4.095C25.165 5.355 26.1623 6.83667 26.8968 8.54C27.6323 10.2433 28 12.0633 28 14C28 15.9367 27.6323 17.7567 26.8968 19.46C26.1623 21.1633 25.165 22.645 23.905 23.905C22.645 25.165 21.1633 26.1623 19.46 26.8968C17.7567 27.6323 15.9367 28 14 28Z"
          fill="#FCFCFC"
        />
      </svg>
      <span class="footer-pageName footer-marginClass">Inspirations</span>
    </q-btn>
    <q-btn
      :ripple="false"
      @click="$router.push({ name: 'donor-notifications' })"
      class="button-footer red"
      :class="{ active: $route.name === 'donor-notifications' }"
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="footer-marginClass notificationIcon"
      >
        <g clip-path="url(#clip0_1612_3909)">
          <path
            opacity="0.4"
            d="M15.5172 23.7747H11.0932C10.8725 23.7747 10.721 23.9961 10.7947 24.2064C11.161 25.2515 12.1462 26.0001 13.3051 26.0001C14.464 26.0001 15.4492 25.2515 15.8155 24.2064C15.8892 23.9961 15.7377 23.7747 15.5172 23.7747Z"
            fill="#FCFCFC"
          />
          <path
            opacity="0.4"
            d="M22.6868 19.4307C21.9654 18.17 21.5856 16.7394 21.5856 15.2828V12.5052C21.5856 11.811 21.5012 11.1369 21.3433 10.4921C21.2595 10.1495 20.9554 9.91669 20.6064 9.9172H20.6007C18.1588 9.9172 16.1721 7.9079 16.1721 5.43821C16.1721 5.37212 16.1736 5.30637 16.1766 5.24097C16.1925 4.88803 15.9748 4.57149 15.6396 4.47124C15.463 4.41837 15.2839 4.3715 15.1024 4.33082V4.13444C15.1024 3.13383 14.3284 2.27552 13.3393 2.25715C12.3314 2.23844 11.5087 3.05915 11.5087 4.07419V4.33099C7.80003 5.16132 5.0252 8.5046 5.0252 12.5053V15.2833C5.0252 16.7397 4.64542 18.1703 3.92408 19.4309L3.25186 20.6057C2.60351 21.5675 3.28455 22.871 4.43564 22.871H22.1754C23.3265 22.871 24.0075 21.5675 23.3591 20.6057L22.6869 19.4309L22.6868 19.4307Z"
            fill="#FCFCFC"
          />
          <path
            d="M20.6007 8.87625C22.4752 8.87625 24.0002 7.33404 24.0002 5.43804C24.0002 3.54204 22.4752 2 20.6007 2C18.7262 2 17.2012 3.54221 17.2012 5.43821C17.2012 7.33421 18.7262 8.87642 20.6007 8.87642V8.87625ZM19.4354 3.9966C19.9414 3.88656 20.3255 3.66014 20.588 3.3175H21.2044V7.55857H20.1579V5.28492C20.1579 4.9567 20.1502 4.75929 20.1346 4.69285C20.119 4.62659 20.0763 4.5763 20.0064 4.54231C19.9364 4.50832 19.7806 4.49115 19.539 4.49115H19.4354V3.99677V3.9966Z"
            fill="#BD0043"
            class="newNotification"
          />
        </g>
        <defs>
          <clipPath id="clip0_1612_3909">
            <rect
              width="21"
              height="24"
              fill="white"
              transform="translate(3 2)"
            />
          </clipPath>
        </defs>
      </svg>
      <span class="footer-pageName">Notifications</span>
    </q-btn>

    <q-btn
      :ripple="false"
      @click="$router.push({ name: 'donor-myprofile' })"
      class="button-footer profileIcon"
      :class="{
        activeProfile:
          $route.name == 'donor-myprofile' || $route.name == 'donor-settings'
      }"
    >
      <img :src="props.userPicture" class="profileImg" alt="" />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        class="wheelIcon"
      >
        <mask
          id="mask0_2076_971"
          style="mask-type: luminance"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="16"
          height="16"
        >
          <path
            d="M5.99963 14.4574C4.8418 14.1117 3.79319 13.4722 2.95589 12.6009C3.22529 12.2814 3.39323 11.8888 3.43821 11.4733C3.4832 11.0578 3.40318 10.6383 3.20841 10.2685C3.01364 9.89874 2.71296 9.59549 2.34486 9.39756C1.97677 9.19964 1.55798 9.11605 1.14211 9.15748C1.04736 8.6934 0.999753 8.22092 1 7.74727C1 7.01573 1.11201 6.3101 1.32062 5.64717H1.35002C1.70695 5.64728 2.05802 5.55642 2.37008 5.38317C2.68214 5.20991 2.9449 4.95998 3.13354 4.65697C3.32217 4.35396 3.43047 4.00787 3.4482 3.65138C3.46593 3.29488 3.3925 2.93976 3.23486 2.61953C4.0555 1.85538 5.04796 1.2999 6.12844 1C6.30428 1.34526 6.57221 1.63514 6.90257 1.83757C7.23294 2.04001 7.61287 2.1471 8.00033 2.147C8.38778 2.1471 8.76771 2.04001 9.09808 1.83757C9.42845 1.63514 9.69637 1.34526 9.87222 1C10.9527 1.2999 11.9452 1.85538 12.7658 2.61953C12.607 2.942 12.5336 3.29983 12.5527 3.65878C12.5718 4.01772 12.6827 4.36576 12.8748 4.66958C13.0669 4.9734 13.3337 5.22283 13.6498 5.394C13.9659 5.56516 14.3206 5.65233 14.68 5.64717C14.8932 6.3268 15.0013 7.03499 15.0007 7.74727C15.0007 8.23029 14.9517 8.70211 14.8585 9.15783C14.4427 9.1164 14.0239 9.19999 13.6558 9.39791C13.2877 9.59584 12.987 9.89909 12.7922 10.2689C12.5975 10.6386 12.5175 11.0581 12.5624 11.4736C12.6074 11.8891 12.7754 12.2818 13.0448 12.6013C12.2074 13.4724 11.1588 14.1118 10.001 14.4574C9.86506 14.0337 9.59805 13.664 9.23849 13.4018C8.87892 13.1395 8.44537 12.9982 8.00033 12.9982C7.55528 12.9982 7.12173 13.1395 6.76217 13.4018C6.4026 13.664 6.1356 14.0337 5.99963 14.4574Z"
            fill="white"
            stroke="white"
            stroke-width="1.33333"
            stroke-linejoin="round"
          />
          <path
            d="M8.00065 10.1976C8.32241 10.1976 8.64101 10.1342 8.93827 10.0111C9.23553 9.88796 9.50563 9.70748 9.73314 9.47997C9.96066 9.25246 10.1411 8.98236 10.2643 8.6851C10.3874 8.38783 10.4508 8.06923 10.4508 7.74748C10.4508 7.42572 10.3874 7.10712 10.2643 6.80986C10.1411 6.5126 9.96066 6.2425 9.73314 6.01499C9.50563 5.78747 9.23553 5.607 8.93827 5.48387C8.64101 5.36074 8.32241 5.29736 8.00065 5.29736C7.35084 5.29736 6.72764 5.5555 6.26816 6.01499C5.80867 6.47447 5.55054 7.09767 5.55054 7.74748C5.55054 8.39729 5.80867 9.02048 6.26816 9.47997C6.72764 9.93946 7.35084 10.1976 8.00065 10.1976Z"
            fill="black"
            stroke="black"
            stroke-width="1.33333"
            stroke-linejoin="round"
          />
        </mask>
        <g mask="url(#mask0_2076_971)">
          <path
            opacity="0.4"
            d="M-1 -0.000488281H15.8008V16.8003H-1V-0.000488281Z"
            fill="#FCFCFC"
          />
        </g>
      </svg>
      <span class="footer-pageName profileName">Profile</span>
    </q-btn>
  </div>
</template>
<script setup lang="ts">
import { defineProps } from "vue";

interface Props {
  userPicture: string;
}

const props: Props = defineProps({
  userPicture: {
    type: String,
    required: true
  }
});
</script>
<style lang="scss" scoped>
.body--light {
  .wheelIcon {
    * {
      z-index: 111;
    }
  }
  .active {
    transition: none !important;
    * {
      fill: #bd0043 !important;
      opacity: 1 !important;
    }
  }
  .footer-marginClass *:not(.newNotification) {
    fill: black;
  }
}
.footer {
  background-image: none;
  background-image: url("/images/Auth/bg-explain.png") !important;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}
.notificationIcon {
  height: 1.7rem !important;
  margin-top: -0.1rem;
}
.footer-marginClass {
  height: 1.6rem;
}
.active {
  transition: none !important;
  * {
    fill: #bd0043;
    opacity: 1 !important;
  }
}
.activeProfile {
  .profileImg {
    border: 0.16rem solid #bd0043 !important;
  }
}
.footer-pageName {
  color: white;
  font-size: 0.7rem;
  font-family: poppins;
  margin-bottom: -0.4rem;
  text-transform: capitalize;
}
.profileName {
  margin-bottom: 0.01rem;
}
</style>
