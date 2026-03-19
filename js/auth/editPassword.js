function initEditPassword() {
  const form = document.querySelector("form");
  if (!form) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
  });
}

initEditPassword();
