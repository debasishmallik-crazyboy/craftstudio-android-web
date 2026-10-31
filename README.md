# 🎨 CraftStudio Pro (Android Tablet & Web)
### Open-Source CorelDRAW, Illustrator & Photoshop Alternative with Direct ChatGPT Generative AI Transfer

> **Reverse-Engineered Creative Suite** designed specifically for Android Tablets (Samsung Galaxy Tab, Lenovo, iPad) and Web browsers, combining **DesignCraft**, **VectorCraft**, and **PhotoCraft** into a unified, touch-optimized PWA with **100% Zero-Cost Free Hosting**.

---

## 🌟 কেন এটি তৈরি করা হয়েছে (Why CraftStudio Pro?)

১. **Android Tablet-এ CorelDRAW ও Illustrator-এর বিকল্প:**  
   বর্তমানে Android Tablet-এ CorelDRAW বা Adobe Illustrator ব্যবহার করতে গেলে প্রতি মাসে মোটা অংকের সাবস্ক্রিপশন (Subscription) দিতে হয়। CraftStudio সম্পূর্ণ ওপেন-সোর্স এবং ফ্রি—কোনো সাবস্ক্রিপশন ফি ছাড়াই ট্যাবলেট এবং ব্রাউজারে ভেক্টর ও ফটো এডিটিং করা যায়।

২. **ChatGPT Plus / Go Direct Design Transfer (Canva-এর মতো):**  
   Canva যেভাবে ChatGPT প্লাগইন দিয়ে সরাসরি ডিজাইন Canva-তে এডিটেবল অবস্থায় পাঠিয়ে দেয়, CraftStudio ঠিক সেই আর্কিটেকচার রিভার্স-ইঞ্জিনিয়ার করে তৈরি করা হয়েছে।  
   ChatGPT-কে একটি নির্দেশ দিলেই (যেমন: *"মেডিক্যাল ক্যাম্পের একটি ব্যানার বানাও"*), ChatGPT সরাসরি একটি **১-ক্লিক ট্রান্সফার লিঙ্ক** জেনারেট করবে। সেই লিঙ্কে ক্লিক করলেই পুরো ডিজাইনটি CraftStudio-তে **সম্পূর্ণ এডিটেবল ফরম্যাটে** (আলাদা টেক্সট লেয়ার, শেপ, ফন্ট, কালার ও ব্যাকগ্রাউন্ড) খুলে যাবে!

৩. **হোস্টিং সমস্যার ১০০% নিখরচায় স্থায়ী সমাধান (100% Free Hosting Forever):**  
   Node.js দিয়ে ব্যাকএন্ড হোস্ট করতে গেলে ফ্রিতে র‍্যামের লিমিট (512MB), ১৫ মিনিট পর সার্ভার ঘুমিয়ে যাওয়া এবং পেমেন্ট কার্ড চাওয়ার সমস্যা হয়।  
   CraftStudio-কে আমরা **Serverless Static Client-Side PWA + WebAssembly / Canvas2D** আর্কিটেকচারে তৈরি করেছি। এটি **GitHub Pages** বা **Cloudflare Pages**-এ **জীবনভর ১০০% সম্পূর্ণ ফ্রিতে আনলিমিটেড ব্যান্ডউইথ** নিয়ে চলবে! কোনো সার্ভার খরচ নেই।

---

## 🚀 প্রধান বৈশিষ্ট্যসমূহ (Core Features)

* **Dual-Engine Creative Studio:**
  * **Vector & Layout Mode (DesignCraft / VectorCraft):** মাল্টি-লেয়ার ভেক্টর ডিজাইন, টেক্সট টাইপোগ্রাফি (Georgia, Arial, Serif/Sans), শেপস (Rect, Ellipse, Badges), কালার প্যালেট, পাথফাইন্ডার অপারেশন।
  * **PhotoCraft Mode (Raster & Retouching):** ফটো লেয়ার স্ট্যাক, ব্লেন্ড মোডস (Multiply, Screen, Overlay), ব্রাইটনেস, কন্ট্রাস্ট ও কালার গ্রেডিং অ্যাডজাস্টমেন্ট।
* **Android Tablet & Stylus Native UX:**
  * **Touch Gestures:** ২-আঙুলে পিঞ্চ করে জুম (Pinch-to-zoom) এবং প্যান (Pan)।
  * **S-Pen & Stylus Support:** প্রেশার-সেন্সিটিভ ব্রাশ টুল এবং পাম রিজেকশন (Palm Rejection)।
  * **PWA Offline Support:** ট্যাবলেটের ব্রাউজারে খুলে "Add to Home Screen" করলেই এটি একটি নেটিভ অ্যাপের মতো অফলাইনে ফুলস্ক্রিনে কাজ করবে।
* **ChatGPT AI Bridge:**
  * URL Hash (`#design=<base64>`) দিয়ে নিমেষেই ডিজাইন লোড।
  * **QR Code Tablet Sync:** পিসিতে ডিজাইন জেনারেট করে স্ক্রিনের কিউআর কোডটি মোবাইল বা ট্যাবলেটের ক্যামেরা দিয়ে স্ক্যান করলেই তাৎক্ষণিক ট্যাবলেটে ওপেন হয়ে যাবে।
* **High-Resolution Exports:**
  * **PNG (1x & 2x Print Ultra-HD):** সোশ্যাল মিডিয়া ও প্রেসে ব্যবহারের জন্য।
  * **Scalable Vector (SVG):** যেকোনো সাইজে প্রিন্ট করার জন্য ভেক্টর ফরম্যাট।
  * **Project File (.craft.json):** ভবিষ্যতে পুনরায় এডিট করার জন্য প্রজেক্ট ব্যাকআপ।

---

## 📱 আপনার Android Tablet-এ কীভাবে ব্যবহার করবেন?

### অপশন ১: লোকাল ওয়াই-ফাই নেটওয়ার্কে সরাসরি ব্যবহার (Local Hub)
আপনার কম্পিউটার ও ট্যাবলেট যদি একই ওয়াই-ফাই (Wi-Fi) বা মোবাইল হটস্পটের সাথে যুক্ত থাকে:
1. কম্পিউটারে `start_local_tablet_server.bat` ফাইলে ডাবল-ক্লিক করুন।
2. কনসোলে একটি লোকাল আইপি অ্যাড্রেস দেখাবে (যেমন: `http://192.168.1.15:3000/`)।
3. আপনার ট্যাবলেটের Chrome ব্রাউজারে সেই ঠিকানাটি লিখুন।
4. ব্রাউজারের থ্রি-ডট মেনুতে গিয়ে **"Add to Home screen" / "Install App"** চাপুন। এটি ট্যাবলেটে একটি আলাদা অ্যাপ হয়ে যাবে!

### অপশন ২: GitHub Pages-এ সম্পূর্ণ ফ্রি হোস্ট (সার্বজনীন ব্যবহার)
1. GitHub-এ একটি নতুন পাবলিক রিপোজিটরি তৈরি করুন: `craftstudio-android-web`
2. ফোল্ডারে থাকা `push_to_github.bat` স্ক্রিপ্টটি চালান।
3. গিটহাব অ্যাকশন স্বয়ংক্রিয়ভাবে এটিকে GitHub Pages-এ লাইভ করে দেবে:
   `https://<YOUR_GITHUB_USERNAME>.github.io/craftstudio-android-web/`
4. ট্যাবলেটে এই লিঙ্কে প্রবেশ করে নিশ্চিন্তে ব্যবহার করুন।

---

## 🤖 ChatGPT Plus / Go-এর সাথে প্লাগইন যুক্ত করার নিয়ম

Canva-এর মতো সরাসরি ChatGPT থেকে CraftStudio-তে ডিজাইন ট্রান্সফার করার জন্য:

1. ChatGPT-তে যান এবং **Explore GPTs** → **Create a GPT**-তে ক্লিক করুন।
2. **Name:** `CraftStudio AI Designer`
3. **Instructions:** [`integrations/chatgpt/GPT_INSTRUCTIONS.md`](integrations/chatgpt/GPT_INSTRUCTIONS.md) ফাইলের সম্পূর্ণ টেক্সট কপি করে ChatGPT-এর Instructions বক্সে পেস্ট করুন।
4. **Actions (ঐচ্ছিক):** `Create new action`-এ ক্লিক করে [`integrations/chatgpt/openapi.yaml`](integrations/chatgpt/openapi.yaml)-এর কনফিগারেশন ইমপোর্ট করতে পারেন।
5. **Save / Publish** করুন।

### কীভাবে প্রম্পট দেবেন?
ChatGPT-তে গিয়ে প্রম্পট দিন:
> *"Design an official medical camp banner for Medical Service Centre with deep navy background, golden title, date badge, and bulleted services."*

ChatGPT সাথে সাথে আপনাকে একটি ক্লিকযোগ্য লিঙ্ক দেবে:
👉 **[🎨 Open & Edit in CraftStudio (Android / Tablet / Web)](https://debasishmallik-crazyboy.github.io/craftstudio-android-web/#design=...)**

ট্যাবলেট বা মোবাইলে ওই লিঙ্কে ট্যাপ করলেই পুরো ব্যানারটি এডিটেবল অবস্থায় খুলে যাবে! আপনি আঙুল দিয়ে টেক্সট এডিট করতে পারবেন, কালার পরিবর্তন করতে পারবেন এবং হাই-রেজোলিউশন ফাইলে এক্সপোর্ট করতে পারবেন।

---

## 📁 রিপোজিটরি ফাইল স্ট্রাকচার

```
k:\Design, craft, and Canva reverse-engineered/
├── index.html                      # ট্যাবলেট ও ওয়েব স্টুডিও ইন্টারফেস
├── manifest.json                   # PWA মোবাইল/ট্যাবলেট ইনস্টলেশন ম্যানিফেস্ট
├── sw.js                           # অফলাইন ক্যাশিং সার্ভিস ওয়ার্কার
├── server.js                       # পিওর নোড.জেএস লোকাল হাব (জিরো ডিপেন্ডেন্সি)
├── push_to_github.bat              # গিটহাবে পুশ ও অটো-ডিপ্লয় স্ক্রিপ্ট
├── start_local_tablet_server.bat   # ১-ক্লিকে লোকাল সার্ভার চালুর স্ক্রিপ্ট
├── css/
│   └── studio.css                  # ট্যাবলেট টাচ ও ডার্ক-মোড স্টাইলিং
├── js/
│   ├── app.js                      # মূল স্টুডিও অর্কেস্ট্রেটর
│   └── engine/
│       ├── vector-engine.js        # DesignCraft/VectorCraft ভেক্টর কোর
│       ├── raster-engine.js        # PhotoCraft ফটো ও ফিল্টার ইঞ্জিন
│       ├── touch-controller.js     # ট্যাবলেট মাল্টি-টাচ ও পেন কন্ট্রোলার
│       ├── chatgpt-bridge.js       # ChatGPT ডাইরেক্ট ডিজাইন ট্রান্সফার
│       └── export-engine.js        # হাই-রেজোলিউশন PNG/SVG/JSON এক্সপোর্টার
├── integrations/
│   └── chatgpt/
│       ├── openapi.yaml            # ChatGPT Actions স্পেসিফিকেশন
│       ├── ai-plugin.json          # OpenAI স্ট্যান্ডার্ড প্লাগইন ম্যানিফেস্ট
│       ├── GPT_INSTRUCTIONS.md     # Custom GPT তৈরির প্রস্তুত নির্দেশনা
│       └── sample_designs.json     # প্রস্তুত ডিজাইন টেমপ্লেট
└── .github/
    └── workflows/
        └── deploy.yml              # GitHub Pages অটো-ডিপ্লয়মেন্ট ওয়ার্কফ্লো
```

---

## 📜 লাইসেন্স
MIT License — সম্পূর্ণ মুক্ত, উন্মুক্ত ও সবার জন্য ফ্রি।
