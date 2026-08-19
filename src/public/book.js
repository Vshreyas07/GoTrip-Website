(function () {
  function onClick(e) {
    var btn = e.target && e.target.closest ? e.target.closest('.js-book') : null;
    if (!btn) return;

    var kind = btn.getAttribute('data-kind') || 'Item';
    var id = btn.getAttribute('data-id') || '';

    var qs = '?kind=' + encodeURIComponent(kind) + (id ? '&id=' + encodeURIComponent(id) : '');
    window.location.href = '/payment' + qs;
  }

  document.addEventListener('click', onClick);
})();