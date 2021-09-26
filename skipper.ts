(function () {
  const classNameList = [
    'ytp-ad-skip-button ytp-button',
    'ytp-ad-overlay-close-button'
  ];

  function getElements(classNames: Array<string>): Element[] {
    return classNames
      .map(name => Array.from(document.getElementsByClassName(name)) || [])
      .reduce((acc, elems) => acc.concat(elems), []);
  }

  function getAndClickButtons() {
    getElements(classNameList).forEach(button => {
      triggerClick(button);
    });
  }

  function triggerClick(el: Element) {
    if (typeof el.dispatchEvent === 'function') {
      const evt = new MouseEvent('click', {bubbles: true, cancelable: false});
      el.dispatchEvent(evt);
    }
  }

  function triggerClickWhenVisible(button: HTMLElement) {
    let parentWithDisplayStyle: HTMLElement | null = null;
    for (let curParent: HTMLElement | null = button; curParent !== null; curParent = curParent.parentElement) {
      if (curParent.style.display === 'none') {
        parentWithDisplayStyle = curParent;
        break;
      }
    }

    if (parentWithDisplayStyle === null) {
      return;
    }
  }

  function initObserver(): boolean {
    const ytdPlayer = document.getElementById('ytd-player');
    if (ytdPlayer === null) {
      return false;
    }

    const mutObserver = new MutationObserver(() => getAndClickButtons());
    mutObserver.observe(ytdPlayer, {childList: true, subtree: true});

    return true;
  }

  initObserver();
})();
