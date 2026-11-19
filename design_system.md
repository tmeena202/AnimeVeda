# 📜 Anime Veda — Global Design System & Rollout Plan

This document captures every principle, technique, and decision made while perfecting the Details Page, and maps out a precise plan to apply the same level of craft to every other page in the app.

---

## Part 1: What We Learned & Why It Works

### 1.1 Japanese Editorial Poster Design Principles

The key insight from studying Japanese graphic design (Ura-Hara posters, Ukiyo-e layering, editorial magazines):

| Principle | What it means | How we applied it |
|---|---|---|
| **Typography as Architecture** | Text is structure, not decoration | Japanese title as a massive, near-invisible vertical pillar in the background |
| **Asymmetric Tension** | Boring symmetry = static. Imbalance = energy | Poster pinned right, massive text on the left creating a visual "pull" |
| **Extreme Scale Contrast** | Pair huge expressive art with microscopic data | Giant title next to tiny 10px ledger grid with precise borders |
| **Negative Space (間 / Ma)** | Emptiness is not waste, it is breath | Large empty zones between elements direct the eye |
| **Rule of Thirds (Broken Grid)** | Great posters break their own grid on purpose | Title overlaps content area; the poster "bleeds" toward the edge |
| **Controlled Depth Layers** | Every great poster has 3+ depth planes | BG text → spotlight → content → poster = 4 distinct planes |

### 1.2 Attention-Grabbing Techniques We Implemented

- **Cinematic Spotlight**: Radial gradient spotlight using the anime's Dynamic Aura Color, cast specifically from the poster side to draw eyes there first.
- **Grayscale → Color Hover**: The Voice Cast images start in `filter: grayscale(100%)` and pop to full color on hover. This is a classic editorial technique to show both restraint and reward.
- **Animated Hype Button**: The `🔥 HYPE` button pulses with a keyframe animation on click, and permanently adopts the anime's aura color glow after being clicked.
- **Live Comment Feed**: Real-time state updates on comment post (no reload). New comments appear at the top with a unique left-border accent in the aura color.

### 1.3 Trilingual Integration (Hindi · Japanese · English)

This is the soul of the "Anime Veda" brand identity.

- **Background Text**: Three vertical language layers (Japanese left, Hindi center, English right) positioned absolutely, clipped by `overflow: hidden` so they never affect layout.
- **Ledger Labels**: Every metadata field has a 3-line label stack: Hindi (Devanagari) · Japanese (Kanji) · English (uppercase).
- **Action Buttons**: Buttons show all three languages: `▶ देखें · 視聴 · WATCH`.
- **Section Headers**: All section dividers use the format: `समुदाय · コミュニティ · COMMUNITY ARCHIVE`.
- **Timestamps in Comments**: Time references are trilingual: `2 घंटे पहले · 2時間前 · 2h ago`.

### 1.4 Engagement & Gamification

- **Karma Incentive on Comments**: "✦ पहली टिप्पणी · 初コメント · First comment earns +5 Karma" shown inside the composer.
- **Hype Count Persistence**: The Hype count is seeded from a random range to feel like real data.
- **International Mock Comments**: Comments pre-seeded with flags 🇯🇵🇮🇳🇬🇧 and text in multiple languages to create social proof and a sense of a real global community.
- **Comment Left-Border Accent**: User-posted comments get a unique colored left border in the anime's aura, making their contribution feel special and visible.

### 1.5 Structural Layout Rules

- **No horizontal scrolling** in any section.
- **No absolute-positioned elements** inside the content flow (only for decorative BG layers).
- **Back button** is inside the content container, aligned to the grid, not floating on the page.
- **Voice Cast**: Static 3-column grid of max 6 characters. No scrolling lists.
- **Poster**: Max `360px` wide on the right, with a rank badge using a brutalist flat-color flag.

---

## Part 2: Page-by-Page Rollout Plan

---

### Page 1: Dashboard / Home Page
**Components**: `FeaturedBillboard`, `AnimeCard`, `InfoSidebar`, `TopAnimeSidebar`, `LatestReleases`

| Element | Current State | Planned Change |
|---|---|---|
| **Background** | Flat dark | Three-language vertical text columns (tilted anime titles) as a subtle wallpaper |
| **FeaturedBillboard** | Standard image banner | Asymmetric layout: image bleeds to the right edge, title uses massive editorial typography on the left |
| **AnimeCard** | Grid cards with hover | Ledger grid on hover showing Score · Episodes · Status in trilingual format |
| **Section Headers** | Plain `<h2>` text | Editorial divider style: `TRENDING · トレンド · ट्रेंडिंग` with a hairline rule |
| **Sidebar** | Standard list | Minimalist brutalist navigation with trilingual labels |

---

### Page 2: Watch Page
**Components**: `AnimeWatchPage`, `TheaterPane`

| Element | Current State | Planned Change |
|---|---|---|
| **Background** | Black/dark default | Dynamic Spotlight Aura from the playing anime's color |
| **Player Frame** | Basic container | Subtle glowing border using the aura color (Moksha Portal style) |
| **Episode List** | Scrolling list | Ledger-style grid with episode numbers labeled: `एपिसोड · エピソード · EP` |
| **Back Button** | Plain | Inside the editorial container, aligned to the grid, trilingual label |
| **Show Info** | Text block on side | Compact editorial title with vertical Japanese text on the far left |

---

### Page 3: Sidebar Navigation
**Component**: `Sidebar`

| Element | Current State | Planned Change |
|---|---|---|
| **Nav Items** | Icon + English label | Icon + trilingual label stack (Hindi · Japanese · English) |
| **Brand Logo** | Text only | The Ensō + Lotus combined mark with the trilingual brand name |
| **Active Indicator** | Background highlight | Left border accent in the aura color, matching the Details page style |
| **BG** | Flat surface | Very subtle Japanese calligraphy watermark text running vertically |

---

### Page 4: TopBar
**Component**: `TopBar`

| Element | Current State | Planned Change |
|---|---|---|
| **Search Bar** | Standard input | Ledger-border style with placeholder: `खोजें · 探す · SEARCH` |
| **Karma Badge** | Styled pill | Brutalist square badge with trilingual label: `कर्म · カルマ · KARMA` |

---

## Part 3: Shared Design Tokens to Implement

These CSS classes should be extracted into `index.css` as global utilities so every page can reuse them without duplication:

```css
/* Trilingual heading structure */
.section-header-trilingual { ... }
.trilingual-label { ... }

/* Editorial Divider */
.editorial-divider { ... }

/* Brutalist Button styles */
.btn-editorial-primary { ... }
.btn-editorial-secondary { ... }

/* Ledger Grid */
.ledger-grid { ... }
.ledger-cell { ... }

/* Background Text Layer */
.bg-text-layer { ... }

/* Hype Animation */
.btn-hype { ... }
```

> [!IMPORTANT]
> Before rolling out to any new page, extract the shared classes above into `index.css` to ensure consistency. This prevents having to copy-paste or re-implement the same logic across 10+ CSS files.

---

## Part 4: Brand Reference Card

| Concept | Hindi | Japanese | English |
|---|---|---|---|
| Watch / View | देखें | 視聴する | WATCH |
| Back | वापस | 戻る | BACK |
| Score | अंक | スコア | SCORE |
| Episodes | प्रकरण | 話数 | EPISODES |
| Status | स्थिति | 状況 | STATUS |
| Genre | शैली | ジャンル | GENRE |
| Format | प्रारूप | 種類 | FORMAT |
| Synopsis | सारांश | あらすじ | SYNOPSIS |
| Voice Cast | स्वर कलाकार | キャスト | VOICE CAST |
| Community | समुदाय | コミュニティ | COMMUNITY |
| Vault | तिजोरी | 保管庫 | VAULT |
| Trending | ट्रेंडिंग | トレンド | TRENDING |
| Karma | कर्म | カルマ | KARMA |
| Search | खोजें | 探す | SEARCH |
| Home | होम | ホーム | HOME |
| Explore | खोज | 探索 | EXPLORE |
| Schedule | कार्यक्रम | スケジュール | SCHEDULE |
| Hype / Excitement | उत्साह | 熱狂 | HYPE |
