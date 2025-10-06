window.amplitude.add(window.sessionReplay.plugin({ sampleRate: 1 }));

window.amplitude.init("5f9c6d8af1fb6d26924ad4f9a016840b", {
  fetchRemoteConfig: true,
  autocapture: {
    attribution: true,
    fileDownloads: false,
    formInteractions: false,
    pageViews: true,
    sessions: true,
    elementInteractions: false,
    networkTracking: false,
    webVitals: false,
    frustrationInteractions: true,
  },
});
