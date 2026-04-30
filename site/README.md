# אתר הנצחה — יהודה לוי ז״ל

## מבנה הקבצים

```
site/
├── index.html          ← דף הבית
├── js/
│   ├── hespedim.js    ← כל תוכן ההספדים (31 הספדים)
│   └── site.js        ← קוד JavaScript של האתר
└── imgs/
    ├── 1.JPG          ← תמונת הפרופיל הראשית
    ├── newspaper/     ← כתבות העיתון
    │   ├── Image-01.JPG ... Image-07.JPG
    │   └── TN_Image-01.JPG ... TN_Image-07.JPG
    └── pics/          ← גלריית התמונות
        ├── Yeuda.JPG
        ├── LitlleYeuda.JPG
        └── ... (כל שאר התמונות)
```

## ⚠️ לפני מחיקת ה-GitHub — העתק תמונות

לפני שתמחק את ה-GitHub repository, יש להעתיק את כל התמונות לתיקיית `imgs/`.

### תמונה ראשית
העתק מ-GitHub:
- `1.JPG` → `imgs/1.JPG`

### כתבות עיתון (`imgs/newspaper/`)
העתק מ-GitHub תיקיית `newspaper/`:
- `Image-01.JPG`, `TN_Image-01.JPG`
- `Image-02.JPG`, `TN_Image-02.JPG`
- `Image-03.JPG`
- `Image-04.JPG`, `TN_Image-04.JPG`
- `Image-05.JPG`, `TN_Image-05.JPG`
- `Image-06.JPG`, `TN_Image-06.JPG`
- `Image-07.JPG`, `TN_Image-07.JPG`

### גלריית תמונות (`imgs/pics/`)
העתק מ-GitHub תיקיית `pics/` — **כל הקבצים** (גם עם קידומת `TN_`):
- `Yeuda.JPG` + `TN_Yeuda.JPG`
- `LitlleYeuda.JPG` + `TN_LitlleYeuda.JPG`
- `LitlleYeuda2.JPG` + `TN_LitlleYeuda2.JPG`
- `verylitlleYeuda.JPG` + `TN_verylitlleYeuda.JPG`
- `YeudaBarMitsva.JPG` + `TN_YeudaBarMitsva.JPG`
- `YeudaBarMitsva2.JPG` + `TN_YeudaBarMitsva2.JPG`
- `YeudaCostume.JPG` + `TN_YeudaCostume.JPG`
- `YeudaAndYafaAtYomHorim.JPG` + `TN_YeudaAndYafaAtYomHorim.JPG`
- `YeudaInArmy.JPG` + `TN_YeudaInArmy.JPG`
- `YeudaWithGuns.JPG` + `TN_YeudaWithGuns.JPG`
- `YeudaWithGuns2.JPG` + `TN_YeudaWithGuns2.JPG`
- `YeudaInOrhan.JPG` + `TN_YeudaInOrhan.JPG`
- `YeudaOnBench.JPG` + `TN_YeudaOnBench.JPG`
- `YeudaWithUniformComingHome.JPG` + `TN_YeudaWithUniformComingHome.JPG`
- `YeudaWithUniformComingHome2.JPG` + `TN_YeudaWithUniformComingHome2.JPG`
- `YeudaAndAmir.JPG` + `TN_YeudaAndAmir.JPG`
- `YeudaAndGili.JPG` + `TN_YeudaAndGili.JPG`
- `YeudaAndTomer.JPG` + `TN_YeudaAndTomer.JPG`
- `YeudaAndTomer2.JPG` + `TN_YeudaAndTomer2.JPG`
- `YeudaAndAndre.JPG` + `TN_YeudaAndAndre.JPG`
- `YeudaAndFamilyInTrip.JPG` + `TN_YeudaAndFamilyInTrip.JPG`
- `Mahlak2AndPkida.JPG` + `TN_Mahlak2AndPkida.JPG`
- `Mahlaka2.JPG` + `TN_Mahlaka2.JPG`
- `FlagWithSignatures.JPG` + `TN_FlagWithSignatures.JPG`
- `HartuvPainting.JPG` + `TN_HartuvPainting.JPG`
- `family.JPG` + `TN_family.JPG`
- `flag.JPG` + `TN_flag.JPG`
- `Medals.JPG` + `TN_Medals.JPG`
- `Sisma.JPG` + `TN_Sisma.JPG`
- `Tiberias.JPG` + `TN_Tiberias.JPG`
- `TsometYeuda.JPG` + `TN_TsometYeuda.JPG`
- `IMG_1507.JPG` + `TN_IMG_1507.JPG`
- `IMG_1508.JPG` + `TN_IMG_1508.JPG`
- `IMG_1509.JPG` + `TN_IMG_1509.JPG`
- `stone1.JPG` + `TN_stone1.JPG`
- `stone2.JPG` + `TN_stone2.JPG`
- `stone3.JPG` + `TN_stone3.JPG`

## הפעלה מקומית
פתח את `index.html` בדפדפן. לתצוגה מלאה עם גופנים, מומלץ להגיש דרך שרת מקומי פשוט:
```
cd site
python3 -m http.server 8080
```
ואז פתח `http://localhost:8080`

## העלאה לאינטרנט
ניתן להעלות את תיקיית `site/` לכל שירות אחסון סטטי:
- **GitHub Pages** (repo חדש)
- **Netlify** — גרור את התיקייה לאתר netlify.com
- **Cloudflare Pages**
- שרת רגיל — העלה בכל FTP
