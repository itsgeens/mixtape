# Project Concept: Mixtape Memories 
**The Retro Digital Audio Guestbook**

## 1. Project Overview
"Mixtape Memories" is a web-based digital audio guestbook designed for weddings and special events. Disguised as a vintage cassette deck, the application allows guests to leave instant voice messages for the couple simply by scanning a QR code with their smartphones. 

The core philosophy of the app is **zero friction**: no app downloads, no account creation, and a straightforward, nostalgic user interface. The backend is designed to be intentionally lightweight and simple, focusing on reliable storage and continuous playback rather than heavy processing.

---

## 2. The Guest Experience (User Flow)

### 2.1 Seamless Access
* **Zero-App Friction:** Guests scan a QR code placed on reception tables (styled as retro cassette J-cards or concert tickets). The code opens a lightweight Web app instantly in their default mobile browser.
* **Instant Readiness:** The screen immediately presents a skeuomorphic, glowing red "REC" button on a vintage cassette recorder interface. 

### 2.2 Recording & The Prompt Wheel
* **One-Tap Recording:** Guests tap the "REC" button to start and tap "STOP" to finish. 
* **Skippable Prompt Wheel:** To prevent "mic fright," the interface features a Prompt Wheel. Guests can easily skip, swipe, or tap a "Next" button to cycle through fun ideas until they find one they like (e.g., *"Share your favorite memory of the couple,"* *"Predictions for their 10th anniversary,"* or *"What should they name their first dog?"*).
* **Optional Polaroid Photo Pairing:** After recording, guests have the *option* to snap a quick selfie. The app applies a vintage polaroid/grain filter and attaches it to the audio note. 
    * *Note: This is completely optional. Guests can bypass this step and upload their voice recording instantly without a photo.*

---

## 3. The Newlywed Playback Experience

### 3.1 The Digital Mixtape
* **Continuous Playback Mode:** The couple receives a secure link to their "Master Tape" dashboard. Hitting "Play" triggers a continuous, back-to-back playback of every guest message.
* **Retro Audio Transitions:** To enhance the mixtape feel, the app inserts subtle vintage tape-rewind, clicking, or static transition sound effects between each guest's audio clip.
* **Interactive Timeline:** Audio clips are timestamped and laid out visually. The couple can see when in the night the messages were recorded (e.g., calm early evening wishes vs. chaotic late-night dance floor shoutouts).

---

## 4. Design & Aesthetics

* **Skeuomorphic Interface:** The web app features animated spinning cassette reels, bouncing tactile VU meters that react to the guest's voice, and authentic mechanical "click" sound effects when pressing buttons.
* **Vintage Themes:** Couples can pre-select their preferred era-specific aesthetic for the guest UI (e.g., 80s Walkman, 70s Rotary Phone interface, or 90s Boombox).

---

## 5. Technical Architecture (Lightweight Backend)

The system is designed for high reliability and low server overhead.

* **Frontend:** Built with modern web frameworks (React/Vue) utilizing the HTML5 Web Audio API for browser-based microphone access.
* **Backend Storage:** 
    * Direct uploads of compressed audio blobs (.mp3 or .ogg) and image files (.jpg) to a secure cloud storage bucket (e.g., AWS S3, Google Cloud Storage).
    * No audio processing or AI noise cleanup is performed on the server side to keep infrastructure costs and complexity low.
* **Database:** A simple relational database (or NoSQL equivalent) to store metadata: 
    * `recording_id`
    * `timestamp`
    * `event_id`
    * `audio_file_url`
    * `photo_file_url` (nullable)
    * `prompt_used` (nullable)

---

## 6. Future Expansion Ideas (Post-Launch)
* Customizable prompt lists chosen by the couple before the event.
* Downloadable offline `.zip` archive of all MP3s and photos for local archiving.
* A "Guestbook Share Link" to let guests listen to the compiled mixtape after the wedding.
