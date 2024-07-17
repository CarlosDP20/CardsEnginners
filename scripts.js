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
        const existingImage = editIndex !== null ? cards[editIndex].image : null;
        const newCard = { name, lastname, country, skills, image: existingImage };
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
      addRatingOptions(document.querySelector(".skill-rating"));
      imageInput.value = "";
    });
  
    addSkillBtn.addEventListener("click", addSkill);
  
    removeSkillBtn.addEventListener("click", function() {
      const skills = document.querySelectorAll(".skill");
      if (skills.length > 1) {
        skillsContainer.removeChild(skills[skills.length - 1]);
      }
    });
  
    function renderCards(cardsToRender) {
      cardsContainer.innerHTML = "";
    
      // Agrupar cartas por país
      const cardsByCountry = {};
      cardsToRender.forEach(card => {
        if (!cardsByCountry[card.country]) {
          cardsByCountry[card.country] = [];
        }
        cardsByCountry[card.country].push(card);
      });
    
      // Renderizar las cartas agrupadas por país
      for (const country in cardsByCountry) {
        const countryDivider = document.createElement("div");
        countryDivider.classList.add("country-divider");
        countryDivider.textContent = `País: ${country}`;
        cardsContainer.appendChild(countryDivider);
    
        cardsByCountry[country].forEach((card, index) => {
          const sortedSkills = card.skills.slice().sort((a, b) => b.rating - a.rating);
          const visibleSkills = sortedSkills.slice(0, 5);
          const hiddenSkills = sortedSkills.slice(5);
          const cardElement = document.createElement("div");
          cardElement.classList.add("card");
          cardElement.innerHTML = `
            <div class="card-content">
              <h2>${card.name} ${card.lastname}</h2>
              <p><strong>País:</strong> ${card.country}</p>
              ${card.image ? `<img src="${card.image}" alt="${card.name} ${card.lastname}">` : ""}
              <p><strong>Habilidades:</strong></p>
              <ul class="skills-list">
                ${visibleSkills.map(skill => renderSkill(skill)).join('')}
              </ul>
              ${hiddenSkills.length > 0 ? `<button class="toggle-skills-btn">Mostrar más habilidades (${hiddenSkills.length})</button>
              <ul class="hidden-skills-list" style="max-height: 0; overflow: hidden;">
                ${hiddenSkills.map(skill => renderSkill(skill)).join('')}
              </ul>` : ""}
              <button class="edit-card-btn" data-index="${index}">Editar</button>
              <button class="delete-card-btn" data-index="${index}">Eliminar</button>
            </div>`;
          cardsContainer.appendChild(cardElement);
        });
      }
    
      attachToggleSkillsListeners();
      attachEditCardListeners();
      attachDeleteCardListeners();
    }
    
    
  
    function renderSkill(skill) {
      const progressColor = skill.rating <= 3 ? 'red' : skill.rating <= 7 ? 'yellow' : 'green';
      return `
        <li>
          <div class="progress-bar">
            <div class="progress-${progressColor}" style="width: ${skill.rating * 10}%;">${skill.name} (${skill.rating}/10)</div>
          </div>
        </li>`;
    }
  
    function attachToggleSkillsListeners() {
      const toggleSkillsBtns = document.querySelectorAll('.toggle-skills-btn');
      toggleSkillsBtns.forEach(btn => {
        btn.addEventListener('click', function() {
          const hiddenSkillsList = this.nextElementSibling;
          if (hiddenSkillsList.style.maxHeight) {
            hiddenSkillsList.style.maxHeight = null;
          } else {
            hiddenSkillsList.style.maxHeight = hiddenSkillsList.scrollHeight + "px";
          }
        });
      });
    }
  
    function attachEditCardListeners() {
      const editCardBtns = document.querySelectorAll('.edit-card-btn');
      editCardBtns.forEach(btn => {
        btn.addEventListener('click', function() {
          const index = this.getAttribute('data-index');
          editCard(index);
        });
      });
    }
  
    function editCard(index) {
      const card = cards[index];
      document.getElementById("name").value = card.name;
      document.getElementById("lastname").value = card.lastname;
      document.getElementById("country").value = card.country;
      skillsContainer.innerHTML = "";
      card.skills.forEach(skill => {
        const newSkill = document.createElement("div");
        newSkill.classList.add("skill");
        newSkill.innerHTML = `<input type="text" class="skill-name" placeholder="Habilidad" value="${skill.name}" required>
                              <select class="skill-rating">${Array.from({ length: 10 }, (_, i) => `<option value="${i + 1}" ${i + 1 == skill.rating ? 'selected' : ''}>${i + 1}</option>`).join('')}</select>`;
        skillsContainer.appendChild(newSkill);
      });
      addRatingOptions(document.querySelector(".skill-rating"));
      document.getElementById("image").value = "";
  
      // Mostrar el formulario si está oculto
      createCardForm.style.display = "block";
  
      // Desplazarse a la sección de edición
      createCardForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  
      editIndex = index;
    }
  
    function attachDeleteCardListeners() {
      const deleteCardBtns = document.querySelectorAll('.delete-card-btn');
      deleteCardBtns.forEach(btn => {
        btn.addEventListener('click', function() {
          const index = this.getAttribute('data-index');
          deleteCard(index);
        });
      });
    }
  
    function deleteCard(index) {
      cards.splice(index, 1);
      localStorage.setItem("cards", JSON.stringify(cards));
      renderCards(cards);
    }
  
    searchInput.addEventListener("input", function() {
      const searchTerm = searchInput.value.toLowerCase();
      const filteredCards = cards.filter(card => card.skills.some(skill => skill.name.toLowerCase().includes(searchTerm)));
      filteredCards.forEach(card => {
        const skillIndex = card.skills.findIndex(skill => skill.name.toLowerCase().includes(searchTerm));
        if (skillIndex !== -1) {
          const skill = card.skills[skillIndex];
          const remainingSkills = card.skills.slice();
          remainingSkills.splice(skillIndex, 1);
          card.skills = [skill, ...remainingSkills];
        }
      });
      renderCards(filteredCards);
    });
  
    saveJsonBtn.addEventListener("click", function() {
      const dataStr = JSON.stringify(cards, null, 2);
      const downloadAnchorNode = document.createElement("a");
      downloadAnchorNode.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(dataStr));
      downloadAnchorNode.setAttribute("download", "cards.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    });
  
    importJsonBtn.addEventListener("click", function() {
      importFileInput.click();
    });
  
    importFileInput.addEventListener("change", function() {
      const file = importFileInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
          const importedCards = JSON.parse(event.target.result);
          if (Array.isArray(importedCards)) {
            cards = importedCards;
            localStorage.setItem("cards", JSON.stringify(cards));
            renderCards(cards);
          } else {
            alert("El archivo seleccionado no contiene datos válidos.");
          }
        };
        reader.readAsText(file);
      }
    });
  
    showFormBtn.addEventListener("click", function() {
      createCardForm.style.display = "block";
    });
  
    function init() {
      renderCards(cards);
      addRatingOptions(document.querySelector(".skill-rating"));
    }
  
    init();
  });
  