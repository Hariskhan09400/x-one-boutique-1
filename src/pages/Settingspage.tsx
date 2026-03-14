// src/pages/Settingspage.tsx
// ══════════════════════════════════════════════════════════════════
//  X ONE BOUTIQUE — Advanced Settings Page  (All-in-One)
//  Features:
//   ✅ Dark / Light Theme  → applies to full site
//   ✅ Accent Color (8 colors) → --xob-accent CSS var globally
//   ✅ Font Size (4 levels) → html font-size
//   ✅ Brightness Slider → overlay (Android-style, no toast on drag)
//   ✅ Compact Mode → html class → tighter spacing site-wide
//   ✅ High Contrast → html class
//   ✅ Animations on/off + Reduced Motion
//   ✅ Notifications toggle
//   ✅ Sound Effects (Mixkit CDN + Web Audio fallback)
//   ✅ Language (6 languages, full UI translation)
//   ✅ Currency Converter (ExchangeRate-API, cached 1hr)
//   ✅ Auto-play Videos toggle
//   ✅ Smart toasts (specific per action, not generic)
//   ✅ Export: useCurrency, useTranslation, useSettings hooks
// ══════════════════════════════════════════════════════════════════

import {
  useState, useEffect, useCallback, useRef,
  createContext, useContext, type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import toast from "react-hot-toast";

// ────────────────────────────────────────────────────────────────
//  TYPES
// ────────────────────────────────────────────────────────────────
export interface UserSettings {
  darkMode:       boolean;
  fontSize:       "small" | "medium" | "large" | "xlarge";
  brightness:     number;
  accentColor:    string;
  animations:     boolean;
  notifications:  boolean;
  soundEffects:   boolean;
  compactMode:    boolean;
  language:       string;
  currency:       string;
  autoPlayVideos: boolean;
  highContrast:   boolean;
  reducedMotion:  boolean;
  clickSound:     string;
}

export interface CurrencyContextType {
  currency:   string;
  convert:    (inrAmount: number) => string;
  symbol:     string;
  rates:      Record<string, number>;
  loading:    boolean;
}

export interface TranslationContextType {
  language: string;
  t:        (key: string) => string;
}

// ────────────────────────────────────────────────────────────────
//  CONSTANTS
// ────────────────────────────────────────────────────────────────
export const DEFAULTS: UserSettings = {
  darkMode:       false,
  fontSize:       "medium",
  brightness:     100,
  accentColor:    "#2563eb",
  animations:     true,
  notifications:  true,
  soundEffects:   false,
  compactMode:    false,
  language:       "English",
  currency:       "INR",
  autoPlayVideos: false,
  highContrast:   false,
  reducedMotion:  false,
  clickSound:     "click1",
};

export const ACCENT_COLORS = [
  { label: "Royal Blue",   value: "#2563eb", hex: "2563eb" },
  { label: "Indigo",       value: "#4f46e5", hex: "4f46e5" },
  { label: "Violet",       value: "#7c3aed", hex: "7c3aed" },
  { label: "Rose",         value: "#e11d48", hex: "e11d48" },
  { label: "Crimson",      value: "#dc2626", hex: "dc2626" },
  { label: "Amber",        value: "#d97706", hex: "d97706" },
  { label: "Emerald",      value: "#059669", hex: "059669" },
  { label: "Teal",         value: "#0d9488", hex: "0d9488" },
  { label: "Cyan",         value: "#0891b2", hex: "0891b2" },
  { label: "Fuchsia",      value: "#c026d3", hex: "c026d3" },
];

export const CURRENCY_LIST = [
  { code: "INR", symbol: "₹",     name: "Indian Rupee"    },
  { code: "USD", symbol: "$",     name: "US Dollar"       },
  { code: "GBP", symbol: "£",     name: "British Pound"   },
  { code: "EUR", symbol: "€",     name: "Euro"            },
  { code: "AED", symbol: "د.إ",  name: "UAE Dirham"      },
  { code: "SGD", symbol: "S$",    name: "Singapore Dollar"},
  { code: "JPY", symbol: "¥",     name: "Japanese Yen"    },
  { code: "CAD", symbol: "CA$",   name: "Canadian Dollar" },
];

export const LANGUAGES = [
  { code: "en",  name: "English",    native: "English"    },
  { code: "hi",  name: "Hindi",      native: "हिन्दी"      },
  { code: "ur",  name: "Urdu",       native: "اردو"        },
  { code: "bn",  name: "Bengali",    native: "বাংলা"       },
  { code: "ta",  name: "Tamil",      native: "தமிழ்"       },
  { code: "te",  name: "Telugu",     native: "తెలుగు"      },
];

export const CLICK_SOUNDS = [
  { id: "click1",  label: "Tap",       url: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3" },
  { id: "click2",  label: "Pop",       url: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3" },
  { id: "click3",  label: "Soft",      url: "https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3" },
  { id: "click4",  label: "Tick",      url: "https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3" },
];

// ────────────────────────────────────────────────────────────────
//  TRANSLATIONS (UI labels only)
// ────────────────────────────────────────────────────────────────
const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    settings:          "Settings",
    customizeExp:      "Customize your experience",
    back:              "Back",
    appearance:        "Appearance",
    darkMode:          "Dark Mode",
    darkModeDesc:      "Switch between light and dark theme",
    accentColor:       "Accent Color",
    accentColorDesc:   "Primary color used across the app",
    highContrast:      "High Contrast",
    highContrastDesc:  "Increase text and element contrast",
    compactMode:       "Compact Mode",
    compactModeDesc:   "Reduce spacing for more content",
    textDisplay:       "Text & Display",
    fontSize:          "Font Size",
    fontSizeDesc:      "Adjust text size across the app",
    brightness:        "Brightness",
    brightnessDesc:    "Adjust screen brightness",
    motion:            "Motion & Animation",
    animations:        "Animations",
    animationsDesc:    "Enable smooth transitions and effects",
    reducedMotion:     "Reduced Motion",
    reducedMotionDesc: "Minimize animations for accessibility",
    sound:             "Sound Effects",
    soundDesc:         "Play click sounds on interactions",
    soundStyle:        "Sound Style",
    soundStyleDesc:    "Choose your preferred click sound",
    notifications:     "Notifications",
    notificationsDesc: "Order updates, deals and alerts",
    language:          "Language & Region",
    languageLabel:     "Language",
    languageDesc:      "App display language",
    currency:          "Currency",
    currencyDesc:      "Price display format",
    currencyRates:     "Exchange Rates",
    privacy:           "Privacy",
    autoPlay:          "Auto-play Videos",
    autoPlayDesc:      "Play videos automatically while browsing",
    reset:             "Reset All Settings",
    resetDesc:         "Restore everything to default",
    saved:             "Saved",
    small:             "Small",
    medium:            "Medium",
    large:             "Large",
    xlarge:            "X-Large",
    on:                "On",
    off:               "Off",
    shopNow:           "Shop Now",
    preview:           "Preview",
    loading:           "Loading rates...",
    rateUpdated:       "Rates updated",
  },
  hi: {
    settings:          "सेटिंग्स",
    customizeExp:      "अपना अनुभव अनुकूलित करें",
    back:              "वापस",
    appearance:        "रूप-रंग",
    darkMode:          "डार्क मोड",
    darkModeDesc:      "लाइट और डार्क थीम के बीच स्विच करें",
    accentColor:       "एक्सेंट रंग",
    accentColorDesc:   "ऐप में उपयोग होने वाला मुख्य रंग",
    highContrast:      "हाई कंट्रास्ट",
    highContrastDesc:  "टेक्स्ट और तत्वों का कंट्रास्ट बढ़ाएं",
    compactMode:       "कॉम्पैक्ट मोड",
    compactModeDesc:   "अधिक सामग्री के लिए स्पेसिंग कम करें",
    textDisplay:       "टेक्स्ट और डिस्प्ले",
    fontSize:          "फ़ॉन्ट साइज़",
    fontSizeDesc:      "ऐप में टेक्स्ट का आकार बदलें",
    brightness:        "चमक",
    brightnessDesc:    "स्क्रीन चमक समायोजित करें",
    motion:            "मोशन और एनिमेशन",
    animations:        "एनिमेशन",
    animationsDesc:    "स्मूद ट्रांजिशन और इफेक्ट सक्षम करें",
    reducedMotion:     "कम मोशन",
    reducedMotionDesc: "एक्सेसिबिलिटी के लिए एनिमेशन कम करें",
    sound:             "साउंड इफेक्ट",
    soundDesc:         "इंटरैक्शन पर क्लिक साउंड बजाएं",
    soundStyle:        "साउंड स्टाइल",
    soundStyleDesc:    "अपनी पसंदीदा क्लिक ध्वनि चुनें",
    notifications:     "नोटिफिकेशन",
    notificationsDesc: "ऑर्डर अपडेट, डील और अलर्ट",
    language:          "भाषा और क्षेत्र",
    languageLabel:     "भाषा",
    languageDesc:      "ऐप प्रदर्शन भाषा",
    currency:          "मुद्रा",
    currencyDesc:      "मूल्य प्रदर्शन प्रारूप",
    currencyRates:     "विनिमय दरें",
    privacy:           "गोपनीयता",
    autoPlay:          "वीडियो स्वतः-चलाएं",
    autoPlayDesc:      "ब्राउज़ करते समय वीडियो स्वतः चलाएं",
    reset:             "सभी सेटिंग्स रीसेट करें",
    resetDesc:         "सब कुछ डिफ़ॉल्ट पर वापस करें",
    saved:             "सहेजा गया",
    small:             "छोटा",
    medium:            "मध्यम",
    large:             "बड़ा",
    xlarge:            "बहुत बड़ा",
    on:                "चालू",
    off:               "बंद",
    shopNow:           "अभी खरीदें",
    preview:           "पूर्वावलोकन",
    loading:           "दरें लोड हो रही हैं...",
    rateUpdated:       "दरें अपडेट हुईं",
  },
  ur: {
    settings:          "ترتیبات",
    customizeExp:      "اپنا تجربہ اپنی مرضی کے مطابق بنائیں",
    back:              "واپس",
    appearance:        "ظاہری شکل",
    darkMode:          "ڈارک موڈ",
    darkModeDesc:      "روشن اور تاریک تھیم کے درمیان سوئچ کریں",
    accentColor:       "ایکسینٹ رنگ",
    accentColorDesc:   "ایپ میں استعمال ہونے والا بنیادی رنگ",
    highContrast:      "ہائی کنٹراسٹ",
    highContrastDesc:  "متن اور عناصر کا کنٹراسٹ بڑھائیں",
    compactMode:       "کمپیکٹ موڈ",
    compactModeDesc:   "زیادہ مواد کے لیے جگہ کم کریں",
    textDisplay:       "متن اور ڈسپلے",
    fontSize:          "فونٹ سائز",
    fontSizeDesc:      "ایپ میں متن کا سائز تبدیل کریں",
    brightness:        "روشنی",
    brightnessDesc:    "اسکرین کی روشنی ایڈجسٹ کریں",
    motion:            "موشن اور انیمیشن",
    animations:        "انیمیشن",
    animationsDesc:    "ہموار منتقلی اور اثرات فعال کریں",
    reducedMotion:     "کم موشن",
    reducedMotionDesc: "رسائی کے لیے انیمیشن کم کریں",
    sound:             "آواز کے اثرات",
    soundDesc:         "تعاملات پر کلک آواز بجائیں",
    soundStyle:        "آواز کا انداز",
    soundStyleDesc:    "اپنی پسندیدہ کلک آواز منتخب کریں",
    notifications:     "اطلاعات",
    notificationsDesc: "آرڈر اپڈیٹ، ڈیل اور الرٹس",
    language:          "زبان اور علاقہ",
    languageLabel:     "زبان",
    languageDesc:      "ایپ ڈسپلے زبان",
    currency:          "کرنسی",
    currencyDesc:      "قیمت ڈسپلے فارمیٹ",
    currencyRates:     "تبادلہ کی شرحیں",
    privacy:           "رازداری",
    autoPlay:          "ویڈیو خود بخود چلائیں",
    autoPlayDesc:      "براؤز کرتے وقت ویڈیو خود بخود چلائیں",
    reset:             "تمام ترتیبات ری سیٹ کریں",
    resetDesc:         "سب کچھ ڈیفالٹ پر واپس کریں",
    saved:             "محفوظ کیا",
    small:             "چھوٹا",
    medium:            "درمیانہ",
    large:             "بڑا",
    xlarge:            "بہت بڑا",
    on:                "آن",
    off:               "آف",
    shopNow:           "ابھی خریدیں",
    preview:           "پیش نظارہ",
    loading:           "شرحیں لوڈ ہو رہی ہیں...",
    rateUpdated:       "شرحیں اپڈیٹ ہوئیں",
  },
  bn: {
    settings:          "সেটিংস",
    customizeExp:      "আপনার অভিজ্ঞতা কাস্টমাইজ করুন",
    back:              "পিছনে",
    appearance:        "উপস্থিতি",
    darkMode:          "ডার্ক মোড",
    darkModeDesc:      "লাইট ও ডার্ক থিমের মধ্যে পরিবর্তন করুন",
    accentColor:       "অ্যাকসেন্ট রং",
    accentColorDesc:   "অ্যাপে ব্যবহৃত প্রাথমিক রং",
    highContrast:      "হাই কনট্রাস্ট",
    highContrastDesc:  "টেক্সট ও উপাদানের কনট্রাস্ট বাড়ান",
    compactMode:       "কমপ্যাক্ট মোড",
    compactModeDesc:   "আরও কন্টেন্টের জন্য স্পেসিং কমান",
    textDisplay:       "টেক্সট ও ডিসপ্লে",
    fontSize:          "ফন্ট সাইজ",
    fontSizeDesc:      "অ্যাপে টেক্সটের আকার পরিবর্তন করুন",
    brightness:        "উজ্জ্বলতা",
    brightnessDesc:    "স্ক্রিনের উজ্জ্বলতা সামঞ্জস্য করুন",
    motion:            "মোশন ও অ্যানিমেশন",
    animations:        "অ্যানিমেশন",
    animationsDesc:    "মসৃণ ট্রানজিশন ও ইফেক্ট সক্ষম করুন",
    reducedMotion:     "কম মোশন",
    reducedMotionDesc: "অ্যাক্সেসিবিলিটির জন্য অ্যানিমেশন কমান",
    sound:             "সাউন্ড ইফেক্ট",
    soundDesc:         "ইন্টারঅ্যাকশনে ক্লিক সাউন্ড বাজান",
    soundStyle:        "সাউন্ড স্টাইল",
    soundStyleDesc:    "আপনার পছন্দের ক্লিক সাউন্ড বেছে নিন",
    notifications:     "বিজ্ঞপ্তি",
    notificationsDesc: "অর্ডার আপডেট, ডিল ও সতর্কতা",
    language:          "ভাষা ও অঞ্চল",
    languageLabel:     "ভাষা",
    languageDesc:      "অ্যাপ প্রদর্শন ভাষা",
    currency:          "মুদ্রা",
    currencyDesc:      "মূল্য প্রদর্শন বিন্যাস",
    currencyRates:     "বিনিময় হার",
    privacy:           "গোপনীয়তা",
    autoPlay:          "ভিডিও স্বয়ংক্রিয় চালান",
    autoPlayDesc:      "ব্রাউজ করার সময় ভিডিও স্বয়ংক্রিয় চালান",
    reset:             "সব সেটিংস রিসেট করুন",
    resetDesc:         "সবকিছু ডিফল্টে ফিরিয়ে দিন",
    saved:             "সংরক্ষিত",
    small:             "ছোট",
    medium:            "মাঝারি",
    large:             "বড়",
    xlarge:            "অনেক বড়",
    on:                "চালু",
    off:               "বন্ধ",
    shopNow:           "এখনই কিনুন",
    preview:           "পূর্বরূপ",
    loading:           "হার লোড হচ্ছে...",
    rateUpdated:       "হার আপডেট হয়েছে",
  },
  ta: {
    settings:          "அமைப்புகள்",
    customizeExp:      "உங்கள் அனுபவத்தை தனிப்பயனாக்கவும்",
    back:              "திரும்பு",
    appearance:        "தோற்றம்",
    darkMode:          "இருண்ட பயன்முறை",
    darkModeDesc:      "ஒளி மற்றும் இருண்ட தீம் இடையே மாறவும்",
    accentColor:       "உச்சரிப்பு நிறம்",
    accentColorDesc:   "பயன்பாட்டில் பயன்படுத்தப்படும் முதன்மை நிறம்",
    highContrast:      "அதிக明ிக明明",
    highContrastDesc:  "உரை மற்றும் கூறுகளின்明明明明明明明明",
    compactMode:       "சுருக்கப்பட்ட பயன்முறை",
    compactModeDesc:   "அதிக உள்ளடக்கத்திற்கு இடைவெளி குறைக்கவும்",
    textDisplay:       "உரை மற்றும் காட்சி",
    fontSize:          "எழுத்துரு அளவு",
    fontSizeDesc:      "பயன்பாட்டில் உரை அளவை மாற்றவும்",
    brightness:        "ஒளிர்வு",
    brightnessDesc:    "திரை ஒளிர்வை சரிசெய்யவும்",
    motion:            "இயக்கம் மற்றும் அனிமேஷன்",
    animations:        "அனிமேஷன்கள்",
    animationsDesc:    "மிருதுவான மாற்றங்களை இயக்கவும்",
    reducedMotion:     "குறைந்த இயக்கம்",
    reducedMotionDesc: "அணுகலுக்காக அனிமேஷன் குறைக்கவும்",
    sound:             "ஒலி விளைவுகள்",
    soundDesc:         "தொடர்புகளில் கிளிக் ஒலி ஒலிக்கவும்",
    soundStyle:        "ஒலி பாணி",
    soundStyleDesc:    "விருப்பமான கிளிக் ஒலியை தேர்ந்தெடுக்கவும்",
    notifications:     "அறிவிப்புகள்",
    notificationsDesc: "ஆர்டர் புதுப்பிப்புகள், சலுகைகள்",
    language:          "மொழி மற்றும் பிராந்தியம்",
    languageLabel:     "மொழி",
    languageDesc:      "பயன்பாட்டு காட்சி மொழி",
    currency:          "நாணயம்",
    currencyDesc:      "விலை காட்சி வடிவம்",
    currencyRates:     "மாற்று விகிதங்கள்",
    privacy:           "தனியுரிமை",
    autoPlay:          "வீடியோக்களை தானாக இயக்கவும்",
    autoPlayDesc:      "உலாவும்போது வீடியோக்களை தானாக இயக்கவும்",
    reset:             "அனைத்து அமைப்புகளையும் மீட்டமைக்கவும்",
    resetDesc:         "அனைத்தையும் இயல்புநிலைக்கு திரும்பவும்",
    saved:             "சேமிக்கப்பட்டது",
    small:             "சிறியது",
    medium:            "நடுத்தரம்",
    large:             "பெரியது",
    xlarge:            "மிகவும் பெரியது",
    on:                "இயக்கு",
    off:               "நிறுத்து",
    shopNow:           "இப்போதே வாங்கவும்",
    preview:           "முன்னோட்டம்",
    loading:           "விகிதங்கள் ஏற்றப்படுகின்றன...",
    rateUpdated:       "விகிதங்கள் புதுப்பிக்கப்பட்டன",
  },
  te: {
    settings:          "సెట్టింగ్‌లు",
    customizeExp:      "మీ అనుభవాన్ని అనుకూలీకరించండి",
    back:              "వెనక్కి",
    appearance:        "రూపం",
    darkMode:          "డార్క్ మోడ్",
    darkModeDesc:      "లైట్ మరియు డార్క్ థీమ్ మధ్య మారండి",
    accentColor:       "యాక్సెంట్ రంగు",
    accentColorDesc:   "యాప్‌లో ఉపయోగించే ప్రాథమిక రంగు",
    highContrast:      "హై కాంట్రాస్ట్",
    highContrastDesc:  "టెక్స్ట్ మరియు అంశాల కాంట్రాస్ట్ పెంచండి",
    compactMode:       "కాంపాక్ట్ మోడ్",
    compactModeDesc:   "మరింత కంటెంట్‌కి స్పేసింగ్ తగ్గించండి",
    textDisplay:       "టెక్స్ట్ మరియు డిస్‌ప్లే",
    fontSize:          "ఫాంట్ పరిమాణం",
    fontSizeDesc:      "యాప్‌లో టెక్స్ట్ పరిమాణం మార్చండి",
    brightness:        "ప్రకాశం",
    brightnessDesc:    "స్క్రీన్ ప్రకాశాన్ని సర్దుబాటు చేయండి",
    motion:            "మోషన్ మరియు యానిమేషన్",
    animations:        "యానిమేషన్లు",
    animationsDesc:    "సులభమైన పరివర్తనలను ప్రారంభించండి",
    reducedMotion:     "తక్కువ మోషన్",
    reducedMotionDesc: "యాక్సెసిబిలిటీ కోసం యానిమేషన్ తగ్గించండి",
    sound:             "సౌండ్ ఎఫెక్ట్స్",
    soundDesc:         "ఇంటరాక్షన్లలో క్లిక్ సౌండ్ వినండి",
    soundStyle:        "సౌండ్ స్టైల్",
    soundStyleDesc:    "మీకు ఇష్టమైన క్లిక్ సౌండ్ ఎంచుకోండి",
    notifications:     "నోటిఫికేషన్లు",
    notificationsDesc: "ఆర్డర్ అప్‌డేట్‌లు, డీల్‌లు మరియు అలర్ట్‌లు",
    language:          "భాష మరియు ప్రాంతం",
    languageLabel:     "భాష",
    languageDesc:      "యాప్ డిస్‌ప్లే భాష",
    currency:          "కరెన్సీ",
    currencyDesc:      "ధర డిస్‌ప్లే ఫార్మాట్",
    currencyRates:     "మార్పిడి రేట్లు",
    privacy:           "గోప్యత",
    autoPlay:          "వీడియోలు స్వయంచాలకంగా ప్లే చేయండి",
    autoPlayDesc:      "బ్రౌజ్ చేస్తున్నప్పుడు వీడియోలు స్వయంచాలకంగా చేయండి",
    reset:             "అన్ని సెట్టింగ్‌లను రీసెట్ చేయండి",
    resetDesc:         "అన్నింటినీ డిఫాల్ట్‌కి తిరిగి తీసుకురండి",
    saved:             "సేవ్ చేయబడింది",
    small:             "చిన్న",
    medium:            "మధ్యస్థ",
    large:             "పెద్ద",
    xlarge:            "చాలా పెద్ద",
    on:                "ఆన్",
    off:               "ఆఫ్",
    shopNow:           "ఇప్పుడే కొనండి",
    preview:           "ప్రివ్యూ",
    loading:           "రేట్లు లోడ్ అవుతున్నాయి...",
    rateUpdated:       "రేట్లు నవీకరించబడ్డాయి",
  },
};

const langCodeMap: Record<string, string> = {
  English: "en", Hindi: "hi", Urdu: "ur",
  Bengali: "bn", Tamil: "ta", Telugu: "te",
};

// ────────────────────────────────────────────────────────────────
//  CONTEXTS (exported for use across the app)
// ────────────────────────────────────────────────────────────────
export const CurrencyContext = createContext<CurrencyContextType>({
  currency: "INR", convert: (v) => `₹${v}`, symbol: "₹", rates: {}, loading: false,
});

export const LanguageContext = createContext<TranslationContextType>({
  language: "English",
  t: (k) => k,
});

export const SettingsContext = createContext<{ settings: UserSettings; updateSetting: <K extends keyof UserSettings>(k: K, v: UserSettings[K]) => void }>({
  settings: DEFAULTS,
  updateSetting: () => {},
});

// ────────────────────────────────────────────────────────────────
//  HOOKS
// ────────────────────────────────────────────────────────────────
export function useCurrency() { return useContext(CurrencyContext); }
export function useTranslation() { return useContext(LanguageContext); }
export function useSettings() { return useContext(SettingsContext); }

// ────────────────────────────────────────────────────────────────
//  SOUND ENGINE
// ────────────────────────────────────────────────────────────────
const audioCache: Record<string, HTMLAudioElement> = {};

function playSound(url: string) {
  try {
    if (!audioCache[url]) {
      const a = new Audio(url);
      a.volume = 0.4;
      audioCache[url] = a;
    }
    const audio = audioCache[url];
    audio.currentTime = 0;
    audio.play().catch(() => {
      // Web Audio API fallback — simple tick
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 800;
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.08);
      } catch {}
    });
  } catch {}
}

// Global sound player - call this from anywhere when soundEffects is on
export function playClickSound(settingsKey?: string) {
  try {
    const key = settingsKey || "xob_settings_guest";
    const raw = localStorage.getItem(key);
    const s: UserSettings = raw ? JSON.parse(raw) : DEFAULTS;
    if (!s.soundEffects) return;
    const sound = CLICK_SOUNDS.find(c => c.id === s.clickSound) || CLICK_SOUNDS[0];
    playSound(sound.url);
  } catch {}
}

// ────────────────────────────────────────────────────────────────
//  DOM APPLIER — applies settings to document
// ────────────────────────────────────────────────────────────────
export function applySettingsToDOM(s: UserSettings) {
  // Dark mode
  document.documentElement.classList.toggle("dark", s.darkMode);

  // Font size
  const fontMap = { small: "13px", medium: "15px", large: "17px", xlarge: "20px" };
  document.documentElement.style.fontSize = fontMap[s.fontSize];

  // Brightness overlay
  let overlay = document.getElementById("xob-brightness-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "xob-brightness-overlay";
    overlay.style.cssText = `position:fixed;inset:0;pointer-events:none;z-index:99998;transition:opacity .25s;background:rgba(0,0,0,1);`;
    document.body.appendChild(overlay);
  }
  overlay.style.opacity = String(((100 - s.brightness) / 100) * 0.65);

  // Accent color
  document.documentElement.style.setProperty("--xob-accent", s.accentColor);
  document.documentElement.style.setProperty("--xob-accent-rgb",
    hexToRgb(s.accentColor));

  // Compact mode
  document.documentElement.classList.toggle("xob-compact", s.compactMode);

  // High contrast
  document.documentElement.classList.toggle("xob-high-contrast", s.highContrast);

  // Animations
  document.documentElement.classList.toggle("xob-no-animations", !s.animations);

  // Reduced motion
  if (s.reducedMotion) {
    document.documentElement.style.setProperty("--motion-duration", "0ms");
  } else {
    document.documentElement.style.removeProperty("--motion-duration");
  }

  // Auto-play videos
  document.querySelectorAll("video").forEach(v => {
    if (s.autoPlayVideos) v.setAttribute("autoplay", "");
    else v.removeAttribute("autoplay");
  });
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

// ────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const settingsKey = user?.id ? `xob_settings_${user.id}` : "xob_settings_guest";

  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem(settingsKey);
      return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS;
    } catch { return DEFAULTS; }
  });

  const [isDark,          setIsDark]          = useState(false);
  const [exchangeRates,   setExchangeRates]   = useState<Record<string, number>>({});
  const [ratesLoading,    setRatesLoading]    = useState(false);
  const [ratesError,      setRatesError]      = useState(false);
  const [activeSection,   setActiveSection]   = useState<string | null>(null);
  const brightnessTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [tempBrightness,  setTempBrightness]  = useState(settings.brightness);

  // Detect dark mode from html class
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  // Apply settings on change + save
  useEffect(() => {
    applySettingsToDOM(settings);
    localStorage.setItem(settingsKey, JSON.stringify(settings));
  }, [settings, settingsKey]);

  // Fetch exchange rates (base INR)
  useEffect(() => {
    const CACHE_KEY = "xob_exchange_rates";
    const CACHE_TS  = "xob_exchange_ts";
    const ONE_HOUR  = 3600 * 1000;

    const cached = localStorage.getItem(CACHE_KEY);
    const ts     = Number(localStorage.getItem(CACHE_TS) || 0);

    if (cached && Date.now() - ts < ONE_HOUR) {
      setExchangeRates(JSON.parse(cached));
      return;
    }

    setRatesLoading(true);
    fetch("https://open.er-api.com/v6/latest/INR")
      .then(r => r.json())
      .then(data => {
        if (data.rates) {
          setExchangeRates(data.rates);
          localStorage.setItem(CACHE_KEY, JSON.stringify(data.rates));
          localStorage.setItem(CACHE_TS, String(Date.now()));
        }
        setRatesLoading(false);
      })
      .catch(() => {
        setRatesError(true);
        setRatesLoading(false);
        // Fallback static rates
        const fallback: Record<string, number> = {
          INR: 1, USD: 0.012, GBP: 0.0095, EUR: 0.011,
          AED: 0.044, SGD: 0.016, JPY: 1.79, CAD: 0.016,
        };
        setExchangeRates(fallback);
      });
  }, []);

  // Translation helper
  const langCode = langCodeMap[settings.language] || "en";
  const tMap     = TRANSLATIONS[langCode] || TRANSLATIONS["en"];
  const t        = useCallback((key: string) => tMap[key] || TRANSLATIONS["en"][key] || key, [tMap]);

  // Currency converter
  const currencyInfo = CURRENCY_LIST.find(c => c.code === settings.currency) || CURRENCY_LIST[0];
  const convert      = useCallback((inr: number): string => {
    const rate = exchangeRates[settings.currency] || 1;
    const val  = inr * rate;
    const fmt  = val >= 1000
      ? val.toLocaleString("en-IN", { maximumFractionDigits: 0 })
      : val.toFixed(settings.currency === "JPY" ? 0 : 2);
    return `${currencyInfo.symbol}${fmt}`;
  }, [exchangeRates, settings.currency, currencyInfo.symbol]);

  // Smart update with specific toasts
  const update = useCallback(<K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K],
    toastMsg?: string,
    noToast?: boolean
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    if (settings.soundEffects && key !== "brightness") {
      const sound = CLICK_SOUNDS.find(c => c.id === settings.clickSound) || CLICK_SOUNDS[0];
      playSound(sound.url);
    }
    if (!noToast) {
      const msg = toastMsg || `${String(key).replace(/([A-Z])/g, " $1")} ${t("saved")}`;
      toast.success(msg, {
        duration: 1800,
        style: {
          background: isDark ? "#1a1d2e" : "#fff",
          color: isDark ? "#f1f5f9" : "#0f172a",
          border: `1px solid ${settings.accentColor}33`,
          fontSize: "13px",
          fontWeight: "700",
        },
        iconTheme: { primary: settings.accentColor, secondary: "#fff" },
      });
    }
  }, [settings.soundEffects, settings.clickSound, settings.accentColor, isDark, t]);

  // Brightness — update live, toast only after drag ends
  const handleBrightnessChange = (v: number) => {
    setTempBrightness(v);
    setSettings(prev => ({ ...prev, brightness: v }));
    if (brightnessTimer.current) clearTimeout(brightnessTimer.current);
    brightnessTimer.current = setTimeout(() => {
      localStorage.setItem(settingsKey, JSON.stringify({ ...settings, brightness: v }));
    }, 300);
  };

  // Reset
  const resetAll = () => {
    setSettings(DEFAULTS);
    setTempBrightness(DEFAULTS.brightness);
    localStorage.removeItem(settingsKey);
    applySettingsToDOM(DEFAULTS);
    toast.success("✅ " + t("reset"), {
      style: { background: isDark ? "#1a1d2e" : "#fff", color: isDark ? "#f1f5f9" : "#0f172a", fontWeight: "700", fontSize: "13px" },
    });
  };

  // ── Theme tokens
  const bg       = isDark ? "#080b14"   : "#eef1fb";
  const card     = isDark ? "#0f1220"   : "#ffffff";
  const card2    = isDark ? "#141829"   : "#f5f7ff";
  const border   = isDark ? "rgba(255,255,255,.07)" : "rgba(15,23,42,.08)";
  const tPri     = isDark ? "#f0f4ff"   : "#0d1427";
  const tSec     = isDark ? "rgba(240,244,255,.4)"  : "rgba(13,20,39,.45)";
  const tTer     = isDark ? "rgba(240,244,255,.2)"  : "rgba(13,20,39,.25)";
  const acc      = settings.accentColor;
  const accBg    = `${acc}18`;
  const accBdr   = `${acc}33`;
  const inp      = isDark ? "rgba(255,255,255,.05)" : "rgba(13,20,39,.04)";
  const inpBdr   = isDark ? "rgba(255,255,255,.1)"  : "rgba(13,20,39,.12)";

  // ────────────────────────────────────────────────────────────
  return (
    <SettingsContext.Provider value={{ settings, updateSetting: update as any }}>
    <CurrencyContext.Provider value={{ currency: settings.currency, convert, symbol: currencyInfo.symbol, rates: exchangeRates, loading: ratesLoading }}>
    <LanguageContext.Provider value={{ language: settings.language, t }}>
    <div style={{ minHeight:"100vh", background:bg, fontFamily:"'Montserrat',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@500;600;700;800&display=swap');

        .xst * { box-sizing: border-box; }

        /* Compact mode global */
        .xob-compact .xst-row { padding-bottom: 8px !important; margin-bottom: 8px !important; }
        .xob-compact .xst-card { padding: 12px !important; }
        .xob-compact .xst-section { margin-top: 8px !important; padding: 12px !important; }

        /* High contrast */
        .xob-high-contrast { filter: contrast(1.3); }

        /* No animations */
        .xob-no-animations * { animation: none !important; transition: none !important; }

        /* Accent color applied to toggles, sliders */
        .xst-range { -webkit-appearance: none; height:4px; border-radius:4px; outline:none; cursor:pointer; }
        .xst-range::-webkit-slider-thumb { -webkit-appearance:none; width:22px; height:22px; border-radius:50%; background:var(--xob-accent,#2563eb); cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,.25); border:2px solid #fff; }
        .xst-range::-moz-range-thumb { width:22px; height:22px; border-radius:50%; background:var(--xob-accent,#2563eb); cursor:pointer; border:2px solid #fff; }

        /* Scroll */
        .xst-scroll::-webkit-scrollbar { display:none; }
        .xst-scroll { -ms-overflow-style:none; scrollbar-width:none; }

        /* Hover effects */
        .xst-row-btn { transition: background .15s ease, transform .15s ease; }
        .xst-row-btn:hover { background: rgba(255,255,255,.04) !important; }
        .xst-row-btn:active { transform: scale(.98); }

        .xst-pill { transition: all .18s cubic-bezier(.34,1.56,.64,1); }
        .xst-pill:hover { transform: translateY(-1px) scale(1.03); }
        .xst-pill:active { transform: scale(.96); }

        .xst-toggle { transition: background .25s ease; }
        .xst-thumb { transition: left .25s cubic-bezier(.34,1.56,.64,1); }

        .xst-color-dot { transition: all .2s ease; }
        .xst-color-dot:hover { transform: scale(1.18); }

        .xst-btn { transition: all .18s ease; cursor:pointer; }
        .xst-btn:hover { filter:brightness(1.1); transform:translateY(-1px); }
        .xst-btn:active { transform:scale(.97); }

        .xst-section { animation: xst-up .35s both; }
        @keyframes xst-up { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

        select option { background:#1a1d2e; color:#f1f5f9; }

        @media(max-width:600px) {
          .xst-header-inner { flex-direction:column !important; align-items:flex-start !important; }
          .xst-accent-grid  { grid-template-columns:repeat(5,1fr) !important; }
          .xst-currency-grid { grid-template-columns:1fr 1fr !important; }
        }

        /* Preview box */
        .xst-preview-card {
          background: var(--xob-accent,#2563eb);
          border-radius: 16px;
          padding: 14px 18px;
          color: #fff;
          font-weight: 700;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 8px 28px rgba(var(--xob-accent-rgb,37,99,235),.38);
        }
      `}</style>

      {/* ══════════════════════════════════════════════════════
          HEADER
      ══════════════════════════════════════════════════════ */}
      <div style={{
        background: isDark
          ? `linear-gradient(140deg,#0d1427 0%,#111827 60%,${acc}18 100%)`
          : `linear-gradient(140deg,#1e3a8a 0%,#2563eb 60%,#3b82f6 100%)`,
        padding: "clamp(20px,3.5vw,36px) clamp(16px,4vw,36px) 0",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position:"absolute",width:"320px",height:"320px",borderRadius:"50%",background:"rgba(255,255,255,.04)",top:"-100px",right:"-60px",pointerEvents:"none" }} />
        <div style={{ position:"absolute",width:"160px",height:"160px",borderRadius:"50%",background:`${acc}14`,bottom:"-40px",left:"10%",pointerEvents:"none" }} />

        <div style={{ maxWidth:"620px", margin:"0 auto", position:"relative" }}>
          <button className="xst-btn" onClick={() => navigate(-1)} style={{
            display:"inline-flex", alignItems:"center", gap:"6px",
            background:"rgba(255,255,255,.12)", border:"1px solid rgba(255,255,255,.2)",
            borderRadius:"10px", padding:"7px 14px",
            color:"#fff", fontSize:"12px", fontWeight:700, marginBottom:"18px",
          }}>
            ← {t("back")}
          </button>

          <div className="xst-header-inner" style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:"16px", marginBottom:"24px" }}>
            <div>
              <h1 style={{ color:"#fff", fontWeight:900, fontSize:"clamp(22px,4vw,30px)", margin:0, fontFamily:"'Space Grotesk',sans-serif", letterSpacing:"-0.02em" }}>
                ⚙️ {t("settings")}
              </h1>
              <p style={{ color:"rgba(255,255,255,.55)", fontSize:"13px", margin:"5px 0 0" }}>
                {t("customizeExp")}
              </p>
            </div>
            {/* Accent preview pill */}
            <div className="xst-preview-card">
              🛍️ X ONE
            </div>
          </div>

          {/* Tabs / Sections nav */}
          <div className="xst-scroll" style={{ display:"flex", gap:"4px", overflowX:"auto", paddingBottom:"0" }}>
            {[
              { id:"appearance", icon:"🎨", label:t("appearance") },
              { id:"text",       icon:"🔤", label:t("textDisplay") },
              { id:"sound",      icon:"🔊", label:t("sound") },
              { id:"language",   icon:"🌍", label:t("language") },
              { id:"privacy",    icon:"🔒", label:t("privacy") },
            ].map(s => (
              <button key={s.id} className="xst-pill"
                onClick={() => {
                  setActiveSection(s.id);
                  document.getElementById(`xst-${s.id}`)?.scrollIntoView({ behavior:"smooth", block:"start" });
                }}
                style={{
                  padding:"9px 16px", borderRadius:"12px 12px 0 0", border:"none",
                  fontSize:"11px", fontWeight:700, whiteSpace:"nowrap",
                  cursor:"pointer", display:"flex", alignItems:"center", gap:"5px",
                  background: activeSection === s.id ? card : "transparent",
                  color: activeSection === s.id ? acc : "rgba(255,255,255,.55)",
                }}>
                {s.icon} {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          CONTENT
      ══════════════════════════════════════════════════════ */}
      <div className="xst" style={{ maxWidth:"620px", margin:"0 auto", padding:"20px clamp(12px,4vw,20px) 60px" }}>

        {/* ════════════════════════════
            SECTION: APPEARANCE
        ════════════════════════════ */}
        <Section id="appearance" title={`🎨 ${t("appearance")}`} card={card} border={border} tSec={tSec}>

          {/* Dark Mode */}
          <SettingRow icon="🌙" label={t("darkMode")} desc={t("darkModeDesc")} border={border} tPri={tPri} tSec={tSec}>
            <Toggle value={settings.darkMode} acc={acc} onChange={v => update("darkMode", v, `${v ? "🌙 Dark" : "☀️ Light"} mode ${t("saved")}`)} />
          </SettingRow>

          {/* Accent Color */}
          <SettingRow icon="🎨" label={t("accentColor")} desc={t("accentColorDesc")} border={border} tPri={tPri} tSec={tSec} vertical>
            <div className="xst-accent-grid" style={{ display:"grid", gridTemplateColumns:"repeat(10,1fr)", gap:"8px", marginTop:"12px" }}>
              {ACCENT_COLORS.map(c => (
                <button key={c.value} className="xst-color-dot"
                  onClick={() => update("accentColor", c.value, `🎨 ${c.label} ${t("saved")}`)}
                  title={c.label}
                  style={{
                    width:"100%", aspectRatio:"1", borderRadius:"50%",
                    background:c.value, border:"none", cursor:"pointer",
                    boxShadow: settings.accentColor === c.value
                      ? `0 0 0 3px ${isDark ? "#0f1220" : "#fff"}, 0 0 0 5px ${c.value}, 0 6px 16px ${c.value}66`
                      : "0 2px 6px rgba(0,0,0,.18)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    transform: settings.accentColor === c.value ? "scale(1.15)" : "scale(1)",
                    transition:"all .2s cubic-bezier(.34,1.56,.64,1)",
                  }}>
                  {settings.accentColor === c.value && (
                    <span style={{ color:"#fff", fontSize:"11px", fontWeight:900 }}>✓</span>
                  )}
                </button>
              ))}
            </div>
            {/* Color preview bar */}
            <div style={{ marginTop:"12px", height:"6px", borderRadius:"6px", background:`linear-gradient(90deg,${ACCENT_COLORS.map(c=>c.value).join(",")})`, opacity:.5 }} />
          </SettingRow>

          {/* High Contrast */}
          <SettingRow icon="👁️" label={t("highContrast")} desc={t("highContrastDesc")} border={border} tPri={tPri} tSec={tSec}>
            <Toggle value={settings.highContrast} acc={acc} onChange={v => update("highContrast", v, `👁️ High contrast ${v ? "on" : "off"}`)} />
          </SettingRow>

          {/* Compact Mode */}
          <SettingRow icon="📐" label={t("compactMode")} desc={t("compactModeDesc")} border={border} tPri={tPri} tSec={tSec}>
            <Toggle value={settings.compactMode} acc={acc} onChange={v => update("compactMode", v, `📐 Compact mode ${v ? "on" : "off"}`)} />
          </SettingRow>

          {/* Animations */}
          <SettingRow icon="✨" label={t("animations")} desc={t("animationsDesc")} border={border} tPri={tPri} tSec={tSec}>
            <Toggle value={settings.animations} acc={acc} onChange={v => update("animations", v, `✨ Animations ${v ? "on" : "off"}`)} />
          </SettingRow>

          {/* Reduced Motion */}
          <SettingRow icon="♿" label={t("reducedMotion")} desc={t("reducedMotionDesc")} border={border} tPri={tPri} tSec={tSec} last>
            <Toggle value={settings.reducedMotion} acc={acc} onChange={v => update("reducedMotion", v, `♿ Reduced motion ${v ? "on" : "off"}`)} />
          </SettingRow>
        </Section>

        {/* ════════════════════════════
            SECTION: TEXT & DISPLAY
        ════════════════════════════ */}
        <Section id="text" title={`🔤 ${t("textDisplay")}`} card={card} border={border} tSec={tSec}>

          {/* Font Size */}
          <SettingRow icon="🔤" label={t("fontSize")} desc={t("fontSizeDesc")} border={border} tPri={tPri} tSec={tSec} vertical>
            <div style={{ display:"flex", gap:"8px", marginTop:"12px" }}>
              {(["small","medium","large","xlarge"] as const).map((sz, i) => {
                const labels = [t("small"), t("medium"), t("large"), t("xlarge")];
                const pxs    = ["13px","15px","17px","20px"];
                const active = settings.fontSize === sz;
                return (
                  <button key={sz} className="xst-pill"
                    onClick={() => update("fontSize", sz, `🔤 Font size: ${labels[i]}`)}
                    style={{
                      flex:1, padding:"10px 6px", borderRadius:"12px",
                      background: active ? acc : inp,
                      border: `1.5px solid ${active ? acc : inpBdr}`,
                      color: active ? "#fff" : tSec,
                      fontSize: pxs[i], fontWeight:800, cursor:"pointer",
                      display:"flex", flexDirection:"column", alignItems:"center", gap:"4px",
                    }}>
                    A
                    <span style={{ fontSize:"9px", fontWeight:600, letterSpacing:"0.04em", opacity:.8 }}>
                      {labels[i]}
                    </span>
                  </button>
                );
              })}
            </div>
          </SettingRow>

          {/* Brightness */}
          <SettingRow icon="☀️" label={t("brightness")} desc={`${t("brightnessDesc")} — ${settings.brightness}%`} border={border} tPri={tPri} tSec={tSec} last vertical>
            <div style={{ marginTop:"14px" }}>
              {/* Android-style brightness bar */}
              <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                <span style={{ fontSize:"14px", opacity:.5 }}>🔅</span>
                <div style={{ flex:1, position:"relative" }}>
                  <div style={{
                    position:"absolute", top:"50%", left:0,
                    width:`${settings.brightness}%`, height:"4px",
                    background:`linear-gradient(90deg,${acc}88,${acc})`,
                    borderRadius:"4px", transform:"translateY(-50%)",
                    transition:"width .1s",
                  }} />
                  <input
                    type="range" min={30} max={100} step={1}
                    value={settings.brightness}
                    onChange={e => handleBrightnessChange(Number(e.target.value))}
                    className="xst-range"
                    style={{
                      width:"100%", position:"relative", zIndex:1,
                      background:`rgba(255,255,255,.12)`,
                      accentColor: acc,
                    }}
                  />
                </div>
                <span style={{ fontSize:"18px" }}>🔆</span>
                <span style={{
                  fontSize:"13px", fontWeight:900, color:acc,
                  minWidth:"42px", textAlign:"right",
                  fontFamily:"'Space Grotesk',sans-serif",
                }}>
                  {settings.brightness}%
                </span>
              </div>
              {/* Brightness level indicators */}
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:"6px" }}>
                {[30,50,70,85,100].map(v => (
                  <button key={v} className="xst-pill"
                    onClick={() => handleBrightnessChange(v)}
                    style={{
                      padding:"4px 10px", borderRadius:"8px", fontSize:"10px", fontWeight:700,
                      background: settings.brightness === v ? acc : inp,
                      border: `1px solid ${settings.brightness === v ? acc : inpBdr}`,
                      color: settings.brightness === v ? "#fff" : tSec,
                      cursor:"pointer",
                    }}>
                    {v}%
                  </button>
                ))}
              </div>
            </div>
          </SettingRow>
        </Section>

        {/* ════════════════════════════
            SECTION: SOUND
        ════════════════════════════ */}
        <Section id="sound" title={`🔊 ${t("sound")} & ${t("notifications")}`} card={card} border={border} tSec={tSec}>

          {/* Sound Effects Toggle */}
          <SettingRow icon="🔊" label={t("sound")} desc={t("soundDesc")} border={border} tPri={tPri} tSec={tSec}>
            <Toggle value={settings.soundEffects} acc={acc}
              onChange={v => {
                update("soundEffects", v, `🔊 Sound effects ${v ? "on" : "off"}`);
                if (v) {
                  const s = CLICK_SOUNDS.find(c => c.id === settings.clickSound) || CLICK_SOUNDS[0];
                  setTimeout(() => playSound(s.url), 200);
                }
              }} />
          </SettingRow>

          {/* Sound Style */}
          {settings.soundEffects && (
            <SettingRow icon="🎵" label={t("soundStyle")} desc={t("soundStyleDesc")} border={border} tPri={tPri} tSec={tSec} vertical>
              <div style={{ display:"flex", gap:"8px", marginTop:"12px", flexWrap:"wrap" }}>
                {CLICK_SOUNDS.map(s => {
                  const active = settings.clickSound === s.id;
                  return (
                    <button key={s.id} className="xst-pill"
                      onClick={() => {
                        update("clickSound", s.id, `🎵 Sound: ${s.label}`, false);
                        playSound(s.url);
                      }}
                      style={{
                        padding:"10px 18px", borderRadius:"12px",
                        background: active ? acc : inp,
                        border: `1.5px solid ${active ? acc : inpBdr}`,
                        color: active ? "#fff" : tSec,
                        fontSize:"13px", fontWeight:700, cursor:"pointer",
                        display:"flex", alignItems:"center", gap:"6px",
                      }}>
                      {active ? "▶ " : ""}{s.label}
                      {active && <span style={{ fontSize:"9px", background:"rgba(255,255,255,.2)", padding:"2px 6px", borderRadius:"100px" }}>Active</span>}
                    </button>
                  );
                })}
              </div>
              {/* Test sound btn */}
              <button className="xst-btn"
                onClick={() => {
                  const s = CLICK_SOUNDS.find(c => c.id === settings.clickSound) || CLICK_SOUNDS[0];
                  playSound(s.url);
                  toast("🔊 " + t("preview"), { duration:1200, style:{ fontSize:"13px", fontWeight:"700" } });
                }}
                style={{
                  marginTop:"10px", padding:"8px 16px", borderRadius:"10px",
                  background:accBg, border:`1px solid ${accBdr}`,
                  color:acc, fontSize:"12px", fontWeight:700, cursor:"pointer",
                }}>
                ▶ {t("preview")} sound
              </button>
            </SettingRow>
          )}

          {/* Notifications */}
          <SettingRow icon="🔔" label={t("notifications")} desc={t("notificationsDesc")} border={border} tPri={tPri} tSec={tSec} last>
            <Toggle value={settings.notifications} acc={acc}
              onChange={v => update("notifications", v, `🔔 Notifications ${v ? "on" : "off"}`)} />
          </SettingRow>
        </Section>

        {/* ════════════════════════════
            SECTION: LANGUAGE & REGION
        ════════════════════════════ */}
        <Section id="language" title={`🌍 ${t("language")}`} card={card} border={border} tSec={tSec}>

          {/* Language */}
          <SettingRow icon="🌐" label={t("languageLabel")} desc={t("languageDesc")} border={border} tPri={tPri} tSec={tSec} vertical>
            <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", marginTop:"12px" }}>
              {LANGUAGES.map(lang => {
                const active = settings.language === lang.name;
                return (
                  <button key={lang.code} className="xst-pill"
                    onClick={() => update("language", lang.name, `🌐 Language: ${lang.name}`)}
                    style={{
                      padding:"10px 16px", borderRadius:"12px",
                      background: active ? acc : inp,
                      border: `1.5px solid ${active ? acc : inpBdr}`,
                      color: active ? "#fff" : tSec,
                      fontSize:"13px", fontWeight:700, cursor:"pointer",
                      display:"flex", flexDirection:"column", alignItems:"center", gap:"2px",
                    }}>
                    <span>{lang.native}</span>
                    <span style={{ fontSize:"9px", opacity:.7 }}>{lang.name}</span>
                  </button>
                );
              })}
            </div>
          </SettingRow>

          {/* Currency */}
          <SettingRow icon="💱" label={t("currency")} desc={t("currencyDesc")} border={border} tPri={tPri} tSec={tSec} vertical>
            <div className="xst-currency-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"8px", marginTop:"12px" }}>
              {CURRENCY_LIST.map(c => {
                const active = settings.currency === c.code;
                return (
                  <button key={c.code} className="xst-pill"
                    onClick={() => update("currency", c.code, `💱 Currency: ${c.code} ${c.symbol}`)}
                    style={{
                      padding:"12px 8px", borderRadius:"12px",
                      background: active ? acc : inp,
                      border: `1.5px solid ${active ? acc : inpBdr}`,
                      color: active ? "#fff" : tSec,
                      cursor:"pointer", textAlign:"center",
                    }}>
                    <p style={{ margin:0, fontSize:"18px", fontWeight:900, fontFamily:"'Space Grotesk',sans-serif" }}>{c.symbol}</p>
                    <p style={{ margin:"3px 0 0", fontSize:"10px", fontWeight:700, letterSpacing:"0.04em" }}>{c.code}</p>
                    <p style={{ margin:"2px 0 0", fontSize:"8px", opacity:.65, lineHeight:1.3 }}>{c.name}</p>
                  </button>
                );
              })}
            </div>

            {/* Exchange rates display */}
            <div style={{ marginTop:"14px", padding:"14px", borderRadius:"14px", background:isDark?"rgba(255,255,255,.03)":card2, border:`1px solid ${border}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px" }}>
                <p style={{ margin:0, fontSize:"11px", fontWeight:800, color:tSec, textTransform:"uppercase", letterSpacing:"0.08em" }}>
                  {t("currencyRates")} (1 INR =)
                </p>
                {ratesLoading && <div style={{ width:"14px", height:"14px", border:`2px solid ${accBg}`, borderTopColor:acc, borderRadius:"50%", animation:"xst-spin 1s linear infinite" }} />}
                {ratesError && <span style={{ fontSize:"10px", color:"#f59e0b" }}>⚠️ Offline rates</span>}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"6px" }}>
                {CURRENCY_LIST.filter(c => c.code !== "INR").map(c => {
                  const rate = exchangeRates[c.code];
                  return (
                    <div key={c.code} style={{
                      padding:"8px", borderRadius:"10px", textAlign:"center",
                      background: settings.currency === c.code ? accBg : (isDark?"rgba(255,255,255,.03)":"rgba(0,0,0,.02)"),
                      border: `1px solid ${settings.currency === c.code ? accBdr : border}`,
                    }}>
                      <p style={{ margin:0, fontSize:"11px", fontWeight:800, color: settings.currency === c.code ? acc : tPri }}>{c.symbol}</p>
                      <p style={{ margin:"2px 0 0", fontSize:"9px", color:tTer }}>{c.code}</p>
                      <p style={{ margin:"2px 0 0", fontSize:"10px", fontWeight:700, color:tSec }}>
                        {rate ? rate.toFixed(4) : t("loading")}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live price preview */}
            <div style={{ marginTop:"12px", padding:"14px", borderRadius:"14px", background:accBg, border:`1px solid ${accBdr}` }}>
              <p style={{ margin:"0 0 8px", fontSize:"10px", fontWeight:800, color:acc, textTransform:"uppercase", letterSpacing:"0.08em" }}>
                💡 Price Preview
              </p>
              <div style={{ display:"flex", gap:"10px", flexWrap:"wrap" }}>
                {[399, 999, 1499, 2999].map(inr => (
                  <div key={inr} style={{ padding:"8px 14px", borderRadius:"10px", background:card, border:`1px solid ${border}` }}>
                    <p style={{ margin:0, fontSize:"10px", color:tTer }}>₹{inr}</p>
                    <p style={{ margin:"2px 0 0", fontSize:"14px", fontWeight:900, color:acc, fontFamily:"'Space Grotesk',sans-serif" }}>
                      {convert(inr)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </SettingRow>

        </Section>

        {/* ════════════════════════════
            SECTION: PRIVACY
        ════════════════════════════ */}
        <Section id="privacy" title={`🔒 ${t("privacy")}`} card={card} border={border} tSec={tSec}>
          <SettingRow icon="▶️" label={t("autoPlay")} desc={t("autoPlayDesc")} border={border} tPri={tPri} tSec={tSec} last>
            <Toggle value={settings.autoPlayVideos} acc={acc}
              onChange={v => update("autoPlayVideos", v, `▶️ Auto-play ${v ? "on" : "off"}`)} />
          </SettingRow>
        </Section>

        {/* ════════════════════════════
            RESET
        ════════════════════════════ */}
        <button className="xst-btn"
          onClick={resetAll}
          style={{
            width:"100%", marginTop:"16px",
            display:"flex", alignItems:"center", justifyContent:"center", gap:"10px",
            padding:"16px", borderRadius:"18px",
            background: isDark ? "rgba(239,68,68,.08)" : "#fff5f5",
            border:"1.5px solid rgba(239,68,68,.18)",
            color:"#ef4444", fontWeight:800, fontSize:"14px",
          }}>
          🔄 {t("reset")}
          <span style={{ fontSize:"11px", fontWeight:600, opacity:.7 }}>— {t("resetDesc")}</span>
        </button>

        {/* App version */}
        <p style={{ textAlign:"center", fontSize:"10px", color:tTer, marginTop:"24px", fontWeight:600, letterSpacing:"0.06em" }}>
          X ONE BOUTIQUE · v2.0 · Settings
        </p>
      </div>

      <style>{`
        @keyframes xst-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
    </LanguageContext.Provider>
    </CurrencyContext.Provider>
    </SettingsContext.Provider>
  );
}

// ────────────────────────────────────────────────────────────────
//  SUB-COMPONENTS
// ────────────────────────────────────────────────────────────────
function Section({ id, title, children, card, border, tSec }: {
  id: string; title: string; children: ReactNode;
  card: string; border: string; tSec: string;
}) {
  return (
    <div id={`xst-${id}`} className="xst-section" style={{
      background:card, border:`1px solid ${border}`,
      borderRadius:"20px", padding:"18px 20px",
      marginTop:"14px", boxShadow:"0 2px 16px rgba(0,0,0,.05)",
    }}>
      <h2 style={{ fontSize:"11px", fontWeight:800, color:tSec, textTransform:"uppercase", letterSpacing:"0.12em", margin:"0 0 16px" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function SettingRow({ icon, label, desc, children, border, tPri, tSec, last, vertical }: {
  icon: string; label: string; desc: string; children: ReactNode;
  border: string; tPri: string; tSec: string; last?: boolean; vertical?: boolean;
}) {
  return (
    <div className="xst-row" style={{
      borderBottom: last ? "none" : `1px solid ${border}`,
      paddingBottom: last ? 0 : "16px",
      marginBottom: last ? 0 : "16px",
    }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"12px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px", flex:1, minWidth:0 }}>
          <span style={{ fontSize:"20px", flexShrink:0, lineHeight:1 }}>{icon}</span>
          <div style={{ minWidth:0 }}>
            <p style={{ margin:0, fontSize:"14px", fontWeight:700, color:tPri }}>{label}</p>
            <p style={{ margin:"2px 0 0", fontSize:"11px", color:tSec, lineHeight:1.45 }}>{desc}</p>
          </div>
        </div>
        {!vertical && <div style={{ flexShrink:0 }}>{children}</div>}
      </div>
      {vertical && <div>{children}</div>}
    </div>
  );
}

function Toggle({ value, onChange, acc }: {
  value: boolean; onChange: (v: boolean) => void; acc: string;
}) {
  return (
    <button
      className="xst-toggle"
      onClick={() => onChange(!value)}
      style={{
        width:"50px", height:"28px", borderRadius:"14px",
        background: value ? acc : "rgba(148,163,184,.25)",
        border:"none", cursor:"pointer", position:"relative",
        boxShadow: value ? `0 4px 12px ${acc}44` : "none",
      }}>
      <div className="xst-thumb" style={{
        position:"absolute",
        width:"22px", height:"22px", borderRadius:"50%",
        background:"#fff", top:"3px",
        left: value ? "25px" : "3px",
        boxShadow:"0 2px 6px rgba(0,0,0,.22)",
      }} />
    </button>
  );
}