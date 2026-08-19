(function () {
  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function formatCardNumber(raw) {
    var digits = String(raw || "").replace(/\D/g, "").slice(0, 16);
    var groups = [];
    for (var i = 0; i < digits.length; i += 4) groups.push(digits.slice(i, i + 4));
    return groups.join(" ");
  }

  function guessBrand(digits) {
    if (!digits) return "CARD";
    if (/^4/.test(digits)) return "VISA";
    if (/^(5[1-5])/.test(digits)) return "MASTERCARD";
    if (/^(34|37)/.test(digits)) return "AMEX";
    if (/^6/.test(digits)) return "RUPAY";
    return "CARD";
  }

  function normalizeExp(value) {
    var digits = String(value || "").replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return digits.slice(0, 2) + "/" + digits.slice(2);
  }

  function setMethod(root, method) {
    var buttons = root.querySelectorAll(".payment__method");
    var forms = root.querySelectorAll(".payment__form");

    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      var isActive = btn.getAttribute("data-method") === method;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
    }

    for (var j = 0; j < forms.length; j++) {
      var form = forms[j];
      var show = form.getAttribute("data-form") === method;
      if (show) form.removeAttribute("hidden");
      else form.setAttribute("hidden", "hidden");
    }
  }

  function disableAllInputs(root) {
    var fields = root.querySelectorAll("input, select, button");
    for (var i = 0; i < fields.length; i++) {
      var el = fields[i];
      if (el.tagName === "A") continue;
      if (el.getAttribute("data-method")) {
        el.setAttribute("disabled", "disabled");
        continue;
      }
      if (el.type === "button" || el.type === "submit" || el.tagName === "INPUT" || el.tagName === "SELECT") {
        el.setAttribute("disabled", "disabled");
      }
    }
  }

  function enableAllInputs(root) {
    var fields = root.querySelectorAll("input, select, button");
    for (var i = 0; i < fields.length; i++) {
      fields[i].removeAttribute("disabled");
    }
  }

  function launchConfetti(root) {
    var host = $("#confetti", root);
    if (!host) return;

    host.innerHTML = "";
    host.classList.add("is-active");

    var colors = ["var(--accent)", "var(--accent-dk)", "var(--green)", "var(--text)"];
    var pieces = 28;

    for (var i = 0; i < pieces; i++) {
      var p = document.createElement("i");
      p.className = "confetti__piece";
      p.style.left = Math.round(Math.random() * 100) + "vw";
      p.style.setProperty("--c", colors[i % colors.length]);
      p.style.setProperty("--d", (Math.random() * 0.9).toFixed(2) + "s");
      p.style.setProperty("--t", (2.2 + Math.random() * 1.2).toFixed(2) + "s");
      p.style.setProperty("--r", Math.round((Math.random() * 720) - 360) + "deg");
      p.style.setProperty("--s", (0.75 + Math.random() * 0.6).toFixed(2));
      host.appendChild(p);
    }

    window.setTimeout(function () {
      host.classList.remove("is-active");
      host.innerHTML = "";
    }, 3600);
  }

  function init() {
    var root = $("[data-payment-page]");
    if (!root) return;


    var statusPill = $("#paymentStatusPill", root);
    var statusText = $("#paymentStatusText", root);
    var note = $("#paymentNote", root);

    var methodBar = $(".payment__methods", root);
    if (methodBar) {
      methodBar.addEventListener("click", function (e) {
        var btn = e.target && e.target.closest ? e.target.closest(".payment__method") : null;
        if (!btn) return;
        var method = btn.getAttribute("data-method");
        if (!method) return;
        setMethod(root, method);
      });
    }

    // Card live preview
    var numberInput = $("#cardNumber", root);
    var nameInput = $("#cardName", root);
    var expInput = $("#cardExp", root);

    var previewNumber = $("#cardPreviewNumber", root);
    var previewName = $("#cardPreviewName", root);
    var previewExp = $("#cardPreviewExp", root);
    var previewBrand = $("#cardPreviewBrand", root);

    function syncCard() {
      if (!numberInput || !previewNumber) return;
      var formatted = formatCardNumber(numberInput.value);
      var digits = formatted.replace(/\s/g, "");

      previewNumber.textContent = formatted || "•••• •••• •••• ••••";
      if (previewBrand) previewBrand.textContent = guessBrand(digits);

      if (previewName) {
        var name = (nameInput && nameInput.value ? nameInput.value : "").trim();
        previewName.textContent = name ? name.toUpperCase() : "YOUR NAME";
      }

      if (previewExp) {
        var exp = (expInput && expInput.value ? expInput.value : "").trim();
        previewExp.textContent = exp || "MM/YY";
      }
    }

    if (numberInput) {
      numberInput.addEventListener("input", function () {
        var cursor = numberInput.selectionStart || 0;
        var before = numberInput.value;
        var formatted = formatCardNumber(before);
        numberInput.value = formatted;

        // Best-effort cursor preservation
        var diff = formatted.length - before.length;
        numberInput.setSelectionRange(cursor + diff, cursor + diff);
        syncCard();
      });
    }

    if (nameInput) nameInput.addEventListener("input", syncCard);

    if (expInput) {
      expInput.addEventListener("input", function () {
        var normalized = normalizeExp(expInput.value);
        expInput.value = normalized;
        syncCard();
      });
    }

    syncCard();

    // Pay handlers (demo)
    var forms = root.querySelectorAll(".payment__form");
    var success = $("#paymentSuccess", root);

    function setPendingState() {
      if (success) success.setAttribute("hidden", "hidden");
      if (statusPill) statusPill.classList.remove("is-paid");
      if (statusText) statusText.textContent = "Pending payment";
      if (note) note.textContent = "Pay to confirm your booking. Your confirmation will appear here.";
      enableAllInputs(root);
    }

    // Always start in the pre-payment state.
    setPendingState();

    // Back/forward cache can restore a "paid" DOM state; reset on show.
    window.addEventListener("pageshow", function () {
      setPendingState();
    });

    function onPay(e) {
      var form = e && e.target ? e.target : null;

      // Do not show success until the current method's form is valid.
      // (Required fields must be filled.)
      if (form && typeof form.checkValidity === "function" && !form.checkValidity()) {
        e.preventDefault();
        if (typeof form.reportValidity === "function") form.reportValidity();
        return;
      }

      e.preventDefault();
      if (success) success.removeAttribute("hidden");

      if (statusPill) statusPill.classList.add("is-paid");
      if (statusText) statusText.textContent = "Booked";
      if (note) note.textContent = "Booked — your confirmation is ready.";

      disableAllInputs(root);
      launchConfetti(root);

      // Scroll to success message (nice, but minimal)
      if (success && success.scrollIntoView) {
        success.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    for (var i = 0; i < forms.length; i++) {
      forms[i].addEventListener("submit", onPay);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
