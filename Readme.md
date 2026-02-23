# Spendiary 🪙 

**Financial Sovereignty in Your Pocket.** A privacy-first, 100% offline personal finance manager built with **React Native** and the **New Architecture**.

[![React Native](https://img.shields.io/badge/React_Native-0.81+-61DAFB?logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54+-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Offline First](https://img.shields.io/badge/Offline-First-green.svg)]()

---

## 🚀 Project Overview

**Spendiary** is a mobile application designed for users who value data privacy and performance. Unlike most financial apps, Spendiary works entirely without an internet connection. Every record, budget, and preference stays on your device.

### Why Spendiary?
- **Data Sovereignty:** No cloud sync, no third-party trackers. You own your data.
- **High Performance:** Built to handle thousands of transactions with zero lag.
- **Biometric Security:** Native-level protection for sensitive financial information.

---

## 🛠 Tech Stack & Engineering Decisions

I built this project to demonstrate modern mobile development patterns and performance optimization:

* **Framework:** [React Native](https://reactnative.dev/) with **New Architecture (TurboModules/Fabric)** enabled for improved bridge communication.
* **State Management:** [Zustand](https://github.com/pmndrs/zustand) for a lightweight, performant, and boilerplate-free global state.
* **Local Storage:** [MMKV](https://github.com/mrousavy/react-native-mmkv) instead of AsyncStorage, providing **10x faster** read/write operations.
* **List Rendering:** [Shopify FlashList](https://shopify.github.io/flash-list/) to ensure smooth 60fps scrolling, even with complex item layouts and large datasets.
* **Data Visualization:** [Victory Native](https://formidable.com/open-source/victory-native/) & [React Native Skia](https://shopify.github.io/react-native-skia/) for high-performance hardware-accelerated charts and heatmaps.
* **Internationalization:** [i18next](https://www.i18next.com/) supporting **English, Spanish, and Portuguese**.

---

## ✨ Key Features

- 🔐 **Biometric Authentication:** Integration with `expo-local-authentication` for PIN and Fingerprint/FaceID access.
- 📊 **Visual Analytics:** Interactive pie charts and weekly/monthly heatmaps to identify spending patterns.
- 💰 **Budgeting System:** Per-category limits with real-time tracking.
- 🌗 **Adaptive UI:** Full support for System Light and Dark modes using `react-native-paper`.
- 📂 **Data Portability:** Export and import your entire database via standard **JSON files** for secure manual backups.
- 🛡️ **Optimized Manifest:** Carefully stripped Android permissions to the absolute minimum to protect user privacy.

---

## 📱 Screenshots

| Login & Biometrics | Home & Transactions | Data Analytics |
|---|---|---|
| [Placeholder Image] | [Placeholder Image] | [Placeholder Image] |

---

## ⚙️ Development & Installation

**Prerequisites:** Node.js, Expo CLI, and Android Studio/JDK for local builds.

1. **Clone the repository:**
   ```bash
   git-clone [https://github.com/ArmandoAra/gastos-mobile](https://github.com/ArmandoAra/gastos-mobile)
   cd spendiary
    ```

    Install dependencies:

Bash
npm install
Run in Development:

Bash
npx expo start
Build Local Release (Android):

Bash
npx expo run:android --variant release


🔒 Privacy Policy summary
Spendiary does not collect any personal data. It uses READ/WRITE_EXTERNAL_STORAGE only via System File Pickers to allow users to manage their own JSON backup files. All biometric data remains managed by the device's TEE (Trusted Execution Environment).

👤 Author
Armando Arano
Portfolio: www.armandoarano.com

📝 License
This project is licensed under the MIT License - see the LICENSE file for details.

---
