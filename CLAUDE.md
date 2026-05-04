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
│   ├── build-memorials-manifest.yml   ← CI שבונה אוטומטית את memorials.json
│   └── build-pics-manifest.yml        ← CI שבונה pics.json + thumbnails חסרים
├── scripts/
│   ├── build_memorials_manifest.py    ← סורק imgs/memorials ומייצר JSON
│   └── build_pics_manifest.py         ← סורק pics+newspaper, מייצר thumbnails+JSON
├── site/                              ← תיקיית האתר עצמו (כל מה שעולה לאינטרנט)
│   ├── index.html                     ← דף הבית (כל הסקציות)
│   ├── memorial.html                  ← עמוד פרטי לכל אזכרה (dynamic via ?date=...)
│   ├── js/
│   │   ├── site.js                    ← לוגיקה: ניווט, גלריות, פילטרים, רנדור דינמי
│   │   └── hespedim.js                ← תוכן 31 ההספדים (data + render)
│   ├── data/
│   │   ├── memorials.json             ← נבנה אוטומטית — אל תערוך ידנית
│   │   ├── pics.json                  ← נבנה אוטומטית — אל תערוך ידנית
│   │   └── pics_captions.json         ← captions+order לתמונות (כן לערוך ידנית)
│   └── imgs/
│       ├── 1.JPG                      ← תמונת פרופיל ראשית
│       ├── insignia/                  ← סמלי יחידות (givati.png, shaked.png)
│       ├── memorials/                 ← תמונות אזכרות לפי תאריך
│       │   ├── dd_mm_yyyy.jpg         ← תמונה בודדת לאזכרה
│       │   ├── dd_mm_yyyy/            ← תיקייה — כל התמונות בתוכה שייכות לאזכרה
│       │   └── speeches/dd_mm_yyyy/   ← קבצי PDF של נאומים
│       ├── newspaper/                 ← כתבות עיתון (Image-NN.JPG + TN_Image-NN.JPG thumbs)
│       ├── pics/                      ← גלריית תמונות (X.JPG + TN_X.JPG thumbs)
│       └── battle/                    ← תמונות מיום הקרב — גלריה קטנה במורשת קרב (X.JPG + TN_X.JPG)
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

### קבצי קונבנציה בתוך תיקיית אזכרה (`site/imgs/memorials/dd_mm_yyyy/`)
מוסכמות שמאפשרות העשרת תוכן בלי שינוי קוד — תיראן פשוט מוסיף קובץ והסקריפט קולט.

- **`title.txt`** — טקסט חופשי שיופיע ככותרת/תיאור על כרטיס האזכרה בעמוד הראשי. אם קיים, הוא **דוחף החוצה** את ה-prose מ-`FORMAL` ב-`site.js`. לא לשים שורות ריקות בלבד — אלה לא ייקלטו (נדרש תוכן לאחר `strip()`).
- **`youtube.txt`** — מזהה סרטון יוטיוב או URL מלא (שורה אחת, אפשר עם הערות `# ...`). הסקריפט שולף את ה-11 תווי ה-ID ושם אותו ב-`m.youtube` של המניפסט. עמוד `memorial.html` מציג iframe מ-`youtube-nocookie.com`. כך מקליטים אזכרת זום למשל.
- כל קובץ תמונה (`.jpg/.jpeg/.png/.webp`) בתיקייה — נכנס לגלריית האזכרה. שמות קבצים → captions ברירת מחדל (אפשר להחליף `_` ברווחים).
- `speeches/dd_mm_yyyy/*.pdf` — נאומים. נטען לעמוד האזכרה כקישורי הורדה.

לדוגמה: כדי להוסיף כותרת לאזכרת `11_05_2016`, פשוט יצירת `site/imgs/memorials/11_05_2016/title.txt` עם תוכן כמו `עשרים שנה לנפילתו` ו-push. ה-CI ירענן את `memorials.json` והכותרת תופיע באתר.

### ⚠️ אזהרה חשובה — צבעי טקסט
**אל תכהה את `--text`, `--text2`, `--text3`.** הניסיון לעשות זאת כבר נכשל פעמיים. כשתיראן אומר "הטקסט נבלע ברקע" / "אני רואה פחות טוב" — זה אומר שהוא צריך **קונטרסט גבוה יותר**, כלומר **טקסט בהיר יותר** על הרקע השחור, ולא טקסט כהה יותר. הערכים הנוכחיים גבוהים מערכי המקור של המעצב במכוון. אם יש בקשה לשנות צבעי טקסט בעתיד — לוודא היטב באיזה כיוון לפני שמיישמים, ובכל מקרה לא להפחית את הקונטרסט.

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
שלושה workflows מנהלים את האתר:

1. **`build-memorials-manifest.yml`** — רץ על push שנוגע ב-`site/imgs/memorials/**`. מריץ את הסקריפט, ואם `memorials.json` השתנה דוחף commit עם `[skip ci]`.
2. **`build-pics-manifest.yml`** — רץ על push שנוגע ב-`site/imgs/pics/**`, `newspaper/**`, או `battle/**`. מייצר thumbnails חסרים (`TN_*`) ומעדכן `pics.json`. Commit עם `[skip ci]`.
3. **`pages.yml`** — מפרסם את `site/` ל-GitHub Pages תחת `https://www.yehudalevi.co.il/`. מופעל ע"י: (א) push ל-`main` שנוגע ב-`site/**`, (ב) `workflow_run` בסיום המוצלח של אחד משני ה-workflows הראשונים, (ג) `workflow_dispatch` ידני.

ה-trigger `workflow_run` קיים כי `[skip ci]` בקומיטים האוטומטיים חוסם את ה-push trigger של pages.yml. בלי `workflow_run`, תמונות חדשות היו מתווספות למניפסט אך לא נפרסות עד ה-push הבא של תיראן.

**משמעות:** אם אתה מוסיף תמונות, תיקיית אזכרה, `title.txt`, או `youtube.txt` — אל תיגע ב-`memorials.json` או `pics.json` ידנית. תדחוף ותחכה ~30־60 שניות ל-pages.yml שירוץ אחרי ה-manifest workflow.

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

### 2026-05-04 (המשך) — הוספת אנליטיקס GoatCounter
**הקשר:** תיראן רצה לדעת כמה כניסות יש לאתר. בחרנו ב-GoatCounter — חינם לאתר לא-מסחרי, ללא cookies, לא דורש באנר אישור. דשבורד ב-`https://yehudalevi.goatcounter.com/`.

**מה נעשה:** נוסף `<script data-goatcounter="..." async src="//gc.zgo.at/count.js"></script>` לפני `</head>` ב-`site/index.html` וב-`site/memorial.html`. הסקריפט נטען אסינכרונית, לא משפיע על מהירות הטעינה.

**גישה לדשבורד:** תיראן צריך להתחבר ל-https://www.goatcounter.com/ עם המייל/סיסמה שלו (או דרך magic link). הדשבורד מציג ביקורים יומיים, מקורות הפניה, מדינות, דפים פופולריים, רוחב מסך, וכו׳.

**איך להסיר:** אם אי פעם תיראן ירצה לעצור איסוף נתונים — מוחקים את שתי השורות `<script ...goatcounter...>` משני הקבצים, push, וזהו. אפשר גם פשוט למחוק את החשבון ב-GoatCounter UI.


### 2026-05-04 (המשך) — הסרת prose מ-FORMAL[2016] + workflow_run trigger ל-pages.yml
**שינוי 1: site/js/site.js** — הוסר `2016: 'עשרים שנה. טקס מרגש עם כל מי שהכיר ואהב.'` מ-`FORMAL` (תיראן ביקש להוריד את הכותרת מ-2016). הערך הועבר לבלוק "Past proses kept for reference" כדי לשמר היסטוריה. אם בעתיד תיראן ירצה כותרת ספציפית לאזכרת `11_05_2016` או `18_10_2016` — הדרך המומלצת היא להוסיף `title.txt` בתיקיית האזכרה (ראה "קבצי קונבנציה בתוך תיקיית אזכרה" למעלה), לא לערוך את site.js.

**שינוי 2: .github/workflows/pages.yml** — נוסף trigger `workflow_run` שמאזין לסיום של "Build pics manifest" ו-"Build memorials manifest". הסיבה: `[skip ci]` בקומיטים האוטומטיים שלהם חוסם את ה-push trigger של pages.yml, מה שגרם לכך שתמונות חדשות / אזכרות חדשות לא נפרסות אוטומטית. עם ה-trigger הזה, כל push לתמונה חדשה מפעיל את ה-manifest workflow → בסיומו מופעל pages.yml → האתר מתעדכן תוך כדקה. נוסף גם `if:` ב-job ה-build כדי לדלג כשה-manifest run נכשל.


### 2026-05-04 — פרסום האתר ישירות תחת `https://www.yehudalevi.co.il/`
**הקשר:** עד עכשיו האתר עלה ב-`https://www.yehudalevi.co.il/YehudaLeviNew/site/` כי הדומיין היה רשום על ריפו ה-user-page `tiranhay.github.io` ו-`YehudaLeviNew` הוגש כ-project page. תיראן רצה את האתר ישירות תחת השורש של הדומיין.

**מה נעשה:**
1. הוסרה הגדרת ה-Custom domain מהריפו `tiranhay.github.io` (Settings → Pages → Remove). הריפו עצמו עדיין live תחת `tiranhay.github.io` — לא הוסר, רק הדומיין הופרד ממנו.
2. בריפו `YehudaLeviNew`:
   - **Settings → Pages → Source** הוחלף מ-"Deploy from a branch" ל-**GitHub Actions**. הסיבה: GitHub מאפשר branch-deploy רק מ-`/(root)` או `/docs`, ולא מ-`/site`.
   - **Custom domain**: `www.yehudalevi.co.il` (יצר אוטומטית קובץ `CNAME` ב-root עם הערך הזה — נשאר כ-marker אך לא נחוץ למסירה כשעובדים ב-Actions mode).
   - **Enforce HTTPS**: ✓
3. נוסף workflow חדש: `.github/workflows/pages.yml`. הוא:
   - מופעל על push ל-`main` שנוגע ב-`site/**` או ב-workflow עצמו, ומ-workflow_dispatch.
   - יוצר `site/CNAME` בזמן ריצה (לא commit) עם הערך `www.yehudalevi.co.il` כדי שה-artifact הסופי יכיל אותו (פעולה idempotent).
   - מעלה את `./site` כ-artifact של Pages ומפרסם אותו.
   - הרשאות: `contents:read, pages:write, id-token:write`. concurrency עם `cancel-in-progress` כדי שלא יתפספסו פרסומים.

**גוטשות:**
- `[skip ci]` בקומיטים האוטומטיים של `build-pics-manifest.yml`/`build-memorials-manifest.yml` חוסם גם את `pages.yml`. זה אומר שכשהמניפסט מתעדכן אוטומטית, הפריסה לא תרוץ עד ה-push הבא של תיראן או הפעלה ידנית של `pages.yml` (workflow_dispatch). אם זה הופך למפריע — אפשר להוסיף trigger `workflow_run` ל-pages.yml שמאזין לסיום של שני ה-manifest workflows.
- ה-CNAME ב-root של הריפו (`/CNAME`) נוצר בזמן ה-branch-deploy ונשאר. הוא לא בשימוש כשמפרסמים דרך Actions, אבל גם לא מזיק. אפשר למחוק בעתיד.
- כל הקישורים הישנים `/YehudaLeviNew/site/...` מפסיקים לעבוד אחרי המעבר. אם איפשהו בקוד יש absolute URLs כאלה — צריך לעדכן ל-relative או ל-absolute עם הדומיין החדש.

**איך מוודאים שזה עובד:**
- Actions tab → "Deploy site to Pages" → ✓ ירוק.
- Settings → Pages → "Your site is live at https://www.yehudalevi.co.il/" עם DNS check ✓.
- `https://www.yehudalevi.co.il/` בחלון בסתר טוען את האתר.


### 2026-05-03 — תמיכה בגלריית `battle` במורשת קרב
**הקשר:** תיראן רוצה גלריית דפדוף קטנה של תמונות מיום הקרב, מתחת לסיפור הקרב, בתיקייה חדשה `site/imgs/battle/`. אותה לוגיקה כמו `pics` ו-`newspaper`.
**מה שונה:**
- `scripts/build_pics_manifest.py`: נוספה כניסה שלישית ל-`FOLDERS` עבור `battle`. הסקרי