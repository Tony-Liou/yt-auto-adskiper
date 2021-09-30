(async () => {
  const classNameList = ['ytp-ad-skip-button ytp-button', 'ytp-ad-overlay-close-button'];

  let observedSkipBtn: Element | undefined;
  let skipBtnObserver: MutationObserver | undefined;
  let ytdPlayer: HTMLElement | null;

  function getElements(classNames: string[]): Element[] {
    return classNames
      .map(name => Array.from(ytdPlayer!.getElementsByClassName(name)))
      .reduce((acc, elems) => acc.concat(elems), []);
  }

  function getAndClickButtons() {
    getElements(classNameList).forEach(button => {
      if (!isVisible(button as HTMLElement)) {
        observeButton(button);
      } else {
        triggerClick(button);
      }
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
   * Check the `display: none`
   *
   * @param el - The element you want to check
   *
   * @return `true` if it is invisible on the screen; otherwise, `false`
   */
  function isVisible(el: HTMLElement): boolean {
    return el.offsetParent !== null;
  }

  /**
   * Create a new MutationObserver to monitor the button.
   * Once it is visible, it will be clicked.
   *
   * @param button - The element need to be observed
   */
  function observeButton(button: Element) {
    if (button === observedSkipBtn) {
      return;
    }

    let parentWithDisplayStyle: HTMLElement | undefined;
    for (let curParent: HTMLElement | null = button as HTMLElement; curParent !== null; curParent = curParent.parentElement) {
      if (curParent.style.display === 'none') {
        parentWithDisplayStyle = curParent;
        break;
      }
    }

    if (parentWithDisplayStyle === undefined) {
      return;
    }

    if (skipBtnObserver && observedSkipBtn) {
      skipBtnObserver.disconnect();
      triggerClick(observedSkipBtn);
    } else if (!skipBtnObserver) {
      skipBtnObserver = new MutationObserver(() => {
        if (observedSkipBtn !== undefined && !isVisible(observedSkipBtn as HTMLElement)) {
          return;
        }

        if (observedSkipBtn !== undefined) {
          triggerClick(observedSkipBtn);
        }
        observedSkipBtn = undefined;
        if (skipBtnObserver !== undefined) {
          skipBtnObserver.disconnect();
        }
      });
    }

    observedSkipBtn = button;

    skipBtnObserver.observe(parentWithDisplayStyle, {attributes: true});
  }

  /**
   * Get *ytd-player* element and create a MutationObserver to listen to it.
   *
   * @return `true` if succeed; otherwise, `false`
   */
  function initObserver(): boolean {
    ytdPlayer = document.getElementById('ytd-player');
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

  const maxRetryCount = 5;
  for (let failCount = 0; failCount < maxRetryCount; failCount++) {
    if (initObserver()) {
      console.debug('MutationObserver initialized successfully.');
      break;
    }

    await sleep(1000);
  }
})();