const openFormBtn = document.getElementById("openFormBtn");
const feedbackModal = document.getElementById("feedbackModal");
const closeBtn = document.querySelector(".close");
const feedbackForm = document.getElementById("feedbackForm");
const messageContainer = document.getElementById("messageContainer");

const STORAGE_KEY = "feedbackFormData";

function openModal() {
  feedbackModal.style.display = "block";
  restoreFormData();
  history.pushState({ modalOpen: true }, "", "#feedback");
}

function closeModal() {
  feedbackModal.style.display = "none";
  clearMessage();
  if (window.location.hash === "#feedback") {
    history.back();
  }
}

openFormBtn.addEventListener("click", openModal);
closeBtn.addEventListener("click", closeModal);

window.addEventListener("click", (event) => {
  if (event.target === feedbackModal) {
    closeModal();
  }
});

window.addEventListener("popstate", (event) => {
  if (!event.state || !event.state.modalOpen) {
    feedbackModal.style.display = "none";
    clearMessage();
  }
});

function saveFormData() {
  const formData = {
    fullName: document.getElementById("fullName").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    organization: document.getElementById("organization").value,
    message: document.getElementById("message").value,
    privacyPolicy: document.getElementById("privacyPolicy").checked,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
}

function restoreFormData() {
  const savedData = localStorage.getItem(STORAGE_KEY);

  if (savedData) {
    const formData = JSON.parse(savedData);

    document.getElementById("fullName").value = formData.fullName || "";
    document.getElementById("email").value = formData.email || "";
    document.getElementById("phone").value = formData.phone || "";
    document.getElementById("organization").value = formData.organization || "";
    document.getElementById("message").value = formData.message || "";
    document.getElementById("privacyPolicy").checked =
      formData.privacyPolicy || false;
  }
}

function clearFormData() {
  localStorage.removeItem(STORAGE_KEY);
  feedbackForm.reset();
}

function showMessage(message, isSuccess) {
  messageContainer.textContent = message;
  messageContainer.className = `message-container ${
    isSuccess ? "message-success" : "message-error"
  }`;
  messageContainer.style.display = "block";

  setTimeout(() => {
    clearMessage();
  }, 5000);
}

function clearMessage() {
  messageContainer.style.display = "none";
  messageContainer.textContent = "";
  messageContainer.className = "message-container";
}

feedbackForm.addEventListener("input", saveFormData);
feedbackForm.addEventListener("change", saveFormData);

feedbackForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!document.getElementById("privacyPolicy").checked) {
    showMessage(
      "Необходимо согласие с политикой обработки персональных данных",
      false
    );
    return;
  }

  const formData = new FormData(feedbackForm);
  const data = {
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    organization: formData.get("organization"),
    message: formData.get("message"),
  };

  try {
    const response = await fetch("https://formcarry.com/s/OjUeCJfYQ5x", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.code === 200) {
      showMessage("Сообщение успешно отправлено!", true);
      clearFormData();

      setTimeout(() => {
        closeModal();
      }, 2000);
    } else {
      showMessage("Ошибка при отправке сообщения. Попробуйте еще раз.", false);
    }
  } catch (error) {
    console.error("Ошибка:", error);
    showMessage(
      "Произошла ошибка при отправке. Проверьте подключение к интернету.",
      false
    );
  }
});
