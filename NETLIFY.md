# 🌐 Netlify Deployment Guide (বাংলা ও English)

এই ডিরেক্টরিতে একটি **`netlify.toml`** ফাইল তৈরি করা হয়েছে যা দিয়ে আপনি খুব সহজেই আপনার প্রজেক্টটি **Netlify**-তে ডেপ্লয় করতে পারবেন।

---

## 🚀 deployment configuration steps (English)

### Step 1: Connect your repository
1. Go to your [Netlify Dashboard](https://app.netlify.com/).
2. Click **Add new site** -> **Import an existing project** from GitHub / GitLab / Bitbucket.
3. Select your repository where this code is pushed.

### Step 2: Configure Build Settings
Netlify will automatically detect the base parameters, but if it doesn't, specify:
* **Build Command:** `npm run build` (or `vite build`)
* **Publish Directory:** `dist`

### Step 3: Add Environment Variables (Important)
Since our application uses the modern **Gemini 3.5 API** for smart playlist curation and note outlines, you should configure your API key in Netlify:
1. Go to **Site settings** -> **Environment variables** under Netlify console.
2. Click **Add a variable**.
3. Create a key named: `GEMINI_API_KEY`
4. Paste your Google AI Studio Gemini API Key as the value.

### Step 4: Click Deploy!
Your frontend SPA along with the fallback routes will be compiled and launched globally with supreme speed.

---

## 🇧🇩 কিভাবে Netlify-তে সহজে ডেপ্লয় করবেন (বাংলা নির্দেশিকা)

### ধাপ ১: রিপোজিটরি কানেক্ট করুন
১. [Netlify Dashboard](https://app.netlify.com/)-এ যান।
২. **Add new site** -> **Import an existing project** এ ক্লিক করে আপনার GitHub অ্যাকাউন্ট থেকে প্রজেক্ট রিপোজিটরিটি সিলেক্ট করুন।

### ধাপ ২: বিল্ড অপশন সেট করুন
আমরা রুট ডিরেক্টরিতে `netlify.toml` যোগ করেছি, যা অটোমেটিক বিল্ড কনফিগার করে নেবে। তাও যদি দেখতে চান:
* **Build Command:** `npm run build`
* **Publish Directory:** `dist`

### ধাপ ৩: এপিআই কী (API Key) সেট করুন
আপনার অ্যাপলিকেশনটিতে আর্টিফিশিয়াল ইন্টেলিজেন্স বা জেমিনি ৩.৫ ফিচার সক্রিয় করার জন্য:
১. Netlify কনসোলে আপনার সাইটের **Site settings** -> **Environment variables** মেন্যুতে যান।
2. **Add a variable**-এ ক্লিক করে Key এ লিখুন: `GEMINI_API_KEY`
৩. Value ফিল্ডে আপনার Google AI Studio-র Gemini API কীটি পেস্ট করে দিন ও সেভ করুন।

### ধাপ ৪: ডেপ্লয় দিন!
কয়েক সেকেন্ডে আপনার সাইট বিশ্বব্যাপী লাইভ হয়ে যাবে। রিফ্রেশ করলে কোনো 404/রুট এরর যেন না হয়, তার জন্য `netlify.toml` ফাইলে রিডাইরেক্ট রুলস সেট করা আছে।
