<template>
  <div class="onBoarding-page1">
    <div class="onBoarding-body">
      <img src="/icons/KarmaIcon.svg" alt="" class="onBoarding-icon" />
      <div class="onBoarding-textContainer">
        <span class="onBoarding-title">Headline of how it works</span>
        <span class="onBoarding-text"
          >We connect dreamers with those who are willing to support their
          goals, creating a community of support and motivation. Start
          fulfilling your own dreams or help someone else fulfill theirs today
          with Karma tokens.</span
        >
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.onBoarding-page1 {
  .onBoarding-body {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    .onBoarding-icon {
      height: 9rem;
      margin-bottom: 0.5rem;
    }
  }
  .onBoarding-textContainer {
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    flex-direction: column;
    padding: 1rem 2rem;
    text-align: center;
    .onBoarding-title {
      margin-bottom: 0.7rem;
      font-size: 1.2rem;
      font-family: poppinsSemiBold;
    }
    .onBoarding-text {
      color: #d0dcd8ba;
      font-size: 1rem;
      font-family: inter;
    }
  }
}
</style>
