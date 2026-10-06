(() => {
  const MEASUREMENT_ID = "G-BV3P14PT6H";
  const STORAGE_KEY = "plane-head-hunt-analytics-consent";
  const consentPanel = document.querySelector("#analyticsConsent");
  const allowButton = document.querySelector("#analyticsAllowButton");
  const necessaryButton = document.querySelector("#analyticsNecessaryButton");
  const privacyButton = document.querySelector("#analyticsPrivacyButton");

  if (!consentPanel || !allowButton || !necessaryButton) return;

  function readChoice() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  function saveChoice(choice) {
    try {
      localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // The current choice still applies for this page when storage is unavailable.
    }
  }

  function loadGoogleAnalytics() {
    if (window.googleAnalyticsLoaded) return;
    window.googleAnalyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag("consent", "default", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });
    window.gtag("js", new Date());
    window.gtag("config", MEASUREMENT_ID, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    document.head.append(script);
  }

  function choose(choice) {
    saveChoice(choice);
    consentPanel.hidden = true;
    if (choice === "granted") {
      loadGoogleAnalytics();
      window.gtag("consent", "update", { analytics_storage: "granted" });
    } else if (window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied"
      });
    }
  }

  allowButton.addEventListener("click", () => choose("granted"));
  necessaryButton.addEventListener("click", () => choose("denied"));
  privacyButton?.addEventListener("click", () => { consentPanel.hidden = false; });

  const savedChoice = readChoice();
  if (savedChoice === "granted") loadGoogleAnalytics();
  else if (savedChoice !== "denied") consentPanel.hidden = false;

  window.GameAnalytics = {
    hasConsent: () => readChoice() === "granted",
    openSettings: () => { consentPanel.hidden = false; },
    track(name, parameters = {}) {
      if (readChoice() !== "granted") return;
      loadGoogleAnalytics();
      window.gtag("event", name, parameters);
    }
  };
})();
