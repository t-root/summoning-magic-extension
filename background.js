chrome.action.onClicked.addListener((tab) => {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/logo48.png',
      title: 'Summoning Magic',
      message: 'Thuật triệu hồi đã kích hoạt thành công!',
      priority: 2
    });
  });
  