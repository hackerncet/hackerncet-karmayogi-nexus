"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import { Languages, Moon, Sun } from "lucide-react";
const labels = {
  en: {
    dashboard: "Overview",
    competencies: "Competency passport",
    diagnostic: "Diagnostics",
    gaps: "Skill gaps",
    recommendations: "Recommended for you",
    paths: "Learning paths",
    catalog: "Course catalogue",
    labs: "Mission labs",
    assessments: "Assessments",
    tutor: "Learning assistant",
    progress: "My progress",
    profile: "My profile",
    settings: "Settings",
    trainer: "Trainer studio",
    admin: "Organization",
    search: "Search courses and competencies",
    welcome: "Welcome back",
    demo: "Demonstration",
    continue: "Continue learning",
  },
  hi: {
    dashboard: "अवलोकन",
    competencies: "दक्षता पासपोर्ट",
    diagnostic: "प्रारंभिक आकलन",
    gaps: "कौशल अंतर",
    recommendations: "आपके लिए सुझाव",
    paths: "सीखने के पथ",
    catalog: "पाठ्यक्रम सूची",
    labs: "अभ्यास प्रयोगशाला",
    assessments: "आकलन",
    tutor: "अध्ययन सहायक",
    progress: "मेरी प्रगति",
    profile: "मेरी प्रोफ़ाइल",
    settings: "सेटिंग्स",
    trainer: "प्रशिक्षक स्टूडियो",
    admin: "संगठन",
    search: "पाठ्यक्रम और दक्षता खोजें",
    welcome: "फिर से स्वागत है",
    demo: "प्रदर्शन",
    continue: "सीखना जारी रखें",
  },
};
type Key = keyof typeof labels.en;
const Context = createContext({
  locale: "en" as "en" | "hi",
  t: (k: Key): string => labels.en[k],
  setLocale: (_l: "en" | "hi") => {
    void _l;
  },
});
export function Preferences({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<"en" | "hi">("en");
  return (
    <Context.Provider
      value={{ locale, setLocale, t: (k) => labels[locale][k] }}
    >
      {children}
    </Context.Provider>
  );
}
export const usePreferences = () => useContext(Context);
export function PreferenceControls() {
  const { locale, setLocale } = usePreferences();
  const [dark, setDark] = useState(false);
  return (
    <div className="preference-controls">
      <label className="language-control">
        <Languages size={16} aria-hidden />
        <span className="sr-only">Interface language</span>
        <select
          aria-label="Interface language"
          value={locale}
          onChange={(e) => {
            const l = e.target.value as "en" | "hi";
            setLocale(l);
            document.documentElement.lang = l;
          }}
        >
          <option value="en">English</option>
          <option value="hi">हिन्दी</option>
        </select>
      </label>
      <button
        className="icon-button"
        aria-label={dark ? "Use light theme" : "Use dark theme"}
        onClick={() => {
          document.documentElement.dataset.theme = dark ? "light" : "dark";
          setDark(!dark);
        }}
      >
        {dark ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </div>
  );
}
