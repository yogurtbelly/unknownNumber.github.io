// ==========================================
// VISUAL NOVEL — DIALOGUE ENGINE
// ==========================================

(function () {

  // ==========================================
  // STORY DATA
  // ==========================================
  //
  // Each node has:
  //   messages  – array of { from: 'them'|'you', text }
  //   choices   – array of { text, next: nodeId }  (omit for end nodes)
  //   end       – true to mark a terminal node
  //

  // The story graph, endings and badges live in story.js
  const NOVEL = window.NOVEL;
  const STORY = NOVEL.STORY;


  // ==========================================
  // DOM REFERENCES
  // ==========================================

  const aboutEl       = document.getElementById('about');
  const gameEl        = document.getElementById('game');
  const log           = gameEl.querySelector('.game-log');
  const choices       = gameEl.querySelector('.game-choices');
  const closeBtn      = gameEl.querySelector('.game-close');
  const activeContact = gameEl.querySelector('.game-contact.is-active');
  const previewEl     = activeContact ? activeContact.querySelector('.game-contact-preview') : null;
  const dotEl         = activeContact ? activeContact.querySelector('.game-contact-dot') : null;
  const taskbarApp    = document.getElementById('win-taskbar-app');

  let running = false;
  let aborted = false;


  // ==========================================
  // AUDIO NOTIFICATIONS
  // ==========================================

  let receiveAudio = null;
  let sentAudio = null;
  let soundEnabled = true;

  try {
    receiveAudio = new Audio('760369__froey__message-receive.wav');
    receiveAudio.preload = 'auto';
    sentAudio = new Audio('760370__froey__message-sent.wav');
    sentAudio.preload = 'auto';
  } catch (err) {}

  function playSound(type) {
    if (!soundEnabled) return;
    try {
      const audio = type === 'sent' ? sentAudio : receiveAudio;
      if (!audio) return;
      audio.currentTime = 0;
      const promise = audio.play();
      if (promise !== undefined) {
        promise.catch(function () {});
      }
    } catch (e) {}
  }


  // ==========================================
  // SIDEBAR SYNC HELPERS
  // ==========================================

  function updateSidebarPreview(text) {
    if (previewEl) {
      previewEl.textContent = text;
    }
  }

  function removeNotificationDot() {
    if (dotEl) {
      dotEl.classList.add('is-hidden');
    }
  }

  function resetNotificationDot() {
    if (dotEl) {
      dotEl.classList.remove('is-hidden');
    }
  }


  // ==========================================
  // DESKTOP MODE (shared by Messages, Timeline, Badges, Settings)
  // ==========================================

  let desktopOn = false;

  // Bumped whenever the chat is launched, closed, restarted or reset,
  // so any in-flight story playback from an older session stops itself.
  let session = 0;

  function enterDesktop() {
    if (desktopOn) return;
    desktopOn = true;

    // Mark desktop as active right away so scroll scripts instantly halt and don't overwrite words
    if (aboutEl) {
      aboutEl.classList.add('game-active');
      aboutEl.classList.add('mail-leave-left');
    }
    document.body.classList.add('game-open');

    // Move words to the left one by one similar to scroll animation
    const words = aboutEl ? aboutEl.querySelectorAll('[data-fly] .word') : [];
    const w = window.innerWidth || 1920;
    words.forEach(function (el, i) {
      el.style.transition = 'transform 0.55s cubic-bezier(0.5, 0, 0.8, 0.3), opacity 0.4s ease';
      el.style.transitionDelay = (140 + i * 15) + 'ms';
      el.style.transform = 'translateX(-' + (w + 200) + 'px)';
      el.style.opacity = '0';
    });
  }

  function exitDesktop() {
    if (!desktopOn) return;
    desktopOn = false;

    if (aboutEl) {
      aboutEl.classList.remove('game-active');
    }
    document.body.classList.remove('game-open');

    // Return words and mail from the left back into place
    setTimeout(function () {
      if (desktopOn) return;

      if (aboutEl) {
        aboutEl.classList.remove('mail-leave-left');
      }

      const words = aboutEl ? aboutEl.querySelectorAll('[data-fly] .word') : [];
      words.forEach(function (el) {
        el.style.transition = 'transform 0.65s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.5s ease';
        el.style.transitionDelay = '0s';
        el.style.transform = 'translateX(0px)';
        el.style.opacity = '1';
      });

      // Clear inline transition after animation finishes so scroll engine has clean control
      setTimeout(function () {
        if (desktopOn) return;
        words.forEach(function (el) {
          el.style.transition = '';
          el.style.transitionDelay = '';
        });
      }, 700);
    }, 200);
  }


  // ==========================================
  // LAUNCH GAME
  // ==========================================

  function launch() {
    if (running) return;

    running = true;
    aborted = false;
    session++;
    const mySession = session;

    // Reset chat log and choices
    log.innerHTML     = '';
    choices.innerHTML = '';
    choices.classList.remove('is-visible');

    // Reset notification dot & initial preview
    resetNotificationDot();
    updateSidebarPreview('lia?');

    enterDesktop();
    if (taskbarApp) {
      taskbarApp.classList.add('is-active');
    }

    // Slide the game from the right to the center
    setTimeout(function () {
      if (aborted || mySession !== session) return;

      gameEl.classList.add('is-active');
      gameEl.removeAttribute('aria-hidden');
      focusWin(gameEl);
    }, 450);

    // Start visual novel dialogue after window settles
    setTimeout(function () {
      if (aborted || mySession !== session) return;
      playNode('intro');
    }, 1350);
  }


  // ==========================================
  // CLOSE GAME
  // ==========================================

  function close() {
    aborted = true;
    running = false;
    session++;

    // Slide game window back out to the right
    gameEl.classList.remove('is-active');
    gameEl.setAttribute('aria-hidden', 'true');
    if (taskbarApp) {
      taskbarApp.classList.remove('is-active');
    }

    // Leave the desktop only if no other app window is still open
    if (!anyAppOpen()) {
      exitDesktop();
    }
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', close);
  }

  const minBtn = gameEl.querySelector('.game-minimize');
  if (minBtn) {
    minBtn.addEventListener('click', close);
  }

  const maxBtn = gameEl.querySelector('.game-maximize');
  if (maxBtn) {
    maxBtn.addEventListener('click', function () {
      const frame = gameEl.querySelector('.game-frame');
      if (frame) {
        frame.classList.toggle('is-maximized');
      }
    });
  }

  // Windows Taskbar interactions
  if (taskbarApp) {
    taskbarApp.addEventListener('click', function () {
      if (gameEl.classList.contains('is-active')) {
        close();
      } else {
        launch();
      }
    });
  }


  // ==========================================
  // DRAGGABLE WINDOW SYSTEM
  // ==========================================

  function makeDraggable(frame, titlebar, prefix) {
    if (!frame || !titlebar) return null;

    let posX = 0;
    let posY = 0;
    let startX = 0;
    let startY = 0;
    let isDragging = false;

    titlebar.addEventListener('mousedown', onPointerDown);
    titlebar.addEventListener('touchstart', onPointerDown, { passive: false });

    function onPointerDown(e) {
      // Do not drag if user clicked buttons or interactive controls
      if (e.target.closest('.game-win-btn, button, input, a')) return;
      if (frame.classList.contains('is-maximized')) return;

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      isDragging = true;
      startX = clientX - posX;
      startY = clientY - posY;

      frame.classList.add('is-dragging');

      document.addEventListener('mousemove', onPointerMove);
      document.addEventListener('touchmove', onPointerMove, { passive: false });
      document.addEventListener('mouseup', onPointerUp);
      document.addEventListener('touchend', onPointerUp);

      if (e.cancelable && e.type === 'touchstart') {
        e.preventDefault();
      }
    }

    function onPointerMove(e) {
      if (!isDragging) return;

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      posX = clientX - startX;
      posY = clientY - startY;

      // Soft clamp within viewport bounds so titlebar stays reachable
      const maxW = (window.innerWidth || 1200) * 0.45;
      const maxH = (window.innerHeight || 800) * 0.45;
      posX = Math.max(-maxW, Math.min(maxW, posX));
      posY = Math.max(-maxH, Math.min(maxH, posY));

      frame.style.setProperty(prefix + '-x', posX + 'px');
      frame.style.setProperty(prefix + '-y', posY + 'px');

      if (e.cancelable) {
        e.preventDefault();
      }
    }

    function onPointerUp() {
      if (!isDragging) return;
      isDragging = false;
      frame.classList.remove('is-dragging');

      document.removeEventListener('mousemove', onPointerMove);
      document.removeEventListener('touchmove', onPointerMove);
      document.removeEventListener('mouseup', onPointerUp);
      document.removeEventListener('touchend', onPointerUp);
    }

    return {
      reset: function () {
        posX = 0;
        posY = 0;
        frame.style.setProperty(prefix + '-x', '0px');
        frame.style.setProperty(prefix + '-y', '0px');
      }
    };
  }

  // Bind draggable windows
  const messageFrame    = gameEl.querySelector('.game-frame');
  const messageTitlebar = gameEl.querySelector('.game-titlebar');
  const messageDrag     = makeDraggable(messageFrame, messageTitlebar, '--win');


  // ==========================================
  // SETTINGS WINDOW & PROGRESS RESET
  // ==========================================

  const settingsEl       = document.getElementById('win-settings');
  const settingsFrame    = document.getElementById('win-settings-frame');
  const settingsTitlebar = document.getElementById('win-settings-titlebar');
  const taskbarSettings  = document.getElementById('win-taskbar-settings');
  const settingsCloseBtn = settingsEl ? settingsEl.querySelector('.win-settings-close') : null;
  const settingsMinBtn   = settingsEl ? settingsEl.querySelector('.win-settings-minimize') : null;
  const settingsOkBtn    = settingsEl ? settingsEl.querySelector('.win-settings-ok') : null;

  const endingsCountEl   = document.getElementById('settings-endings-count');
  const messagesCountEl  = document.getElementById('settings-messages-count');
  const resetBtn         = document.getElementById('btn-reset-progress');
  const confirmBox       = document.getElementById('win-confirm-reset');
  const confirmYesBtn    = document.getElementById('btn-confirm-reset-yes');
  const confirmNoBtn     = document.getElementById('btn-confirm-reset-no');
  const resetNotice      = document.getElementById('win-reset-notice');
  const soundToggle      = document.getElementById('settings-sound-toggle');
  const recenterBtn      = document.getElementById('btn-recenter-window');
  const startBtn         = document.querySelector('.win-start-btn');

  const settingsDrag     = makeDraggable(settingsFrame, settingsTitlebar, '--settings');

  function updateSettingsStats() {
    if (!NOVEL) return;
    const p = NOVEL.getProgress ? NOVEL.getProgress() : { visited: 0, endings: 0, totalEndings: 6 };
    if (endingsCountEl) {
      endingsCountEl.textContent = p.endings + ' / ' + (p.totalEndings || 6);
    }
    if (messagesCountEl) {
      messagesCountEl.textContent = p.visited + ' visited';
    }
  }

  // ==========================================
  // APP WINDOW REGISTRY (Settings, Timeline, Badges)
  // ==========================================

  const apps = {};
  let zTop = 30;

  function focusWin(el) {
    if (!el) return;
    zTop++;
    // Keep every window below the taskbar (z-index 85)
    if (zTop >= 80) {
      zTop = 31;
      gameEl.style.zIndex = '20';
      Object.keys(apps).forEach(function (k) { apps[k].el.style.zIndex = '28'; });
    }
    el.style.zIndex = String(zTop);
  }

  function anyAppOpen() {
    return Object.keys(apps).some(function (k) {
      return apps[k].el.classList.contains('is-active');
    });
  }

  function registerApp(name, el, frame, titlebar, btn, hooks) {
    if (!el) return null;

    apps[name] = {
      el: el,
      btn: btn,
      onOpen: hooks && hooks.onOpen,
      onClose: hooks && hooks.onClose
    };

    if (frame) {
      frame.addEventListener('mousedown', function () { focusWin(el); });
    }

    const closeBtns = el.querySelectorAll('.win-app-close, .win-app-minimize, .win-settings-close, .win-settings-minimize, .win-settings-ok');
    Array.prototype.forEach.call(closeBtns, function (b) {
      b.addEventListener('click', function () { closeApp(name); });
    });

    if (btn) {
      btn.addEventListener('click', function () { toggleApp(name); });
    }

    return apps[name];
  }

  function openApp(name) {
    const a = apps[name];
    if (!a) return;

    enterDesktop();

    a.el.classList.add('is-active');
    a.el.removeAttribute('aria-hidden');

    if (a.btn) {
      a.btn.classList.add('is-active');
      const dot = a.btn.querySelector('.win-taskbar-dot');
      if (dot) dot.hidden = true;
    }

    focusWin(a.el);
    if (a.onOpen) a.onOpen();
  }

  function closeApp(name) {
    const a = apps[name];
    if (!a) return;

    a.el.classList.remove('is-active');
    a.el.setAttribute('aria-hidden', 'true');
    if (a.btn) a.btn.classList.remove('is-active');
    if (a.onClose) a.onClose();

    if (!gameEl.classList.contains('is-active') && !anyAppOpen()) {
      exitDesktop();
    }
  }

  function toggleApp(name) {
    const a = apps[name];
    if (!a) return;
    if (a.el.classList.contains('is-active')) {
      closeApp(name);
    } else {
      openApp(name);
    }
  }

  // Show a small notification dot on a taskbar app (when it is closed)
  function pingApp(name) {
    const a = apps[name];
    if (!a || !a.btn || a.el.classList.contains('is-active')) return;
    const dot = a.btn.querySelector('.win-taskbar-dot');
    if (dot) dot.hidden = false;
  }

  function openSettings()  { openApp('settings'); }
  function closeSettings() { closeApp('settings'); }

  registerApp('settings', settingsEl, settingsFrame, settingsTitlebar, taskbarSettings, {
    onOpen: function () {
      updateSettingsStats();
      if (confirmBox) confirmBox.hidden = true;
      if (resetNotice) resetNotice.hidden = true;
    },
    onClose: function () {
      if (confirmBox) confirmBox.hidden = true;
      if (resetNotice) resetNotice.hidden = true;
    }
  });

  const timelineEl = document.getElementById('win-timeline-app');
  const badgesEl   = document.getElementById('win-badges-app');

  registerApp(
    'timeline',
    timelineEl,
    document.getElementById('win-timeline-frame'),
    document.getElementById('win-timeline-titlebar'),
    document.getElementById('win-taskbar-timeline'),
    {
      onOpen: function () {
        // Re-measure now that the window is visible, so connectors and panning are exact
        if (window.__refreshTimeline) {
          window.__refreshTimeline();
          requestAnimationFrame(function () {
            window.__refreshTimeline();
            setTimeout(function () {
              window.__refreshTimeline();
            }, 100);
          });
        }
      }
    }
  );

  registerApp(
    'badges',
    badgesEl,
    document.getElementById('win-badges-frame'),
    document.getElementById('win-badges-titlebar'),
    document.getElementById('win-taskbar-badges')
  );

  const timelineDrag = makeDraggable(
    document.getElementById('win-timeline-frame'),
    document.getElementById('win-timeline-titlebar'),
    '--app'
  );
  const badgesDrag = makeDraggable(
    document.getElementById('win-badges-frame'),
    document.getElementById('win-badges-titlebar'),
    '--app'
  );

  if (startBtn) {
    startBtn.addEventListener('click', function () { toggleApp('settings'); });
  }

  // Messages window also comes to the front when clicked
  if (messageFrame) {
    messageFrame.addEventListener('mousedown', function () { focusWin(gameEl); });
  }

  // Other scripts (nav links, ending cards) can ask to open an app
  window.addEventListener('open-app', function (e) {
    const name = e.detail;
    if (name === 'messages') {
      if (!gameEl.classList.contains('is-active')) launch();
      return;
    }
    openApp(name);
  });


  // Settings Tab Switching
  if (settingsEl) {
    const tabs = settingsEl.querySelectorAll('.win-settings-tab');
    const panes = settingsEl.querySelectorAll('.win-settings-pane');

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        const targetTab = tab.getAttribute('data-tab');
        tabs.forEach(function (t) { t.classList.toggle('is-active', t === tab); });
        panes.forEach(function (p) {
          p.classList.toggle('is-active', p.id === 'pane-' + targetTab);
        });
      });
    });
  }

  // Audio Toggle
  if (soundToggle) {
    soundToggle.addEventListener('change', function () {
      soundEnabled = soundToggle.checked;
    });
  }

  // Re-center Window Button
  if (recenterBtn) {
    recenterBtn.addEventListener('click', function () {
      [messageDrag, settingsDrag, timelineDrag, badgesDrag].forEach(function (d) {
        if (d) d.reset();
      });
    });
  }

  // Reset Progress Logic
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      if (confirmBox) {
        confirmBox.hidden = false;
        if (resetNotice) resetNotice.hidden = true;
      }
    });
  }

  if (confirmNoBtn) {
    confirmNoBtn.addEventListener('click', function () {
      if (confirmBox) confirmBox.hidden = true;
    });
  }

  if (confirmYesBtn) {
    confirmYesBtn.addEventListener('click', function () {
      // 1. Reset visual novel storage & graph
      if (NOVEL && NOVEL.reset) {
        NOVEL.reset();
      }

      // 2. Invalidate any story playback still in flight, then clear the chat
      session++;
      const mySession = session;
      log.innerHTML = '';
      choices.innerHTML = '';
      choices.classList.remove('is-visible');
      resetNotificationDot();
      updateSidebarPreview('lia?');

      // Clear taskbar notification dots
      ['timeline', 'badges'].forEach(function (k) {
        const a = apps[k];
        const dot = a && a.btn ? a.btn.querySelector('.win-taskbar-dot') : null;
        if (dot) dot.hidden = true;
      });

      // Redraw connectors / pan limits in case the timeline is open
      if (window.__refreshTimeline) window.__refreshTimeline();

      // 3. Update stats immediately
      updateSettingsStats();

      // 4. Hide confirmation and display feedback
      if (confirmBox) confirmBox.hidden = true;
      if (resetNotice) {
        resetNotice.hidden = false;
        setTimeout(function () {
          resetNotice.hidden = true;
        }, 3500);
      }

      // 5. If Messages window is open, restart the story from the first text
      if (gameEl.classList.contains('is-active')) {
        aborted = false;
        running = true;
        setTimeout(function () {
          if (mySession !== session) return;
          playNode('intro');
        }, 600);
      } else {
        aborted = true;
        running = false;
      }
    });
  }


  // ==========================================
  // PLAY A STORY NODE
  // ==========================================

  async function playNode(id) {
    if (aborted) return;

    var mySession = session;
    var stale = function () { return aborted || mySession !== session; };

    var node = STORY[id];
    if (!node) return;

    // Light this message up on the timeline (ping the taskbar if it is new)
    var before = NOVEL.getProgress().visited;
    NOVEL.visit(id);
    if (NOVEL.getProgress().visited > before) {
      pingApp('timeline');
    }

    // Type each message with typing indicator
    for (var i = 0; i < node.messages.length; i++) {
      if (stale()) return;

      var msg = node.messages[i];
      await showTyping(msg.text);
      if (stale()) return;

      addBubble(msg.from, msg.text);
    }

    // End node: unlock the badge, then offer replay / close
    if (node.end) {
      var result = node.ending ? NOVEL.unlock(node.ending) : null;

      if (result && result.isNew) {
        pingApp('badges');
      }

      setTimeout(function () {
        if (stale()) return;

        if (result) {
          addEndingCard(result, node.ending);
        }

        var viewBadges = document.createElement('button');
        viewBadges.className = 'game-choice';
        viewBadges.textContent = 'open badges';
        viewBadges.addEventListener('click', function () { openApp('badges'); });

        var viewTimeline = document.createElement('button');
        viewTimeline.className = 'game-choice';
        viewTimeline.textContent = 'open timeline';
        viewTimeline.addEventListener('click', function () { openApp('timeline'); });

        var replay = document.createElement('button');
        replay.className = 'game-choice';
        replay.textContent = 'start over, find another ending';
        replay.addEventListener('click', restart);

        var btn = document.createElement('button');
        btn.className = 'game-choice game-choice--end';
        btn.textContent = 'close';
        btn.addEventListener('click', close);

        choices.innerHTML = '';
        choices.appendChild(viewBadges);
        choices.appendChild(viewTimeline);
        choices.appendChild(replay);
        choices.appendChild(btn);
        choices.classList.add('is-visible');
        log.scrollTop = log.scrollHeight;
      }, 900);
      return;
    }

    // Show player choices
    if (node.choices) {
      showChoices(node.choices);
    }
  }


  // ==========================================
  // ENDING CARD
  // ==========================================

  function addEndingCard(result, key) {
    var info = NOVEL.ENDINGS[key];

    var el = document.createElement('div');
    el.className = 'game-ending';

    el.innerHTML =
      '<span class="game-ending-kicker">' +
        (result.isNew ? 'badge unlocked' : 'ending reached again') +
      '</span>' +
      '<span class="game-ending-icon"></span>' +
      '<strong class="game-ending-name"></strong>' +
      '<span class="game-ending-desc"></span>';

    el.querySelector('.game-ending-name').textContent = result.name;
    el.querySelector('.game-ending-desc').textContent = info.desc;

    // Show the same pixel icon used in the Badges window
    if (NOVEL.badgeIcon) {
      el.querySelector('.game-ending-icon').innerHTML = NOVEL.badgeIcon(key);
    }

    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
  }


  // ==========================================
  // RESTART (KEEPS DISCOVERED PROGRESS)
  // ==========================================

  function restart() {
    if (!running || aborted) return;

    session++;

    log.innerHTML     = '';
    choices.innerHTML = '';
    choices.classList.remove('is-visible');

    resetNotificationDot();
    updateSidebarPreview('lia?');

    playNode('intro');
  }


  // ==========================================
  // TYPING INDICATOR
  // ==========================================

  function showTyping(text) {
    return new Promise(function (resolve) {

      var el = document.createElement('div');
      el.className =
        'game-bubble game-bubble--in game-typing';

      el.innerHTML =
        '<span class="dot"></span>' +
        '<span class="dot"></span>' +
        '<span class="dot"></span>';

      log.appendChild(el);
      log.scrollTop = log.scrollHeight;

      // Longer messages take slightly longer to "type"
      var ms = Math.min(
        600 + text.length * 18,
        2200
      );

      setTimeout(function () {
        el.remove();
        resolve();
      }, ms);

    });
  }


  // ==========================================
  // ADD BUBBLE & SYNC PREVIEW
  // ==========================================

  function addBubble(from, text) {

    var el = document.createElement('div');

    el.className =
      'game-bubble game-bubble--' +
      (from === 'them' ? 'in' : 'out');

    // [Bracketed text] is narration: timestamps, photos, scene notes
    var isNote = /^\[.*\]$/.test(text);

    if (isNote) {
      el.className = 'game-bubble game-bubble--note';
      el.textContent = text.slice(1, -1);
    } else {
      el.textContent = text;
    }

    log.appendChild(el);
    log.scrollTop = log.scrollHeight;

    // Keep left sidebar preview in sync with the latest messages
    updateSidebarPreview(text);

    // If an incoming message arrives from the unknown number, show notification dot again and play sound
    if (from === 'them') {
      resetNotificationDot();
      if (!isNote) {
        playSound('receive');
      }
    } else if (from === 'you') {
      playSound('sent');
    }
  }


  // ==========================================
  // SHOW CHOICES
  // ==========================================

  function showChoices(list) {

    choices.innerHTML = '';

    list.forEach(function (choice) {

      var btn = document.createElement('button');
      btn.className = 'game-choice';
      btn.textContent = choice.text;

      btn.addEventListener('click', function () {

        var mySession = session;

        // Remove the notification dot on their name when the user answers
        removeNotificationDot();

        // Send player's reply as a bubble
        addBubble('you', choice.text);

        // Clear choices
        choices.innerHTML = '';
        choices.classList.remove('is-visible');

        // Advance story
        if (choice.next) {
          setTimeout(function () {
            if (aborted || mySession !== session) return;
            playNode(choice.next);
          }, 600);
        }

      });

      choices.appendChild(btn);

    });

    // Fade choices in on next frame
    requestAnimationFrame(function () {
      choices.classList.add('is-visible');
      log.scrollTop = log.scrollHeight;
    });
  }


  // ==========================================
  // HOOK: MAIL CLICK → LAUNCH GAME
  // ==========================================

  var mail = document.querySelector('.mail');

  if (mail) {
    mail.style.cursor = 'pointer';

    mail.addEventListener('click', function (e) {
      e.stopPropagation();
      launch();
    });
  }


  // ==========================================
  // HOOK: ESCAPE → CLOSE GAME
  // ==========================================

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;

    // Close the top-most open app window first, then the chat
    let topName = null;
    let topZ = -1;
    Object.keys(apps).forEach(function (k) {
      const a = apps[k];
      if (!a.el.classList.contains('is-active')) return;
      const z = parseInt(a.el.style.zIndex || '28', 10);
      if (z > topZ) {
        topZ = z;
        topName = k;
      }
    });

    if (topName) {
      closeApp(topName);
    } else if (running) {
      close();
    }
  });

})();
