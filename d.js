(function () {
  var s = document.currentScript;
  var base = s.src.slice(0, s.src.lastIndexOf('/') + 1);
  function b64u(k) {
    k = k.replace(/-/g, '+').replace(/_/g, '/');
    while (k.length % 4) k += '=';
    return Uint8Array.from(atob(k), function (c) { return c.charCodeAt(0); });
  }
  async function one(img) {
    var cap = img.parentNode.querySelector('figcaption');
    try {
      var r = await fetch(base + img.dataset.u);
      if (!r.ok) throw new Error('fetch ' + r.status);
      var b = new Uint8Array(await r.arrayBuffer());
      var key = await crypto.subtle.importKey('raw', b64u(img.dataset.k), 'AES-GCM', false, ['decrypt']);
      var p = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b.slice(0, 12) }, key, b.slice(12));
      var fr = new FileReader();
      fr.onload = function () { img.src = fr.result; };
      fr.readAsDataURL(new Blob([p], { type: 'image/png' }));
    } catch (e) {
      if (cap) { cap.textContent = 'Could not load: ' + e.message; cap.style.color = 'var(--text-danger)'; }
    }
  }
  document.querySelectorAll('img[data-k]').forEach(one);
})();
