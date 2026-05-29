# iOS Build Troubleshooting

## Kontrola merge conflict značiek

```bash
grep -RIn '<<<<<<<' ios
grep -RIn '=======' ios
grep -RIn '>>>>>>>' ios
```

Ak nájdeš značky, odstráň ich a ponechaj jednu finálnu verziu v súbore.

## Kontrola validity Info.plist

```bash
plutil -lint ios/App/App/Info.plist
```

Očakávaný výstup: `ios/App/App/Info.plist: OK`

## Reinstalácia CocoaPods

```bash
cd ios/App
pod install
```

## Xcode

1. **Product → Clean Build Folder**
2. Znovu spusti build na fyzickom iPhone alebo simulátore

## Kontrola Bundle Identifier

```bash
grep PRODUCT_BUNDLE_IDENTIFIER ios/App/App.xcodeproj/project.pbxproj
```

Mal by byť zjednotený na `com.dreamhubb.ap` (žiadne duplicity).
