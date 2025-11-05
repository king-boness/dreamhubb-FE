<template>
  <div class="notification-Page q-pa-sm">
    <div class="notifications-Header">
      <h2 class="notifications-Heading">Notifications</h2>
    </div>
    <q-pull-to-refresh @refresh="refresh">
      <div
        v-for="(notification, i) in notifications"
        :key="i"
        class="row justify-center"
      >
        <NotificationComponent :notification="notification" />
      </div>
    </q-pull-to-refresh>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { Notification } from "src/components/models";
import NotificationComponent from "src/components/partials/NotificationComponent.vue";
const refresh = (done: any) => {
  setTimeout(() => {
    done();
  }, 1000);
};
const notifications = ref([
  {
    user: {
      userName: "Kate Doe",
      userPicture: "/images/Auth/profilePicture.jpeg"
    },
    description:
      "Sit amet, consectetur adipisicing elit, sed do eiusmod tempor incidid...",
    goalName: "Aurora Expedition",
    type: "New Comment"
  },
  {
    user: {
      userName: "Kate Doe",
      userPicture: "/images/Auth/profilePicture.jpeg"
    },
    description:
      "Sit amet, consectetur adipisicing elit, sed do eiusmod tempor incidid...",
    goalName: "Aurora Expedition",
    type: "New Comment"
  },
  {
    user: {
      userName: "Kate Doe",
      userPicture: "/images/Auth/profilePicture.jpeg"
    },
    description:
      "Sit amet, consectetur adipisicing elit, sed do eiusmod tempor incidid...",
    goalName: "Aurora Expedition",
    type: "New Comment"
  },
  {
    user: {
      userName: "Kate Doe",
      userPicture: "/images/Auth/profilePicture.jpeg"
    },
    description:
      "Sit amet, consectetur adipisicing elit, sed do eiusmod tempor incidid...",
    goalName: "Aurora Expedition",
    type: "New Comment"
  },
  {
    user: {
      userName: "Kate Doe",
      userPicture: "/images/Auth/profilePicture.jpeg"
    },
    description:
      "Sit amet, consectetur adipisicing elit, sed do eiusmod tempor incidid...",
    goalName: "Aurora Expedition",
    type: "New Comment"
  },
  {
    user: {
      userName: "Kate Doe",
      userPicture: "/images/Auth/profilePicture.jpeg"
    },
    description:
      "Sit amet, consectetur adipisicing elit, sed do eiusmod tempor incidid...",
    goalName: "Aurora Expedition",
    type: "New Comment"
  },
  {
    user: {
      userName: "Kate Doe",
      userPicture: "/images/Auth/profilePicture.jpeg"
    },
    description:
      "Sit amet, consectetur adipisicing elit, sed do eiusmod tempor incidid...",
    goalName: "Aurora Expedition",
    type: "New Comment"
  },
  {
    user: {
      userName: "Kate Doe",
      userPicture: "/images/Auth/profilePicture.jpeg"
    },
    description:
      "Sit amet, consectetur adipisicing elit, sed do eiusmod tempor incidid...",
    goalName: "Aurora Expedition",
    type: "New Comment"
  }
] as Notification[]);
</script>
<style scoped lang="scss">
.notification-Page {
  background-position: center;
  .notifications-Header {
    display: flex;
    justify-content: center;
    width: 47%;
  }

  .notifications-Heading {
    color: white;
    font-size: 1.7rem;
    font-family: poppinsSemiBold;
    margin: 0;

    margin-bottom: -1rem;
  }
}
</style>
