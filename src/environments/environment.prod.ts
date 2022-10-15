export const environment = {
  // dev TODO: use your own config here
  firebase: {
    projectId: "",
    appId: "",
    storageBucket: "",
    locationId: "",
    apiKey: "",
    authDomain: "",
    messagingSenderId: "",
    measurementId: "",
  },
  production: true,
  muteProdLogs: true,

  // tag line
  tagLine: "Better insights into collective climate actions",
  shortTagLine: "Insights into climate actions",

  // small screen flag
  smallScreenSizeManualCutoff: 550,

  // Toast message
  toastMessageDuration: 4000,

  // data end-point
  secondaryDataUrl:
    "https://us-central1-actinsightorg.cloudfunctions.net/getLatestSecondaryData",
  nbHttpRetries: 5,

  // live queries API end-point
  queryApiBaseUrl:
    "https://us-central1-actinsightorg.cloudfunctions.net/data-sharing",
  minQueryLength: 2,

  // T&Cs
  privacyPolicyUrl: "https://valuegrid.io/privacy",
  termsUrl: "https://valuegrid.io/terms",
  cookiesUrl: "https://valuegrid.io/cookies",
};
