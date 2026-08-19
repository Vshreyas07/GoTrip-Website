(function () {
  function el(tag, attrs) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        node.setAttribute(k, attrs[k]);
      });
    }
    return node;
  }

  /* ── Simple markdown-to-HTML ───────────────────────── */
  function md(text) {
    if (!text) return '';
    var s = text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/_(.+?)_/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
    // Bullet points
    s = s.replace(/•\s*/g, '<span class="chat-bullet">•</span> ');
    return s;
  }

  /* ── Quick-reply chip data ─────────────────────────── */
  var QUICK_REPLIES = [
    { label: '🗺️ Plan Trip', text: 'plan a trip' },
    { label: '✈️ Flights', text: 'book a flight' },
    { label: '🏨 Hotels', text: 'find hotels' },
    { label: '🌄 Destinations', text: 'suggest destinations' },
    { label: '❓ Help', text: 'help' }
  ];

  var root = el("div");
  root.className = "chat";
  root.innerHTML =
    '<div class="chat__head">' +
    '  <div class="chat__head-left">' +
    '    <span class="chat__avatar">🤖</span>' +
    '    <div>' +
    '      <div class="chat__title">GoTrip Assistant</div>' +
    '      <div class="chat__status"><span class="chat__status-dot"></span> Online</div>' +
    '    </div>' +
    '  </div>' +
    '  <button class="chat__toggle" type="button" aria-label="Open chat"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg></button>' +
    '</div>' +
    '<div class="chat__body">' +
    '  <div class="chat__messages" aria-live="polite"></div>' +
    '  <div class="chat__quick"></div>' +
    '  <form class="chat__form">' +
    '    <input name="message" placeholder="Ask me anything about travel..." autocomplete="off" />' +
    '    <button class="chat__send" type="submit" aria-label="Send"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>' +
    '  </form>' +
    '</div>';

  document.addEventListener("DOMContentLoaded", function () {
    document.body.appendChild(root);

    var toggle = root.querySelector(".chat__toggle");
    var messages = root.querySelector(".chat__messages");
    var form = root.querySelector(".chat__form");
    var input = root.querySelector("input[name=message]");
    var quickBar = root.querySelector(".chat__quick");

    /* ── Render quick-reply chips ─────────────────── */
    function renderQuickReplies() {
      quickBar.innerHTML = '';
      QUICK_REPLIES.forEach(function (qr) {
        var chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'chat__chip';
        chip.textContent = qr.label;
        chip.addEventListener('click', function () {
          sendMessage(qr.text);
        });
        quickBar.appendChild(chip);
      });
    }

    /* ── Typing indicator ─────────────────────────── */
    function showTyping() {
      var t = document.createElement('div');
      t.className = 'chat__msg chat__msg--bot chat__typing';
      t.innerHTML = '<span class="chat__dot"></span><span class="chat__dot"></span><span class="chat__dot"></span>';
      t.id = 'chat-typing';
      messages.appendChild(t);
      messages.scrollTop = messages.scrollHeight;
    }
    function hideTyping() {
      var t = document.getElementById('chat-typing');
      if (t) t.remove();
    }

    /* ── Add message bubble ───────────────────────── */
    function addMessage(text, who, action) {
      var msg = document.createElement("div");
      msg.className = "chat__msg " + (who === "me" ? "chat__msg--me" : "chat__msg--bot");

      if (who === 'me') {
        msg.textContent = text;
      } else {
        msg.innerHTML = md(text);
      }

      messages.appendChild(msg);

      /* ── Action button (link / navigation) ─────── */
      if (action && action.type === 'link' && action.url && action.label) {
        var btnWrap = document.createElement('div');
        btnWrap.className = 'chat__action';
        var btn = document.createElement('a');
        btn.href = action.url;
        btn.className = 'chat__action-btn';
        btn.textContent = action.label;
        btn.target = '_self';
        btnWrap.appendChild(btn);
        messages.appendChild(btnWrap);
      }

      /* ── Suggestion chips for destinations ─────── */
      if (action && action.type === 'suggestions' && action.places) {
        var chipWrap = document.createElement('div');
        chipWrap.className = 'chat__suggestions';
        action.places.forEach(function (p) {
          var c = document.createElement('button');
          c.type = 'button';
          c.className = 'chat__suggestion-chip';
          c.textContent = p;
          c.addEventListener('click', function () {
            sendMessage('tell me about ' + p);
          });
          chipWrap.appendChild(c);
        });
        messages.appendChild(chipWrap);
      }

      messages.scrollTop = messages.scrollHeight;
    }

    function setOpen(open) {
      if (open) {
        root.classList.add("chat--open");
        toggle.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
        toggle.setAttribute('aria-label', 'Close chat');
        setTimeout(function () { input.focus(); }, 0);
      } else {
        root.classList.remove("chat--open");
        toggle.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
        toggle.setAttribute('aria-label', 'Open chat');
      }
    }

    toggle.addEventListener("click", function () {
      setOpen(!root.classList.contains("chat--open"));
    });

    /* ── Send message helper ──────────────────────── */
    function sendMessage(text) {
      if (!text || !text.trim()) return;
      addMessage(text, "me");
      input.value = "";
      showTyping();

      fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          hideTyping();
          var reply = (data && data.reply) || "(no reply)";
          var action = data && data.action ? data.action : null;
          addMessage(reply, "bot", action);
        })
        .catch(function () {
          hideTyping();
          addMessage("Sorry \u2014 chat service is unavailable right now. Please try again!", "bot");
        });
    }

    /* ── Welcome message ─────────────────────────── */
    addMessage("Hey! \uD83D\uDC4B I'm your GoTrip travel assistant. Ask me about destinations, flights, hotels, itineraries \u2014 or just say hi!\n\nTry the quick buttons below to get started! \u2B07\uFE0F", "bot");
    renderQuickReplies();

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      sendMessage((input.value || "").trim());
    });

    setOpen(false);
  });
})();
