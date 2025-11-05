<template>
  <div class="earn-page"></div>
  <div class="verifyContent-earn">
    <div class="verifyContent-left">
      <span class="verifyContent-heading">Here's Your Free Tokens </span>
      <span class="verifyContent-description"
        >As a new user, we are giving you some Karma tokens for verification of
        your account.</span
      >
      <q-btn class="verifyContent-button">
        Verify and claim 150
        <img src="/icons/WhiteKarmaIcon.svg" alt="" />
      </q-btn>
    </div>
    <div class="verifyContentRight">
      <img
        src="/images/Auth/Hand-tokens.svg"
        alt=""
        class="verifyContent-img"
      />
    </div>
  </div>
  <div class="onGoingTasks">
    <div class="onGoingTasks-header">
      <span class="onGoingTasks-heading">Ongoing Tasks</span>
      <a href="#" class="helpButton">
        <img src="/icons/helpIcon.svg" alt=""
      /></a>
    </div>
    <div class="task-earn" v-for="(onGoingTask, i) in onGoingTasks" :key="i">
      <div class="taskImgDiv">
        <img src="/icons/taskTrophy.svg" alt="" class="taskTrophyImg" />
      </div>
      <span class="taskDescription">{{ onGoingTask.description }}</span>
      <div class="taskReward">
        <span class="taskReward-bold">Reward:</span>
        <img src="/icons/KarmaIcon.png" alt="" />
        <span class="taskRewars-amount">{{ onGoingTask.amount }}</span>
      </div>
    </div>
  </div>
  <!-- finished tasks -->
  <div class="onGoingTasks finishedTasksContainer">
    <div class="onGoingTasks-header">
      <span class="onGoingTasks-heading">Finished Tasks</span>
      <a href="#" class="helpButton">
        <img src="/icons/helpIcon.svg" alt=""
      /></a>
    </div>
    <div class="task-earn" v-for="(finishedTask, i) in finishedTasks" :key="i">
      <div class="FinishedtaskImgDiv">
        <img src="/icons/complitedTask.svg" alt="" class="taskTrophyImg" />
      </div>
      <span class="taskDescription">{{ finishedTask.description }}</span>
      <div class="FinishedtaskReward">
        <span class="taskReward-bold">Got:</span>
        <img src="/icons/KarmaIcon.png" alt="" />
        <span class="taskRewars-amount">{{ finishedTask.amount }}</span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { FinishedTask, OnGoingTask } from "src/components/models";

const onGoingTasks = ref([
  {
    description: "Donate to someone's dream ",
    amount: 20
  },
  {
    description: "Donate to someone's dream ",
    amount: 20
  },
  {
    description: "Donate to someone's dream ",
    amount: 20
  }
] as OnGoingTask[]);
const finishedTasks = ref([
  {
    description: "Donate to someone's dream ",
    amount: 20
  },
  {
    description: "Donate to someone's dream ",
    amount: 20
  },
  {
    description: "Donate to someone's dream ",
    amount: 20
  }
] as FinishedTask[]);
</script>
<style scoped lang="scss">
.earn-page {
  padding-top: 0.8rem;
}
.verifyContent-earn {
  padding: 0.7rem 0;
  display: flex;
  align-items: center;
  justify-content: center;

  .verifyContent-left {
    padding-left: 1rem;
    display: flex;
    flex-direction: column;

    .verifyContent-heading {
      color: white;
      font-family: poppinsBold;
      font-size: 1.2rem;
    }

    .verifyContent-description {
      color: #f3f3f3aa;
      font-size: 0.8rem;
      font-family: inter;
      margin-top: 0.5rem;
    }

    .verifyContent-button {
      margin-top: 1rem;
      background-color: rgba(182, 0, 67, 1);
      color: white;
      border: none;
      font-size: 0.8rem;
      height: 2.2rem;
      font-family: montseraatSemiBold;
      border-radius: 0.5rem !important;
      margin-bottom: 0.8rem !important;
      display: flex;
      align-items: center;
      padding: 0 0rem !important;

      img {
        height: 1rem;
        margin-left: 0.2rem;
      }
    }
  }
}
.finishedTasksContainer {
  margin-bottom: 1rem;
}
.onGoingTasks {
  padding: 0.5rem;

  .onGoingTasks-header {
    display: flex;
    align-items: center;
    justify-content: start;
    margin-bottom: 0.8rem;

    .onGoingTasks-heading {
      color: white;
      font-family: poppinsBold;
    }

    a {
      height: 1rem;
      margin-left: 0.5rem;
    }
  }

  .task-earn {
    background: linear-gradient(
      108.46deg,
      rgba(37, 37, 37, 0.525) 0%,
      rgba(23, 23, 23, 0.33) 100%
    );
    height: 3.6rem;
    width: 100%;
    display: flex;
    align-items: center;
    padding: 0 0.3rem;
    margin-bottom: 0.8rem;
    border-radius: 0.8rem;

    .taskImgDiv {
      background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.13) 0%,
        rgba(255, 255, 255, 0.044) 100%
      );
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.8rem;
      border-radius: 0.6rem;
      height: 2.5rem;
      width: 2.5rem;
      .taskTrophyImg {
        height: 1.2rem;
      }
    }

    .taskDescription {
      color: white;
      font-family: poppins;
      font-size: 0.8rem;
      white-space: nowrap;
      margin-left: 0.4rem;
    }
    .task {
      border-left: 0.07rem solid #fcfcfc1c;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        height: 1.2rem;
        margin-left: 0.4rem;
      }

      .taskReward-bold {
        font-family: poppinsSemiBold;
        font-size: 0.8rem;
      }

      .taskRewars-amount {
        color: $primary;
        font-family: poppinsBold;
        margin-left: 0.1rem;
        font-size: 1rem;
      }
    }
  }
}
.taskReward {
  @extend .task;
  padding-left: 0.8rem;
  margin-left: 0.8rem;
}
.FinishedtaskImgDiv {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 0.6rem;
}

.FinishedtaskReward {
  padding-left: 1.7rem;
  margin-left: 1rem;
  @extend .task;
}
</style>
