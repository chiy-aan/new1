# 💕 Our First Love Anniversary Website

**Dreamy Cinematic Love — Premium Romantic Experience**

> A personalized cinematic anniversary website that feels like a romantic movie created especially for her.

---

## 🚀 How to Open the Website

1. Open **VS Code**
2. Open the folder: `anniversary-website`
3. Install the **Live Server** extension (if not already installed)
4. Right-click `index.html` → **Open with Live Server**

**OR simply double-click `index.html`** to open in your browser.

> ⚠️ For music and photo uploads to work correctly, use Live Server or any local web server. Some browsers restrict file access when opening HTML directly from the file system.

---

## 🎨 Personalization — `config.js`

All personal details are in one place: **`config.js`**

Open it and edit:

| Setting | What it does |
|--------|-------------|
| `yourName` | Your name |
| `herName` | Her name |
| `anniversaryDate` | Your actual anniversary date (counter starts from here) |
| `openingMessages` | The 3 cinematic intro messages |
| `welcomeHeading` | Main heading on the home page |
| `welcomeSubheading` | Subheading on home page |
| `welcomeMessage` | Personal message paragraph |
| `timeline` | Array of relationship milestones |
| `reasons` | Array of love reason cards |
| `loveLetter` | Full letter text |
| `loveLetterSignature` | Handwritten signature text |
| `surpriseMessages` | 15+ surprise messages in the gift box |
| `finalHeading` | "365 DAYS OF US..." text |
| `finalMessage` | "Forever Isn't Long Enough..." text |
| `music` | Music track list (see below) |

---

## 📷 Adding Your Photos

### Gallery (Memories Section)
- Open the website
- Scroll to the **Memories** chapter
- **Drag and drop** photos onto the upload zone, or click it to browse
- Photos are stored in your browser's **IndexedDB** (they persist after refresh)
- Click any photo caption to edit it
- Use **Slideshow Mode** to auto-play through all photos

### Timeline Photos
- Each memory card has a **📷 Photo** button
- Click it to upload a photo for that specific memory

### Anniversary Photo (Final Scene)
- Scroll to the **Forever Together** section
- Click the circle frame to upload your couple photo

---

## 🎵 Adding Your Song

1. Scroll to the **Our Song** chapter
2. Click **"🎵 Upload Our Special Song (MP3)"**
3. Select your MP3 file
4. The song will be stored in IndexedDB and play automatically

**Or** place MP3 files in `assets/music/` and update `config.js`:
```js
music: [
  { title: "Song Name", artist: "Artist Name", file: "assets/music/your-song.mp3" }
]
```

---

## 📁 Project Structure

```
anniversary-website/
├── index.html          ← Main website file
├── config.js           ← All personalization settings
├── css/
│   ├── style.css       ← Master stylesheet
│   └── extras.css      ← Additional polish
├── js/
│   ├── animations.js   ← Particles, petals, scroll effects, counter
│   ├── opening.js      ← Bike ride to temple opening scene
│   ├── music.js        ← Music player
│   └── sections.js     ← Timeline, gallery, reasons, letter, surprise
└── assets/
    ├── images/         ← Place your photos here
    └── music/          ← Place your MP3 files here
```

---

## 🌟 Features

| Feature | Status |
|---------|--------|
| 🎬 Cinematic opening — bike ride to South Indian temple | ✅ |
| 🌅 Animated golden hour sky with stars, birds, trees, flowers | ✅ |
| 🏍️ Animated couple on motorcycle | ✅ |
| 🛕 South Indian temple with gopuram | ✅ |
| 💌 Cinematic text messages with "Enter Our Love Story" button | ✅ |
| 🏠 Welcome page with live anniversary counter | ✅ |
| 🌹 Animated rose petals + gold particles | ✅ |
| 📖 Relationship timeline with add/edit/delete | ✅ |
| 📷 Photo gallery with drag-and-drop upload | ✅ |
| 🖼️ Full-screen lightbox with prev/next navigation | ✅ |
| ▶️ Slideshow mode | ✅ |
| 💕 Flipping love reason cards with heart burst | ✅ |
| 🎵 Music player with visualizer, progress bar, volume | ✅ |
| 💌 3D envelope with typewriter love letter | ✅ |
| 🎁 Gift box surprise with 15+ messages | ✅ |
| ❤️ Full-screen love animation | ✅ |
| 🌟 Grand finale scene | ✅ |
| 🔄 Replay opening animation button | ✅ |
| 📱 Fully responsive (mobile + desktop) | ✅ |
| 💾 IndexedDB persistent photo/music storage | ✅ |
| 🎨 Glassmorphism, golden borders, dark luxury theme | ✅ |

---

## 💡 Tips

- **First time?** The opening animation runs automatically when you open the site
- **Music?** It starts after clicking "Enter Our Love Story" (browser policy)
- **Photos?** Stored in your browser — they persist across refreshes
- **Customization?** Only edit `config.js` for most changes
- **Share it?** Upload the entire folder to GitHub Pages, Netlify, or Vercel for free hosting

---

## ❤️ Made with Love

*"Forever isn't long enough with you."*
