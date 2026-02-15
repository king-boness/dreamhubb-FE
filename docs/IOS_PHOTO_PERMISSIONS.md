# iOS Photo Permissions – Test Checklist

**Kedy:** Po úprave Info.plist (NSPhotoLibraryAddUsageDescription, NSPhotoLibraryUsageDescription, NSCameraUsageDescription).

## Build & Sync

```bash
npx quasar build -m capacitor -T ios
npx cap sync ios
npx cap open ios
```

## V Xcode

1. **Product → Clean Build Folder**
2. **Run** na fyzickom iPhone (simulátor nemusí mať Photos picker)

## Test „+ Add photo“ v Edit Photos modale

1. Otvor post v edit móde
2. Klikni „+ Add photo“
3. Over, že sa otvorí Photos picker (žiadna Xcode chyba o missing NSPhotoLibraryAddUsageDescription)
