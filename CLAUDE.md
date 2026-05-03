# CLAUDE.md — מדריך לסוכן Claude שעובד על הפרויקט

מטרת הקובץ: לאפשר לכל סוכן Claude שמתחיל לעבוד על ה-repo הזה להבין את המבנה, המוסכמות, וההיסטוריה — בלי שתיראן יצטרך להסביר מחדש בכל פעם.

> **חשוב:** עדכן את הקובץ הזה בסוף כל סשן עבודה משמעותי — בעיקר את החלק "יומן שינויים" בתחתית.

---

## על הפרויקט

אתר הנצחה ליהודה לוי ז"ל. אתר סטטי (HTML/CSS/JS, ללא בנייה/קומפיילר), מתארח כנראה ב-GitHub Pages או דומה.
ניתן לבדוק מקומית עם `cd site && python3 -m http.server 8080`.

הבעלים: תיראן (Tiran@ewave.co.il).

## מבנה ה-repo

```
.
├── .github/workflows/
│   └── build-memorials-manifest.yml   ← CI שבונה אוטומטית את memorials.json
├── scripts/
│   └── build_memorials_manifest.py    ← סקריפט שסורק imgs/memorials ומייצר JSON
├── site/                              ← תיקיית האתר עצמו (כל מה שעולה לאינטרנט)
│   ├── index.html                     ← דף הבית (כל הסקציות)
│   ├── memorial.html                  ← עמוד פרטי לכל אזכרה (dynamic via ?date=...)
│   ├── js/
│   │   ├── site.js                    ← לוגיקה: ניווט, גלריות, פילטרים, רנדור אזכרות
│   │   └── hespedim.js                ← תוכן 31 ההספדים (data + render)
│   ├── data/
│   │   └── memorials.json             ← נבנה אוטומטית — אל תערוך ידנית
│   └── imgs/
│       ├── 1.JPG                      ← תמונת פרופיל ראשית
│       ├── insignia/                  ← סמלי יחידות (givati.png, shaked.png)
│       ├── memorials/                 ← תמונות אזכרות לפי תאריך
│       │   ├── dd_mm_yyyy.jpg         ← תמונה בודדת לאזכרה
│       │   ├── dd_mm_yyyy/            ← תיקייה — כל התמונות בתוכה שייכות לאזכרה
│       │   └── speeches/dd_mm_yyyy/   ← קבצי PDF של נאומים
│       ├── newspaper/                 ← כתבות עיתון (Image-NN.JPG + TN_Image-NN.JPG thumbs)
│       └── pics/                      ← גלריית תמונות (X.JPG + TN_X.JPG thumbs)
├── .nojekyll                          ← מונע מ-GitHub Pages להריץ Jekyll
└── CLAUDE.md                          ← אתה כאן
```

## מוסכמות חשובות

### תמונות וקידומת `TN_`
- כל תמונה גדולה ב-`pics/` ו-`newspaper/` מלווה בגרסת thumbnail עם קידומת `TN_`.
- ב-`memorials/` יש תיקיות לפי תאריך — הסקריפט `build_memorials_manifest.py` סורק אותן רקורסיבית.

### שמות תאריכים
- כל מה שקשור לאזכרות משתמש בפורמט `dd_mm_yyyy` (לדוגמה: `01_05_2025`).
- ה-RegEx ב-build script: `^(\d{2})_(\d{2})_(\d{4})`.

### CSS Variables — צבעים מרכזיים
שלושת המשתנים הללו שולטים על **כל** הצבע הדומיננטי באתר. שינוי שלהם → שינוי כל הסקציות.
מוגדרים פעמיים (פעם ב-`index.html` ופעם ב-`memorial.html`) — לעדכן בשניהם.

```css
:root {
  --bg: #0a0a0a;          /* רקע ראשי - כמעט שחור */
  --bg2: ...              /* רקע משני */
  --gold: #a78bfa;        /* צבע ההדגשה הראשי (כותרות, קישורים, גבולות) - לאחר שינוי לסגול */
  --gold-light: #d8b4fe;  /* גוון בהיר - שנים מיוחדות באזכרות */
  --gold-dim: #6d28d9;    /* גוון כהה - גבולות עדינים */
  --text: #f0ead8;        /* טקסט גוף - קרם */
  --red: #8b1a1a;         /* אדום - אלמנטים מסוימים */
}
```

יש גם הרבה `rgba(167,139,250, x)` קשיח (=#a78bfa) ברקעים שקופים. שמות המשתנים נשארו `--gold-*` להיסטוריה — **אל תשנה את שמות המשתנים, רק את הערכים** כדי לא לשבור כלום.

### CI אוטומטי
ה-workflow `build-memorials-manifest.yml` רץ אוטומטית על כל push שנוגע ב-`site/imgs/memorials/**` או בסקריפט עצמו. הוא:
1. מריץ `scripts/build_memorials_manifest.py`
2. אם `site/data/memorials.json` השתנה — דוחף commit `chore: rebuild memorials manifest [skip ci]`

**משמעות:** אם אתה מוסיף תמונות אזכרה — אל תיגע ב-`memorials.json` ידנית. תדחוף את התמונות וה-CI יעדכן.

### עריכת workflow files
עריכת קבצים תחת `.github/workflows/` דורשת PAT עם הרשאת **`workflow`** (Classic) או **Workflows: Read and write** (Fine-grained). הטוקן הרגיל של תיראן בלי הרשאה זו — לא יוכל לדחוף שינויים בקבצי workflow.

## הסקציות בדף הבית (`site/index.html`)

לפי הסדר (כולן `<section>` עם `class="section-title"` בכותרת):

1. **Hero** — שם, יחידה, תמונת פרופיל, נר זיכרון
2. **`#lifestory`** — סיפור חיים (timeline)
3. **מורשת קרב** — battle cards
4. **`#hespedim`** — 31 הספדים (עם פילטר לפי תפקיד)
5. **`#photos`** — גלריית תמונות
6. **כתבות עיתון** — קרוסלה
7. **אזכרות** — נטען דינמית מ-`memorials.json`

מאז commit `25673bf` כל הסקציות הן **collapsible סגורות כברירת מחדל** (פרט ל-Hero).

## נקודות שצריך לדעת

- **JS בלי build step.** קוד ES6 רגיל בקבצים `<script>`-ים.
- **Hebrew RTL.** כל ה-HTML משתמש ב-`dir="rtl"`. שמירה על כיוון בכל אלמנט שמכיל תוכן בעברית.
- **fonts.** `Frank Ruhl Libre` לכותרות, `Heebo` לגוף.
- **תמונות תאריכים פנימיות:** לפעמים יש sub-folders כמו `Nahal hasofet` — הסקריפט קולט אותם רקורסיבית.

## עבודה מ-Cowork (Claude כסוכן)

- כל סשן Cowork מתחיל ללא זיכרון מסשנים קודמים. לכן **קובץ ה-CLAUDE.md הזה הוא הזיכרון**.
- `git clone` ראשוני יכול להיות איטי (~589MB עם כל התמונות). אם עורכים רק קוד — אפשר להשתמש ב-`git clone --filter=blob:none --depth=1` לקלון רזה יותר.
- כשמסיימים שינוי — להריץ commit + push, ולעדכן את היומן בתחתית הקובץ הזה.

---

## יומן שינויים (descending — חדש למעלה)

### 2026-05-03 — שינוי פלטת צבעים: זהב → סגול-לבנדר
**הקשר:** תיראן קיבל הערה שהכיתוב הצהוב (#c9a84c) נבלע ברקע השחור.
**מה שונה:**
- `--gold`: `#c9a84c` → `#a78bfa` (violet-400, אותה רמת בהירות, ניגוד טוב יותר)
- `--gold-light`: `#e8cc80` → `#d8b4fe`
- `--gold-dim`: `#8a6e30` → `#6d28d9`
- כל `rgba(201,168,76, x)` → `rgba(167,139,250, x)`
- שונה גם ב-`site/index.html` וגם ב-`site/memorial.html`
**שמות המשתנים נותרו `--gold-*`** כדי לא לשבור הפניות. אם נחליט להישאר עם הסגול לטווח ארוך, כדאי בעתיד rename ל-`--accent-*`.
**אם לא ימצא חן — איך לחזור אחורה:** `git revert <commit-hash>` של הקומיט הזה.

### 2026-05-03 — תוספת CLAUDE.md
נוצר קובץ זה בעקבות תובנה שכל סשן Cowork מתחיל ללא זיכרון. הקובץ ישמש כמקור-אמת לכל סוכן Claude עתידי.

### לפני 2026-05-03 (מהיסטוריית git)
- `25673bf` — Make all sections collapsible (closed by default)
- `782ddbb` — Render one azkarot card per manifest entry (not per year)
- `bac18a3` — Three small fixes
- `bc7d705` — Memorials system: detail page, dynamic azkarot cards, manifest
- `005b666` — Fix carousel swipe direction (gallery + newspaper)
- `86e261b` — Add title.txt support: read at build time, render on cards + detail page
- `dbba444` — Move אזכרות to be the last section (after כתבות)
- `5c459be` — Replace static azkarot HTML with empty container; clean link styling

(לרשימה מלאה: `git log --oneline`)
