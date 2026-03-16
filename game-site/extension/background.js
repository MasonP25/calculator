chrome.action.onClicked.addListener(function() {
  chrome.windows.create({
    url: 'https://masonp25.github.io/calculator/game-site/',
    type: 'popup',
    width: 450,
    height: 700
  });
});
