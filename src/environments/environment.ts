export const environment = {
  firebase: {
    projectId: 'actinsightorg',
    appId: '1:121111149124:web:5f06440e238ab418959a11',
    storageBucket: 'actinsightorg.appspot.com',
    locationId: 'us-central',
    apiKey: 'AIzaSyDDw6CbCFKIMXen8_1Army8OhiwjO0kFBw',
    authDomain: 'actinsightorg.firebaseapp.com',
    messagingSenderId: '121111149124',
    measurementId: 'G-W6QX5QGMQC',
  },
  production: false,
  muteProdLogs: true,

  // tag line
  tagLine: 'Better insights into collective climate actions',
  shortTagLine: 'Insights into climate actions',

  // small screen flag
  smallScreenSizeManualCutoff: 550,

  // Toast message
  toastMessageDuration: 4000,

  // data end-point
  secondaryDataUrl:
    'https://us-central1-actinsightorg.cloudfunctions.net/getLatestSecondaryData',
  nbHttpRetries: 5,

  // live queries API end-point
  queryApiBaseUrl:
    'https://us-central1-actinsightorg.cloudfunctions.net/data-sharing',

  // tsEndPointUrl
  // tsEndPointUrl: 'kmo3bjsge6q9lr4tp-1.a1.typesense.net',
  // tsEndPointPort: 443,
  // searchOnlyKey: 'oFF7WdSqOKswsIPomnza6DZupj6mB4wD',
  minQueryLength: 2,

  // T&Cs
  privacyPolicyUrl: 'https://valuegrid.io/privacy',
  termsUrl: 'https://valuegrid.io/terms',
  cookiesUrl: 'https://valuegrid.io/cookies',
};
