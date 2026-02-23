# Git Editor – vi/vim swap file fix

**Problém:** Pri `git commit` sa otvorí vim/vi, ostane otvorený a vznikne swap súbor `.git/.COMMIT_EDITMSG.swp`, čo blokuje ďalšie commity.

**Riešenie:**

1. **Ukončiť vim:** stlač `Esc`, potom napíš `:q!` a Enter (vymazať bez uloženia) alebo `:wq` a Enter (uložiť a skončiť).
2. **Zmazať swap:** `rm .git/.COMMIT_EDITMSG.swp` (alebo na Windows `del .git\.COMMIT_EDITMSG.swp`).
3. **Zmeniť editor na nano alebo VSCode:**

```bash
# Nano (jednoduchý)
git config --global core.editor "nano"

# VSCode
git config --global core.editor "code --wait"
```
