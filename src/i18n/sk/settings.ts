export default {
  settingsPages: {
    deleteAccount: {
      title: "Odstrániť účet",
      body: "Táto akcia natrvalo odstráni tvoj účet a skryje tvoje príspevky. Pre pokračovanie napíš:",
      phrase: "Chcem odstrániť svoj účet: {username}",
      inputAria: "Potvrdiť odstránenie účtu",
      deleted: "Tvoj účet bol odstránený."
    },
    faq: {
      description: "Časté otázky o dreamhubb, tokenoch a tvojom účte.",
      q1: {
        title: "Čo je dreamhubb?",
        text: "dreamhubb je sociálna platforma pomoci, kde ľudia môžu zdieľať sny, problémy a nápady a získať podporu od ostatných."
      },
      q2: {
        title: "Čo sú tokeny?",
        text: "Tokeny sú virtuálna mena v aplikácii, ktorá sa používa na podporu príspevkov v dreamhubb. Tokeny nie sú hotovosť a nedajú sa vybrať."
      },
      q3: {
        title: "Môžem si tokeny vybrať?",
        text: "Nie. Tokeny sa používajú iba v dreamhubb a nedajú sa vymeniť za peniaze."
      },
      q4: {
        title: "Ako môžem nahlásiť obsah?",
        text: "Otvor detail príspevku a ťukni na „Nahlásiť príspevok“. Podporu môžeš kontaktovať aj v Nastaveniach."
      },
      q5: {
        title: "Ako môžem odstrániť svoj účet?",
        text: "Choď do Nastavení a ťukni na „Odstrániť účet“. Pred odstránením ťa požiadame o potvrdenie."
      },
      q6: {
        title: "Ako môžem kontaktovať podporu?",
        text: "Choď do Nastavení → Pomoc a podpora alebo napíš na {email}."
      },
      q7: {
        title: "Sú nákupy tokenov dostupné na iOS?",
        text: "Nákupy tokenov na iOS sú dočasne nedostupné, kým sa dokončuje overovanie nákupov v aplikácii od Apple."
      }
    },
    ban: {
      heading: "Blokovaní používatelia",
      rules1: "Blokovaní používatelia sa nemôžu zobrazovať na tvojej nástenke. Ich príspevky sa po zablokovaní okamžite odstránia.",
      rules2: "Ak chceš nahlásiť škodlivý obsah, otvor príspevok a použi {report}. V naliehavých prípadoch navštív {support} alebo napíš na {email}.",
      supportLink: "Podporu",
      empty: "Zatiaľ si nikoho nezablokoval(a).",
      userFallback: "Používateľ #{id}",
      unblock: "Odblokovať",
      unblocked: "Používateľ bol odblokovaný."
    },
    email: {
      requestCode: "Vyžiadať kód →",
      confirmationCode: "Zadaj potvrdzovací kód",
      newEmail: "Nová emailová adresa",
      repeatNewEmail: "Zopakuj novú emailovú adresu",
      changeEmailCta: "Zmeniť email"
    },
    bio: {
      placeholder: "Napíš niečo o sebe..."
    },
    password: {
      oldPassword: "Staré heslo",
      forgotOldPassword: "Nepamätám si svoje heslo",
      repeatNewPassword: "Zopakuj nové heslo",
      requestReset: "Požiadať o obnovenie",
      resetCodeSent: "Poslali sme ti kód na obnovenie na emailovú adresu {email}",
      resetCode: "Kód na obnovenie",
      resendCode: "Poslať kód znova →",
      confirmCode: "Potvrdiť kód"
    },
    privacy: {
      receiveEmailMarketing: "Dostávať marketingové emaily",
      receiveEmailMarketingSecondary: "Dostávať ďalšie emailové aktuality",
      trackingPreferences: "Preferencie sledovania",
      terms: "Podmienky používania",
      policy: "Zásady ochrany osobných údajov",
      saved: "Nastavenia súkromia boli uložené"
    },
    support: {
      intro:
        "Potrebuješ pomoc s účtom, príspevkom alebo nahlásením nevhodného obsahu? Kontaktuj náš tím podpory a odpovieme čo najskôr.",
      emailLabel: "Email:",
      reviewPolicies: "Prečítať si môžeš aj naše {privacy} a {terms}.",
      privacyLink: "Zásady ochrany osobných údajov",
      termsLink: "Podmienky používania",
      reportHint: "Ak chceš nahlásiť príspevok, otvor ľubovoľný príspevok a v spodnej časti detailu ťukni na {report}."
    },
    report: {
      description:
        "Pomôž nám udržať dreamhubb bezpečný. Vyber dôvod a opíš problém. Náš tím tvoje nahlásenie posúdi.",
      inappropriateContent: "Nevhodný obsah",
      hateSpeech: "Nenávistné prejavy alebo rasizmus",
      wrongCategory: "Nesprávna kategória",
      wrongSubcategory: "Nesprávna podkategória",
      tellUsMore: "Povedz nám viac o probléme...",
      selectCategory: "Vyber správnu kategóriu",
      selectSubcategory: "Vyber správnu podkategóriu",
      sendReport: "Odoslať nahlásenie",
      missingPostId: "Chýba ID príspevku. Otvor nahlásenie z detailu príspevku."
    }
  }
};
