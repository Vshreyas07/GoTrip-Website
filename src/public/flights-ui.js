/* GoTrip — flights-ui.js
   Small progressive enhancement for the Flights search bar:
   - Swap From/To
   - Round-trip toggles Return date
   - Keep Return >= Depart
*/

(function () {
  'use strict';

  function $(id) {
    return document.getElementById(id);
  }

  function syncReturnState() {
    var tripType = $('tripType');
    var returnWrap = $('returnDateWrap');
    var returnInput = $('returnDate');

    if (!tripType || !returnWrap || !returnInput) return;

    var isRound = String(tripType.value || '').toLowerCase() === 'round';
    returnWrap.style.display = isRound ? '' : 'none';

    // Keep the field in the form so query params can persist,
    // but disable it when hidden to avoid submitting stale values.
    returnInput.disabled = !isRound;
  }

  function syncMinDates() {
    var depart = $('departDate');
    var ret = $('returnDate');
    if (!depart || !ret) return;

    if (depart.value) {
      ret.min = depart.value;
      if (ret.value && ret.value < depart.value) {
        ret.value = depart.value;
      }
    } else {
      ret.min = '';
    }
  }

  function bindSwap() {
    var swapBtn = $('swapBtn');
    var from = $('from');
    var to = $('to');

    if (!swapBtn || !from || !to) return;

    swapBtn.addEventListener('click', function () {
      var a = from.value;
      from.value = to.value;
      to.value = a;

      // Keep focus on the next input for quick edits.
      to.focus();
    });
  }

  function init() {
    bindSwap();

    var tripType = $('tripType');
    if (tripType) {
      tripType.addEventListener('change', function () {
        syncReturnState();
      });
    }

    var depart = $('departDate');
    var ret = $('returnDate');
    if (depart) {
      depart.addEventListener('change', syncMinDates);
    }
    if (ret) {
      ret.addEventListener('change', syncMinDates);
    }

    syncReturnState();
    syncMinDates();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
