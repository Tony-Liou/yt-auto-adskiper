(async function () {
  const classNameList = ['ytp-ad-skip-button ytp-button', 'ytp-ad-overlay-close-button'];

  function getElements(classNames: string[]): Element[] {
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
    if (typeof el.dispatchEvent !== 'function') {
      return;
    }

    const evt = new MouseEvent('click', {bubbles: true, cancelable: false});
    el.dispatchEvent(evt);
  }

  /**
   * Get *ytd-player* element and create a MutationObserver to listen it.
   *
   * @return `true` if succeed; otherwise, `false`
   */
  function initObserver(): boolean {
    const ytdPlayer = document.getElementById('ytd-player');
    if (ytdPlayer === null) {
      return false;
    }

    const mutObserver = new MutationObserver(() => getAndClickButtons());
    mutObserver.observe(ytdPlayer, {childList: true, subtree: true});

    return true;
  }

  function sleep(ms: number): Promise<unknown> {
    return new Promise(r => setTimeout(r, ms));
  }

  for (let failCount = 0; !initObserver() && failCount < 5; failCount++) {
    await sleep(1000);
  }
})();
