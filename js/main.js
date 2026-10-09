window.addEventListener('load', () => document.body.classList.remove('container'));
document.getElementById('replay').addEventListener('click', () => {
  const flowers = document.querySelector('.flowers');
  const replacement = flowers.cloneNode(true);
  flowers.replaceWith(replacement);
});
