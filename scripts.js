document.addEventListener("DOMContentLoaded", function() {
  const form = document.getElementById("form");
  const addSkillBtn = document.getElementById("addSkillBtn");
  const removeSkillBtn = document.getElementById("removeSkillBtn");
  const skillsContainer = document.getElementById("skillsContainer");
  const cardsContainer = document.getElementById("cardsContainer");
  const searchInput = document.getElementById("searchInput");
  const saveJsonBtn = document.getElementById("saveJsonBtn");
  const importJsonBtn = document.getElementById("importJsonBtn");
  const importFileInput = document.getElementById("importFileInput");
  const showFormBtn = document.getElementById("showFormBtn");
  const createCardForm = document.getElementById("createCardForm");
  let cards = JSON.parse(localStorage.getItem("cards")) || [];
  let editIndex = null;

  function addRatingOptions(selectElement) {
    for (let i = 1; i <= 10; i++) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = i;
      selectElement.appendChild(option);
    }
  }

  function addSkill() {
    const newSkill = document.createElement("div");
    newSkill.classList.add("skill");
    newSkill.innerHTML = `<input type="text" class="skill-name" placeholder="Habilidad" required>
                          <select class="skill-rating"></select>`;
    const selectElement = newSkill.querySelector(".skill-rating");
    addRatingOptions(selectElement);
    skillsContainer.appendChild(newSkill);
  }

  form.addEventListener("submit", function(event) {
    event.preventDefault();
    const name = document.getElementById("name").value;
    const lastname = document.getElementById("lastname").value;
    const country = document.getElementById("country").value;
    const skills = Array.from(document.querySelectorAll(".skill")).map(skill => ({
      name: skill.querySelector(".skill-name").value,
      rating: skill.querySelector(".skill-rating").value
    }));
    const imageInput = document.getElementById("image");
    const image = imageInput.files[0];
    const reader = new FileReader();
    reader.onload = function() {
      const imageDataURL = reader.result;
      const newCard = { name, lastname, country, skills, image: imageDataURL };
      if (editIndex !== null) {
        cards[editIndex] = newCard;
        editIndex = null;
      } else {
        cards.push(newCard);
      }
      localStorage.setItem("cards", JSON.stringify(cards));
      renderCards(cards);
    };
    if (image) {
      reader.readAsDataURL(image);
    } else {
      const newCard = { name, lastname, country, skills, image: null };
      if (editIndex !== null) {
        cards[editIndex] = newCard;
        editIndex = null;
      } else {
        cards.push(newCard);
      }
      localStorage.setItem("cards", JSON.stringify(cards));
      renderCards(cards);
    }
    form.reset();
    skillsContainer.innerHTML = `<div class="skill">
      <input type="text" class="skill-name" placeholder="Habilidad" required>
      <select class="skill-rating"></select>
    </div>`;
  });

  addSkillBtn.addEventListener("click", addSkill);

  removeSkillBtn.addEventListener("click", function() {
    const skills = document.querySelectorAll(".skill");
    if (skills.length > 1) {
      skills[skills.length - 1].remove();
    }
  });

  function renderCards(cardsToShow) {
    cardsContainer.innerHTML = "";
    if (cardsToShow.length === 0) {
      cardsContainer.innerHTML = "<p>No hay tarjetas para mostrar.</p>";
    } else {
      cardsToShow.forEach((card, index) => {
        const cardElement = document.createElement("div");
        cardElement.classList.add("card");
        cardElement.innerHTML = `
          <img src="${card.image ? card.image : 'placeholder.png'}" alt="Foto de perfil">
          <div class="card-content">
            <h2>${card.name} ${card.lastname}</h2>
            <p><strong>País:</strong> ${card.country}</p>
            <h3>Habilidades:</h3>
            <ul class="skills-list">
              ${card.skills.map(renderSkill).join('')}
            </ul>
          </div>
          <button onclick="editCard(${index})">Editar</button>
          <button onclick="deleteCard(${index})">Eliminar</button>
        `;
        cardsContainer.appendChild(cardElement);
      });
    }
  }

  function renderSkill(skill) {
    const progressColor = skill.rating <= 3 ? 'progress-red' : skill.rating <= 7 ? 'progress-yellow' : 'progress-green';
    return `
      <li>
        <div class="progress-bar">
          <div class="${progressColor}" style="width: ${skill.rating * 10}%;">${skill.name} (${skill.rating}/10)</div>
        </div>
      </li>`;
  }

  function editCard(index) {
    const cardToEdit = cards[index];
    document.getElementById("name").value = cardToEdit.name;
    document.getElementById("lastname").value = cardToEdit.lastname;
    document.getElementById("country").value = cardToEdit.country;
    document.getElementById("image").value = "";
    skillsContainer.innerHTML = "";
    cardToEdit.skills.forEach(skill => {
      const newSkill = document.createElement("div");
      newSkill.classList.add("skill");
      newSkill.innerHTML = `<input type="text" class="skill-name" value="${skill.name}" required>
                            <select class="skill-rating"></select>`;
      const selectElement = newSkill.querySelector(".skill-rating");
      addRatingOptions(selectElement);
      selectElement.value = skill.rating;
      skillsContainer.appendChild(newSkill);
    });
    editIndex = index;
    window.scrollTo(0, 0);
  }

  function deleteCard(index) {
    cards.splice(index, 1);
    localStorage.setItem("cards", JSON.stringify(cards));
    renderCards(cards);
  }

  searchInput.addEventListener("input", function() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const filteredCards = cards.filter(card =>
      card.name.toLowerCase().includes(searchTerm) ||
      card.lastname.toLowerCase().includes(searchTerm) ||
      card.country.toLowerCase().includes(searchTerm)
    );
    renderCards(filteredCards);
  });

  saveJsonBtn.addEventListener("click", function() {
    const json = JSON.stringify(cards, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cards.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  importJsonBtn.addEventListener("click", function() {
    importFileInput.click();
  });

  importFileInput.addEventListener("change", function() {
    const file = importFileInput.files[0];
    const reader = new FileReader();
    reader.onload = function(event) {
      const importedCards = JSON.parse(event.target.result);
      if (Array.isArray(importedCards)) {
        cards = importedCards;
        localStorage.setItem("cards", JSON.stringify(cards));
        renderCards(cards);
      } else {
        alert("El archivo JSON debe contener un arreglo de tarjetas.");
      }
    };
    reader.readAsText(file);
  });

  showFormBtn.addEventListener("click", function() {
    createCardForm.classList.toggle("card-form");
    showFormBtn.textContent = createCardForm.classList.contains("card-form") ? "Ocultar formulario" : "Mostrar formulario";
    form.reset();
    skillsContainer.innerHTML = `<div class="skill">
      <input type="text" class="skill-name" placeholder="Habilidad" required>
      <select class="skill-rating"></select>
    </div>`;
    addRatingOptions(document.querySelector(".skill-rating"));
    editIndex = null;
  });

  renderCards(cards);
});
