// ==========================================
// NOVEL DATA — "UNKNOWN NUMBER"
// ==========================================
//
// An unknown number (Dan) texts you, convinced he is talking to Lia.
// Lia has been gone for years. You can play along, tell the truth,
// or hang up. Every path ends in one of six endings. Each ending is
// a badge, and every message you discover lights up the timeline.
//
// Loaded BEFORE script.js and game.js so both can read window.NOVEL.

(function () {

  var STORAGE_KEY = 'nyna_unknown_number_v1';


  // ==========================================
  // ENDINGS = BADGES
  // ==========================================

  var ENDINGS = {
    hung_up: {
      name: 'Wrong Number',
      shape: 'circle',
      desc: 'You hung up on someone who was still waiting.'
    },
    caught: {
      name: 'Caught Lying',
      shape: 'circle',
      desc: 'You pretended to be Lia. Dan saw through it.'
    },
    empty_chair: {
      name: 'Empty Chair',
      shape: 'triangle',
      desc: 'You promised to come. Nobody sat at the table.'
    },
    closure: {
      name: 'Closure',
      shape: 'star',
      desc: 'Lia said goodbye, even if it was years late.'
    },
    truth: {
      name: 'The Truth',
      shape: 'triangle',
      desc: 'Dan finally heard that Lia is gone.'
    },
    where_she_went: {
      name: 'Where She Went',
      shape: 'star',
      desc: 'A lighthouse, a lake, and a reason to stop waiting.'
    }
  };

  var ENDING_ORDER = [
    'hung_up',
    'caught',
    'empty_chair',
    'closure',
    'truth',
    'where_she_went'
  ];


  // ==========================================
  // STORY GRAPH
  // ==========================================
  //
  // messages – what Dan says (in order)
  // choices  – what you can answer: { text, next }
  // end      – true on the last message of a path
  // ending   – which badge this path unlocks
  //

  function them() {
    return Array.prototype.map.call(arguments, function (text) {
      return { from: 'them', text: text };
    });
  }

  var STORY = {

    intro: {
      messages: them(
        'lia?',
        "it's dan. i know. i know it's been years",
        "i'm in town till sunday. can we meet at the old cafe? our table by the window"
      ),
      choices: [
        { text: "hi dan. it's been a while.", next: 'play_along' },
        { text: 'who is this?', next: 'who' },
        { text: 'wrong number.', next: 'wrong' }
      ]
    },


    // ---------- PLAY ALONG ----------

    play_along: {
      messages: them(
        'you actually answered',
        'i almost did not send it. three years, lia',
        'i kept the thread open anyway. pathetic, right?'
      ),
      choices: [
        { text: 'what happened between us?', next: 'between' },
        { text: 'i missed you.', next: 'missed' }
      ]
    },

    between: {
      messages: them(
        'you really do not remember? ok',
        'you said you needed air. you walked out mid-sentence',
        "i didn't follow. that's the part i can't forgive myself for"
      ),
      choices: [
        { text: 'where did i go, dan?', next: 'where_go' },
        { text: "i'm sorry i left.", next: 'sorry_left' }
      ]
    },

    where_go: {
      messages: them(
        'you tell me',
        'your mom said north. somewhere with a lake',
        "you sent one postcard. no return address. just a lighthouse and the word 'breathing'"
      ),
      choices: [
        { text: 'do you still have it?', next: 'postcard' },
        { text: "i don't remember any postcard.", next: 'dont_remember' }
      ]
    },

    postcard: {
      messages: them(
        "it's on my fridge. three years now",
        "i've gone to the cafe every sunday since. in case you came back",
        'i can send you a photo of it if you want'
      ),
      choices: [
        { text: 'send it to me.', next: 'photo' },
        { text: "dan, stop waiting. she's not coming back.", next: 'stop_waiting' }
      ]
    },

    photo: {
      messages: them(
        '[photo: a postcard. a lighthouse over grey water]',
        'there is tiny handwriting in the corner. i never showed anyone',
        "'if you stop waiting, i'll stop running. L'",
        "...you're not her, are you",
        "that's ok. thank you for staying anyway",
        'so she is out there somewhere, still breathing. somewhere with water',
        'i think that is the answer i needed'
      ),
      end: true,
      ending: 'where_she_went'
    },

    stop_waiting: {
      messages: them(
        '...she?',
        'you said she',
        'who is this',
        'no. do not answer. i think i know',
        "this number's been dead for two years. i just never wanted to read the 'undeliverable'",
        'so she is really gone',
        'thank you for saying it out loud'
      ),
      end: true,
      ending: 'truth'
    },

    dont_remember: {
      messages: them(
        'lia wrote that herself',
        'lia would never forget it',
        'who is this',
        'who is this',
        'do not text this number again'
      ),
      end: true,
      ending: 'caught'
    },

    sorry_left: {
      messages: them(
        '...',
        'thank you',
        'i have been waiting three years to hear that. even a little late',
        'i will stop texting this number now. take care of yourself, lia'
      ),
      end: true,
      ending: 'closure'
    },

    missed: {
      messages: them(
        'i missed you too',
        'i never stopped',
        'can you come sunday? 4pm. same table'
      ),
      choices: [
        { text: "i'll be there.", next: 'promise' },
        { text: "i can't. i'm sorry.", next: 'cant_come' }
      ]
    },

    promise: {
      messages: them(
        'really?',
        "ok. sunday. 4pm. i'll save your seat",
        '[sunday 4:12pm] i am here. window seat',
        '[sunday 6:40pm] still here',
        "[sunday 9:03pm] it's ok. i get it",
        "i'll leave the chair out anyway"
      ),
      end: true,
      ending: 'empty_chair'
    },

    cant_come: {
      messages: them(
        'yeah',
        'i figured',
        'you did not come back then either',
        'i am not angry. i was never angry. just sad',
        'goodbye, lia'
      ),
      end: true,
      ending: 'closure'
    },


    // ---------- WHO IS THIS ----------

    who: {
      messages: them(
        'dan. daniel. the cafe on 5th?',
        'did you delete my number? lol',
        'this is lia, right?'
      ),
      choices: [
        { text: "no. i'm not lia.", next: 'tell_truth' },
        { text: "yeah, it's me. sorry.", next: 'keep_pretending' }
      ]
    },

    tell_truth: {
      messages: them(
        'that is... no. this is her number',
        'she has had it since college',
        'if you are not lia, who are you?'
      ),
      choices: [
        { text: 'i got this number two years ago.', next: 'reassigned' },
        { text: 'tell me about her.', next: 'about_lia' }
      ]
    },

    reassigned: {
      messages: them(
        'two years',
        '...',
        'she has been gone longer than that',
        "i keep saying 'gone'. i never decided if it meant left or lost",
        'sorry to bother you. really'
      ),
      end: true,
      ending: 'truth'
    },

    about_lia: {
      messages: them(
        'green scarf. always cold',
        'laughed too loud in libraries',
        'she kept a list of places she would go. a lake town was number one'
      ),
      choices: [
        { text: 'maybe she went to the lake.', next: 'lake' },
        { text: "i'm sorry for your loss.", next: 'loss' }
      ]
    },

    lake: {
      messages: them(
        '...the lake',
        'her mom said north. the postcard had a lighthouse',
        'i never connected them',
        'maybe she was not lost. maybe she just finally left',
        'a stranger told me that. weird',
        "thank you. i'm going to go find out"
      ),
      end: true,
      ending: 'where_she_went'
    },

    loss: {
      messages: them(
        'loss',
        'is that what it is?',
        'three years and nobody has said that word to me',
        "everyone says 'moved away'",
        "i don't know if she left or if she's gone gone",
        'thank you for not lying to me'
      ),
      end: true,
      ending: 'truth'
    },

    keep_pretending: {
      messages: them(
        'lia never says sorry',
        'she said it made people small',
        'who is this',
        'answer me',
        'this is not funny',
        'do not text this number again'
      ),
      end: true,
      ending: 'caught'
    },


    // ---------- WRONG NUMBER ----------

    wrong: {
      messages: them(
        'oh',
        '...sorry. it was her number for six years',
        'if you ever meet a girl named lia, tell her dan said hi',
        'goodnight'
      ),
      end: true,
      ending: 'hung_up'
    }

  };


  // ==========================================
  // TIMELINE LAYOUT  (x, y inside the tree)
  // ==========================================
  //
  // Hand-placed so the branches never cross: every parent sits
  // between its children, and siblings fan out in the gap.
  //

  var LAYOUT = {
    intro:           [  60, 260],

    play_along:      [ 440, 100],
    who:             [ 440, 260],
    wrong:           [ 440, 420],

    between:         [ 850,  40],
    missed:          [ 850, 160],
    tell_truth:      [ 850, 290],
    keep_pretending: [ 850, 440],

    where_go:        [1280,  30],
    sorry_left:      [1280, 115],
    promise:         [1280, 200],
    cant_come:       [1280, 285],
    reassigned:      [1280, 370],
    about_lia:       [1280, 460],

    postcard:        [1720,  30],
    dont_remember:   [1720, 125],
    lake:            [1720, 370],
    loss:            [1720, 470],

    photo:           [2160,  30],
    stop_waiting:    [2160, 130]
  };


  // ==========================================
  // DERIVE LABELS, PARENTS, CONNECTIONS
  // ==========================================

  var connections = [];

  STORY.intro.label = 'Receive Message';

  Object.keys(STORY).forEach(function (id) {
    var node = STORY[id];
    node.id = id;

    (node.choices || []).forEach(function (choice) {
      STORY[choice.next].label = choice.text;
      STORY[choice.next].parent = id;
      connections.push([id, choice.next]);
    });
  });


  // ==========================================
  // SAVED PROGRESS
  // ==========================================

  var progress = { visited: {}, endings: {} };

  try {
    var saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && saved.visited && saved.endings) {
      progress = saved;
    }
  } catch (err) {}

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (err) {}
  }

  function isVisited(id) {
    return id === 'intro' || !!progress.visited[id];
  }

  function endingCount() {
    return ENDING_ORDER.filter(function (k) {
      return progress.endings[k];
    }).length;
  }


  // ==========================================
  // BUILD TIMELINE NODES
  // ==========================================

  var tree = document.getElementById('timeline-tree');
  var nodeRefs = {};

  function previewOf(node) {
    return node.messages
      .slice(0, 2)
      .map(function (m) { return m.text; })
      .join(' ');
  }

  function buildTimeline() {
    if (!tree) return;

    tree.innerHTML = '';

    Object.keys(STORY).forEach(function (id) {
      var node = STORY[id];
      var pos = LAYOUT[id] || [0, 0];

      var el = document.createElement('div');
      el.className = 'timeline-node';
      el.setAttribute('data-node', id);
      el.style.left = pos[0] + 'px';
      el.style.top  = pos[1] + 'px';

      var choice = document.createElement('span');
      choice.className = 'timeline-node-choice';

      var reply = document.createElement('div');
      reply.className = 'timeline-node-reply';

      var label = document.createElement('span');
      label.className = 'timeline-reply-label';

      var text = document.createElement('p');
      text.className = 'timeline-reply-text';

      reply.appendChild(label);
      reply.appendChild(text);

      el.appendChild(choice);
      el.appendChild(reply);
      tree.appendChild(el);

      nodeRefs[id] = { el: el, choice: choice, label: label, text: text };
    });

    Object.keys(STORY).forEach(updateNode);
    updateProgressLabel();
  }

  function updateNode(id) {
    var node = STORY[id];
    var ref = nodeRefs[id];
    if (!ref) return;

    var seen = isVisited(id);

    ref.el.classList.toggle('is-locked', !seen);
    ref.el.classList.toggle('is-ending', !!node.ending);

    ref.choice.textContent = seen ? node.label : '???';

    if (!seen) {
      ref.label.textContent = node.ending ? 'Ending:' : 'Locked:';
      ref.text.textContent = 'Not discovered yet. Keep texting to find out.';
      return;
    }

    if (node.ending) {
      ref.label.textContent = 'Ending: ' + ENDINGS[node.ending].name;
      ref.text.textContent = ENDINGS[node.ending].desc;
    } else {
      ref.label.textContent = 'Dan says:';
      ref.text.textContent = previewOf(node);
    }
  }

  function updateProgressLabel() {
    var header = document.querySelector('.timeline-header');
    if (!header) return;

    var el = header.querySelector('.timeline-progress');

    if (!el) {
      el = document.createElement('p');
      el.className = 'timeline-progress';
      header.appendChild(el);
    }

    el.textContent =
      endingCount() + ' / ' + ENDING_ORDER.length + ' endings found';
  }

  // Light up connector lines between two discovered nodes
  function applyLit() {
    var paths = document.querySelectorAll('#timeline-svg path[data-from]');

    Array.prototype.forEach.call(paths, function (p) {
      var lit =
        isVisited(p.getAttribute('data-from')) &&
        isVisited(p.getAttribute('data-to'));

      p.classList.toggle('is-lit', lit);
    });
  }


  // ==========================================
  // BUILD BADGES
  // ==========================================

  var badgeTrack = document.querySelector('.badges-track');

  var BADGE_ICONS = {
    hung_up:
      '<svg viewBox="0 0 16 16" class="badge-svg pixel-icon" shape-rendering="crispEdges" aria-hidden="true">' +
        '<rect x="2" y="3" width="3" height="4" fill="#F2D9A4"/>' +
        '<rect x="11" y="3" width="3" height="4" fill="#F2D9A4"/>' +
        '<rect x="4" y="5" width="8" height="2" fill="#F2D9A4"/>' +
        '<rect x="1" y="4" width="1" height="2" fill="#B49965"/>' +
        '<rect x="14" y="4" width="1" height="2" fill="#B49965"/>' +
        '<rect x="3" y="12" width="2" height="2" fill="#A43032"/>' +
        '<rect x="5" y="10" width="2" height="2" fill="#A43032"/>' +
        '<rect x="7" y="8" width="2" height="2" fill="#A43032"/>' +
        '<rect x="9" y="6" width="2" height="2" fill="#A43032"/>' +
        '<rect x="11" y="4" width="2" height="2" fill="#A43032"/>' +
      '</svg>',

    caught:
      '<svg viewBox="0 0 16 16" class="badge-svg pixel-icon" shape-rendering="crispEdges" aria-hidden="true">' +
        '<rect x="5" y="4" width="6" height="1" fill="#D2E5C5"/>' +
        '<rect x="5" y="11" width="6" height="1" fill="#D2E5C5"/>' +
        '<rect x="3" y="5" width="2" height="1" fill="#D2E5C5"/>' +
        '<rect x="11" y="5" width="2" height="1" fill="#D2E5C5"/>' +
        '<rect x="3" y="10" width="2" height="1" fill="#D2E5C5"/>' +
        '<rect x="11" y="10" width="2" height="1" fill="#D2E5C5"/>' +
        '<rect x="1" y="6" width="2" height="4" fill="#D2E5C5"/>' +
        '<rect x="13" y="6" width="2" height="4" fill="#D2E5C5"/>' +
        '<rect x="3" y="6" width="10" height="4" fill="#FFFAE9"/>' +
        '<rect x="6" y="6" width="4" height="4" fill="#828700"/>' +
        '<rect x="7" y="7" width="2" height="2" fill="#A43032"/>' +
        '<rect x="7" y="1" width="2" height="2" fill="#F2D9A4"/>' +
      '</svg>',

    empty_chair:
      '<svg viewBox="0 0 16 16" class="badge-svg pixel-icon" shape-rendering="crispEdges" aria-hidden="true">' +
        '<rect x="4" y="2" width="2" height="7" fill="#F2D9A4"/>' +
        '<rect x="10" y="2" width="2" height="7" fill="#F2D9A4"/>' +
        '<rect x="6" y="3" width="4" height="1" fill="#F2D9A4"/>' +
        '<rect x="6" y="5" width="4" height="1" fill="#F2D9A4"/>' +
        '<rect x="6" y="7" width="4" height="1" fill="#F2D9A4"/>' +
        '<rect x="3" y="9" width="10" height="2" fill="#A43032"/>' +
        '<rect x="4" y="9" width="8" height="1" fill="#B49965"/>' +
        '<rect x="4" y="11" width="2" height="4" fill="#632526"/>' +
        '<rect x="10" y="11" width="2" height="4" fill="#632526"/>' +
        '<rect x="6" y="13" width="4" height="1" fill="#632526"/>' +
      '</svg>',

    closure:
      '<svg viewBox="0 0 16 16" class="badge-svg pixel-icon" shape-rendering="crispEdges" aria-hidden="true">' +
        '<rect x="2" y="3" width="12" height="1" fill="#B49965"/>' +
        '<rect x="2" y="13" width="12" height="1" fill="#B49965"/>' +
        '<rect x="1" y="4" width="1" height="9" fill="#B49965"/>' +
        '<rect x="14" y="4" width="1" height="9" fill="#B49965"/>' +
        '<rect x="2" y="4" width="12" height="9" fill="#FFFAE9"/>' +
        '<rect x="2" y="4" width="2" height="1" fill="#BCB7A9"/>' +
        '<rect x="12" y="4" width="2" height="1" fill="#BCB7A9"/>' +
        '<rect x="4" y="5" width="2" height="1" fill="#BCB7A9"/>' +
        '<rect x="10" y="5" width="2" height="1" fill="#BCB7A9"/>' +
        '<rect x="6" y="6" width="4" height="1" fill="#BCB7A9"/>' +
        '<rect x="6" y="7" width="2" height="2" fill="#A43032"/>' +
        '<rect x="8" y="7" width="2" height="2" fill="#A43032"/>' +
        '<rect x="6" y="9" width="4" height="1" fill="#A43032"/>' +
        '<rect x="7" y="10" width="2" height="1" fill="#A43032"/>' +
      '</svg>',

    truth:
      '<svg viewBox="0 0 16 16" class="badge-svg pixel-icon" shape-rendering="crispEdges" aria-hidden="true">' +
        '<rect x="3" y="3" width="5" height="1" fill="#F2D9A4"/>' +
        '<rect x="3" y="7" width="5" height="1" fill="#F2D9A4"/>' +
        '<rect x="2" y="4" width="1" height="3" fill="#F2D9A4"/>' +
        '<rect x="8" y="4" width="1" height="3" fill="#F2D9A4"/>' +
        '<rect x="4" y="4" width="3" height="3" fill="#1d2317"/>' +
        '<rect x="5" y="5" width="1" height="1" fill="#F2D9A4"/>' +
        '<rect x="9" y="5" width="5" height="1" fill="#B49965"/>' +
        '<rect x="11" y="6" width="1" height="2" fill="#828700"/>' +
        '<rect x="13" y="6" width="1" height="3" fill="#828700"/>' +
        '<rect x="12" y="1" width="1" height="2" fill="#D2E5C5"/>' +
        '<rect x="11" y="2" width="3" height="1" fill="#D2E5C5"/>' +
      '</svg>',

    where_she_went:
      '<svg viewBox="0 0 16 16" class="badge-svg pixel-icon" shape-rendering="crispEdges" aria-hidden="true">' +
        '<rect x="7" y="1" width="2" height="1" fill="#A43032"/>' +
        '<rect x="6" y="2" width="4" height="1" fill="#A43032"/>' +
        '<rect x="6" y="3" width="4" height="2" fill="#F2D9A4"/>' +
        '<rect x="5" y="3" width="1" height="2" fill="#632526"/>' +
        '<rect x="10" y="3" width="1" height="2" fill="#632526"/>' +
        '<rect x="5" y="5" width="6" height="1" fill="#632526"/>' +
        '<rect x="6" y="6" width="4" height="2" fill="#FFFAE9"/>' +
        '<rect x="5" y="8" width="6" height="2" fill="#A43032"/>' +
        '<rect x="5" y="10" width="6" height="2" fill="#FFFAE9"/>' +
        '<rect x="4" y="12" width="8" height="2" fill="#A43032"/>' +
        '<rect x="2" y="14" width="12" height="2" fill="#828700"/>' +
        '<rect x="1" y="3" width="3" height="1" fill="#F2D9A4"/>' +
        '<rect x="0" y="2" width="2" height="1" fill="#F2D9A4"/>' +
        '<rect x="12" y="3" width="3" height="1" fill="#F2D9A4"/>' +
        '<rect x="14" y="2" width="2" height="1" fill="#F2D9A4"/>' +
      '</svg>',

    locked:
      '<svg viewBox="0 0 16 16" class="badge-svg pixel-icon" shape-rendering="crispEdges" aria-hidden="true">' +
        '<rect x="5" y="2" width="6" height="2" fill="#BCB7A9"/>' +
        '<rect x="4" y="4" width="2" height="3" fill="#BCB7A9"/>' +
        '<rect x="10" y="4" width="2" height="3" fill="#BCB7A9"/>' +
        '<rect x="3" y="7" width="10" height="7" fill="#5B5952"/>' +
        '<rect x="4" y="8" width="8" height="1" fill="#BCB7A9"/>' +
        '<rect x="7" y="9" width="2" height="2" fill="#161b10"/>' +
        '<rect x="7.5" y="11" width="1" height="2" fill="#161b10"/>' +
      '</svg>'
  };

  function badgeHTML(key, hidden, isNew) {
    var ending = ENDINGS[key];
    var earned = !!progress.endings[key];
    var index = ENDING_ORDER.indexOf(key) + 1;
    var icon = earned ? BADGE_ICONS[key] : BADGE_ICONS.locked;

    return (
      '<div class="badge-item ' +
        (earned ? 'is-earned' : 'is-locked') +
        (earned && isNew ? ' is-new' : '') + '"' +
        (hidden ? ' aria-hidden="true"' : '') +
        ' data-ending="' + key + '"' +
        ' title="' + (earned ? ending.desc : 'Locked. Find this ending in the messages.') + '">' +
        '<div class="badge-emblem-wrap">' +
          '<div class="badge-emblem">' + icon + '</div>' +
          '<span class="badge-pill">' + (earned ? 'UNLOCKED' : 'LOCKED') + '</span>' +
        '</div>' +
        '<div class="badge-meta">' +
          '<span class="badge-tag">ENDING 0' + index + '</span>' +
          '<strong class="badge-name">' + (earned ? ending.name : 'Unknown Ending') + '</strong>' +
          '<p class="badge-desc">' + (earned ? ending.desc : 'Explore branching messages to unlock this truth.') + '</p>' +
        '</div>' +
      '</div>'
    );
  }

  function renderBadges(newKey) {
    if (!badgeTrack) return;

    var first  = ENDING_ORDER.map(function (k) {
      return badgeHTML(k, false, k === newKey);
    }).join('');

    // Duplicate set keeps the right-to-left marquee seamless
    var second = ENDING_ORDER.map(function (k) {
      return badgeHTML(k, true, false);
    }).join('');

    badgeTrack.innerHTML = first + second;
  }


  // ==========================================
  // PUBLIC API
  // ==========================================

  window.NOVEL = {

    STORY: STORY,
    ENDINGS: ENDINGS,
    connections: connections,
    applyLit: applyLit,

    badgeIcon: function (key) {
      return BADGE_ICONS[key] || BADGE_ICONS.locked;
    },

    getProgress: function () {
      return {
        visited: Object.keys(progress.visited).length,
        endings: Object.keys(progress.endings).length,
        totalEndings: ENDING_ORDER.length
      };
    },

    // Called by the game whenever a message node starts playing
    visit: function (id) {
      if (progress.visited[id]) return;

      progress.visited[id] = true;
      save();

      updateNode(id);
      applyLit();
    },

    // Called when a path reaches its ending. Returns { name, isNew }
    unlock: function (key) {
      var ending = ENDINGS[key];
      if (!ending) return null;

      var isNew = !progress.endings[key];

      progress.endings[key] = true;
      save();

      renderBadges(isNew ? key : null);
      updateProgressLabel();

      return { name: ending.name, isNew: isNew };
    },

    reset: function () {
      progress = { visited: {}, endings: {} };
      save();

      Object.keys(STORY).forEach(updateNode);
      renderBadges(null);
      updateProgressLabel();
      applyLit();
    }

  };

  buildTimeline();
  renderBadges(null);

})();
