<template>
  <div class="notification-Component">
    <img :src="props.notification.user.userPicture" alt="" class="profileImg" />
    <div class="nofication-Content">
      <span class="nofitication-Heading">{{
        notification.type + " - " + notification.user.userName
      }}</span>
      <span class="nofitication-Text">{{ notification.description }}</span>
    </div>
    <a href="#">
      <img src="/icons/arrowRightIcon.svg" alt="" class="arrowRight-icon"
    /></a>
  </div>
</template>
<script setup lang="ts">
import { defineProps, PropType } from "vue";
import { Notification } from "src/components/models";
interface Props {
  notification: Notification;
}

const props: Props = defineProps({
  notification: {
    type: Object as PropType<Notification>,
    required: true
  }
});
</script>
<style scoped lang="scss">
.notification-Component {
  margin-top: 1rem;
  background-color: rgba(66, 65, 65, 0.229);
  color: white;
  display: flex;
  align-items: center;
  padding: 0.8rem;
  height: 6rem;
  border-radius: 0.7rem;

  .nofication-Content {
    line-height: 1rem;
    display: flex;
    justify-content: center;
    align-items: start;
    flex-direction: column;
    padding-bottom: 0.5rem;

    .nofitication-Heading {
      font-family: poppinsSemiBold;
      font-size: 0.9rem;
      margin-bottom: 0.4rem;
    }

    .nofitication-Text {
      font-size: 0.8rem;
      font-family: poppins;
      margin-bottom: -0.7rem;
    }
  }

  .arrowRight-icon {
    margin-top: 0.4rem;
    height: 1.5rem;
  }
}

.profileImg {
  height: 3.2rem;
  width: 3.2rem;
  border-radius: 1.5rem;
  margin-right: 1rem;
}
</style>
