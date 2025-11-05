<template>
  <div class="settingsFaq-page">
    <div class="settingsFaq-header">
      <span class="settingsFaq-title">FAQ</span>
      <span class="settingsFaq-description">
        Adipiscing viverra netus ultricies lacus consectetur.
      </span>
    </div>
    <div class="settingsFaq-accordion">
      <q-list dark class="rounded-borders">
        <template v-for="(card, index) in cardList" :key="index">
          <q-expansion-item
            class="settingsFaq-card"
            :label="card.title"
            switch-toggle-side
            group="question"
            expand-icon="img:/icons/redPlus-icon.svg"
          >
            <q-card class="settings-cardDiv">
              <q-card-section class="settingsFaq-cardBody">
                <span class="settingsFaq-cardText">{{ card.text }}</span>
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </template>
      </q-list>
    </div>
  </div>
</template>

<script setup lang="ts">
const cardList = [
  {
    title: "Question #1",
    text: "Eros aliquam. Posuere purus pellentesque ipsum imperdiet ut sociis eget egestas pharetra. At nisl nisl lectus enim egestas diam elementum euismod dui. Cursus quis et proin quis ut a sit. Nisi massa aenean."
  },
  { title: "Question #2", text: "Card 2 Text" },
  { title: "Question #3", text: "Card 3 Text" }
];
</script>

<style scoped lang="scss">
.settingsFaq-page {
  display: flex;
  justify-content: center;
  flex-direction: column;
  padding: 0 1.2rem;
  .settingsFaq-header {
    display: flex;
    flex-direction: column;
    padding: 0.5rem 0rem;
    margin-top: 1rem;

    .settingsFaq-title {
      color: white;
      margin-bottom: 0.5rem;
      font-family: poppinsSemiBold;
      font-size: 1.4rem;
    }

    .settingsFaq-description {
      color: rgba(255, 255, 255, 0.534);
      font-size: 1rem;
    }
  }

  .settingsFaq-accordion {
    .settingsFaq-card {
      border: 0.1rem solid rgba(255, 255, 255, 0.155);
      border-radius: 1rem;
      margin: 1rem 0;
      font-family: poppins;
      font-size: 1rem;

      .settings-cardDiv {
        background-color: transparent;
        padding: 0.5rem;
        font-size: 0.9rem;
        display: flex;
        .settingsFaq-cardBody {
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }
    }
  }
}
</style>
