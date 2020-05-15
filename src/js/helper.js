// Allows #id links to scroll smoothly rather than jump
if (document.body.scrollIntoView) {
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener("click", function(e) {
      e.preventDefault();

      var target = document.querySelector(anchor.getAttribute("href"));
      if (!target) target = document.querySelector('a[name="' + anchor.getAttribute('href').substring(1) + '"]');

      target.scrollIntoView({
        behavior: "smooth"
      });
    });
  });
}
