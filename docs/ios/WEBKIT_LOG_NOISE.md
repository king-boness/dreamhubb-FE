# WebKit / iOS log noise: "Updated list with error: DownloadFailed"

## Čo to je

V Xcode konzole (alebo pri debugovaní iOS appky) sa môže objavovať hláška:

```
Updated list with error: DownloadFailed
```

Toto **môže byť log noise z WebKitu / Apple (WebPrivacy, Resource Loader)** – nie nutne z nášho JavaScriptu. Appka môže fungovať normálne; hláška nemusí znamenať reálnu chybu.

## Nie je to z nášho kódu

V kóde frontendu (`src/`) sa tento presný reťazec nevyskytuje (môžeš overiť napr. `grep -r "DownloadFailed\|Updated list with error" src/` – žiadne zápisy z nášho JS).

Natívne wkdiag logy (ak sú zapnuté) ukážu len napr. `[wkdiag] NAV start capacitor://localhost` a žiadny `[wkdiag] FAIL` – čo podporuje, že ide o interný WebKit log, nie o zlyhanie navigácie z nášho pohľadu.

## Keď chceš zapnúť diagnostiku

Ak chceš overiť, či nejaký „DownloadFailed“ ide z nášho JS (console.log/warn/error), zapni dev diagnostiku:

**Zapnúť (persistentné po reload):**

```js
localStorage.setItem("__diagnostics", "1");
location.reload();
```

**Vypnúť:**

```js
localStorage.removeItem("__diagnostics");
location.reload();
```

**Alternatíva (bez reload, platí do ďalšieho reloadu):**

```js
window.__diagnosticsForce = true;
```

V konzole sa potom objaví `[diagnostics] enabled` a pri každom výskyte „DownloadFailed“ v našom logovaní aj blok: `[diagnostics] MATCH`, stack a `lastNetwork`.

## Keď riešiš reálny bug

Ak máš podozrenie na skutočnú chybu (napr. zlyhanie requestu), po zapnutí diagnostiky pošli z Xcode/Safari konzoly:

- celý blok **`[diagnostics] MATCH`** (s `msg`),
- **`[diagnostics] stack`** (JavaScript stack trace),
- **`[diagnostics] lastNetwork`** (posledný sieťový request z ring bufferu).

Toto pomôže určiť, či problém ide z našej vrstvy (axios/fetch) alebo z WebKitu/natíva.
