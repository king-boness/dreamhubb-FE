<template>
  <div class="onBoarding-page4">
    <div class="onBoarding-body">
      <span class="onBoarding-title">{{ $t("onboarding.tokens.page4Title") }}</span>
      <div class="onBoarding-infoContainer">
        <img
          src="/icons/onBoarding-img.svg"
          alt=""
          class="onBoarding-karmaIcon"
        />
        <div class="onBoarding-textContainer">
          <span class="text">{{ $t("onboarding.tokens.page4Text") }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.onBoarding-page4 {
  .onBoarding-body {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-top: 2rem;
    .onBoarding-title {
      color: white;
      margin-bottom: 0.7rem;
      font-size: 1.2rem;
      font-family: poppinsSemiBold;
    }
    .onBoarding-infoContainer {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      .onBoarding-karmaIcon {
        width: 18rem;
        margin-right: 0.6rem;
      }
      .onBoarding-textContainer {
        padding: 2rem 3rem;
        text-align: center;
        .text {
          color: #d0dcd8ba;
          font-size: 1rem;
          font-family: inter;
        }
      }
    }
  }
}
</style>
