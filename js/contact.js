(() => {
  "use strict";

  const form = document.getElementById("contact-form");
  if (!form) return;

  const fields = {
    name: {
      input: document.getElementById("contact-name"),
      error: document.getElementById("name-error"),
    },
    email: {
      input: document.getElementById("contact-email"),
      error: document.getElementById("email-error"),
    },
    phone: {
      input: document.getElementById("contact-phone"),
      error: document.getElementById("phone-error"),
    },
    message: {
      input: document.getElementById("contact-message"),
      error: document.getElementById("message-error"),
    },
  };

  const statusBox = document.getElementById("form-status");
  const messageCount = document.getElementById("message-count");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
  const focusOrder = ["name", "email", "phone", "message"];
  let attempted = false;

  const validators = {
    name(value) {
      const name = value.trim();
      if (!name) return "Please enter your name.";
      if (name.length < 2) return "Please enter at least two characters.";
      return "";
    },
    email(value) {
      const email = value.trim();
      if (!email) return "Please enter your email address.";
      if (!emailPattern.test(email)) return "Enter a valid email address, like you@example.com.";
      return "";
    },
    phone(value) {
      const phone = value.trim();
      if (!phone) return "Please enter your phone number.";
      if (!/^\d+$/.test(phone)) return "Phone number can only contain digits.";
      if (phone.length < 7 || phone.length > 15) {
        return "Enter a phone number between 7 and 15 digits.";
      }
      return "";
    },
    message(value) {
      if (!value.trim()) return "Please write a short message.";
      return "";
    },
  };

  function updateMessageCount() {
    if (messageCount && fields.message.input) {
      messageCount.textContent = String(fields.message.input.value.length);
    }
  }

  function setError(key, message) {
    const field = fields[key];
    if (!field) return !message;
    field.error.textContent = message;
    field.input.setAttribute("aria-invalid", message ? "true" : "false");
    return !message;
  }

  function validateField(key) {
    const field = fields[key];
    if (!field) return true;
    return setError(key, validators[key](field.input.value));
  }

  function clearFormState() {
    Object.keys(fields).forEach((key) => {
      fields[key].error.textContent = "";
      fields[key].input.removeAttribute("aria-invalid");
    });
    statusBox.replaceChildren();
    attempted = false;
  }

  function buildSuccess(name, email, message, phone) {
    const firstName = name.trim().split(/\s+/)[0] || "there";
    const subject = `Portfolio enquiry from ${name.trim()}`;
    const body = `${message.trim()}\n\nFrom: ${name.trim()} <${email.trim()}>\nPhone: ${phone.trim()}`;

    const panel = document.createElement("div");
    panel.className = "form-success";

    const icon = document.createElement("span");
    icon.className = "form-success-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 4 4L19 6"/></svg>';

    const heading = document.createElement("h3");
    heading.id = "form-success-title";
    heading.tabIndex = -1;
    heading.textContent = "Message ready";

    const copy = document.createElement("p");
    copy.textContent = `Thanks, ${firstName}. This site cannot send email on its own, so open your email app to finish sending. I'll reply to ${email.trim()} within one working day.`;

    const mailto = document.createElement("a");
    mailto.className = "btn btn--primary btn--sm";
    mailto.href = `mailto:joshuae0001@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    mailto.textContent = "Open email app";

    const reset = document.createElement("button");
    reset.type = "button";
    reset.className = "btn btn--outline btn--sm";
    reset.textContent = "Write another message";
    reset.addEventListener("click", () => {
      form.hidden = false;
      statusBox.replaceChildren();
      clearFormState();
      updateMessageCount();
      fields.name.input.focus();
    });

    panel.append(icon, heading, copy, mailto, reset);
    return { panel, heading };
  }

  function showSuccess(name, email, message, phone) {
    form.reset();
    updateMessageCount();
    form.hidden = true;

    const success = buildSuccess(name, email, message, phone);
    statusBox.replaceChildren(success.panel);
    success.heading.focus();
  }

  Object.keys(fields).forEach((key) => {
    const input = fields[key].input;
    if (!input) return;

    input.addEventListener("blur", () => {
      if (input.value.trim() || attempted) validateField(key);
    });

    input.addEventListener("input", () => {
      if (key === "message") updateMessageCount();
      if (input.getAttribute("aria-invalid") === "true" || attempted) {
        validateField(key);
      }
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    attempted = true;

    let firstInvalid = null;
    focusOrder.forEach((key) => {
      const valid = validateField(key);
      if (!valid && !firstInvalid) firstInvalid = fields[key].input;
    });

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    showSuccess(fields.name.input.value, fields.email.input.value, fields.message.input.value, fields.phone.input.value);
  });

  updateMessageCount();
})();
