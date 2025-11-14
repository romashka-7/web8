// Элементы DOM
const openFormBtn = document.getElementById("openFormBtn");
const feedbackModal = document.getElementById("feedbackModal");
const closeBtn = document.querySelector(".close");
const feedbackForm = document.getElementById("feedbackForm");
const messageContainer = document.getElementById("messageContainer");

// Ключ для LocalStorage
const STORAGE_KEY = "feedbackFormData";

// Функция для открытия модального окна
function openModal() {
  feedbackModal.style.display = "block";
  restoreFormData();
  // Добавляем состояние в историю браузера
  history.pushState({ modalOpen: true }, "", "#feedback");
}

// Функция для закрытия модального окна
function closeModal() {
  feedbackModal.style.display = "none";
  clearMessage();
  // Возвращаем URL к исходному состоянию
  if (window.location.hash === "#feedback") {
    history.back();
  }
}

// Обработчики событий для открытия/закрытия модального окна
openFormBtn.addEventListener("click", openModal);
closeBtn.addEventListener("click", closeModal);

// Закрытие модального окна при клике вне его области
window.addEventListener("click", (event) => {
  if (event.target === feedbackModal) {
    closeModal();
  }
});

// Обработка кнопки "Назад" в браузере
window.addEventListener("popstate", (event) => {
  if (!event.state || !event.state.modalOpen) {
    feedbackModal.style.display = "none";
    clearMessage();
  }
});

// Сохранение данных формы в LocalStorage
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

// Восстановление данных формы из LocalStorage
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

// Очистка данных формы из LocalStorage
function clearFormData() {
  localStorage.removeItem(STORAGE_KEY);

  // Сброс значений формы
  feedbackForm.reset();
}

// Отображение сообщения
function showMessage(message, isSuccess) {
  messageContainer.textContent = message;
  messageContainer.className = `message-container ${
    isSuccess ? "message-success" : "message-error"
  }`;
  messageContainer.style.display = "block";

  // Автоматическое скрытие сообщения через 5 секунд
  setTimeout(() => {
    clearMessage();
  }, 5000);
}

// Очистка сообщения
function clearMessage() {
  messageContainer.style.display = "none";
  messageContainer.textContent = "";
  messageContainer.className = "message-container";
}

// Обработчик изменения формы для сохранения данных
feedbackForm.addEventListener("input", saveFormData);
feedbackForm.addEventListener("change", saveFormData);

// Обработчик отправки формы
feedbackForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  // Проверка согласия с политикой
  if (!document.getElementById("privacyPolicy").checked) {
    showMessage(
      "Необходимо согласие с политикой обработки персональных данных",
      false
    );
    return;
  }

  // Сбор данных формы
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

      // Закрытие формы через 2 секунды после успешной отправки
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
