(() => {
  /*
   * ==========================================================
   * АВТОРИЗАЦИЯ
   * ==========================================================
   *
   * Пока считаем, что после успешной авторизации backend
   * сохраняет токен в localStorage под ключом "auth_token".
   *
   * Если у вас будет другое имя ключа, измените AUTH_TOKEN_KEY.
   * Если позже перейдете на HttpOnly-cookie/Django session,
   * эту проверку лучше заменить на запрос к backend.
   */

  const AUTH_TOKEN_KEY = "auth_token";
  const AUTH_PAGE_URL = "/auth";
  const PROFILE_PAGE_URL = "/profile";

  function getAuthToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  function isUserAuthenticated() {
    const token = getAuthToken();
    return Boolean(token && token.trim() !== "");
  }

  function goToProfile(event) {
    event.preventDefault();

    if (isUserAuthenticated()) {
      window.location.href = PROFILE_PAGE_URL;
      return;
    }

    window.location.href =
      AUTH_PAGE_URL +
      "?next=" +
      encodeURIComponent(PROFILE_PAGE_URL);
  }

  document
    .querySelectorAll(".auth-profile-link")
    .forEach(link => {
      link.addEventListener("click", goToProfile);
    });


  /*
   * ==========================================================
   * ДАННЫЕ
   * ==========================================================
   *
   * Реальный список пока пустой — как вы и просили.
   *
   * Позже метод можно заменить на fetch:
   *
   * async function getTarotCards() {
   *   const response = await fetch("/api/cards/");
   *   if (!response.ok) throw new Error("Ошибка получения каталога");
   *   return await response.json();
   * }
   *
   * Ожидаемый объект:
   * {
   *   id: 1,
   *   name: "Название",
   *   type: "tarot", // tarot | oracle | limited | accessory
   *   typeLabel: "Таро",
   *   count: 78,
   *   price: 4900,
   *   image: "/media/cards/card.jpg",
   *   description: "...",
   *   badge: "Новинка",
   *   url: "/cards/1/"
   * }
   */

  async function getTarotCards() {
    const cards = [];
    return cards;
  }

  const state = {
    cards: [],
    filter: "all",
    search: "",
    favorites: new Set(),
    cart: new Set(),
    modalCardId: null
  };

  const productGrid = document.getElementById("productGrid");
  const catalogInfo = document.getElementById("catalogInfo");
  const tabs = [...document.querySelectorAll(".tab")];
  const categories = [...document.querySelectorAll(".category")];

  function formatPrice(price) {
    if (price === null || price === undefined || price === "") return "";
    const number = Number(price);
    if (!Number.isFinite(number)) return "";
    return new Intl.NumberFormat("ru-RU").format(number) + " ₽";
  }

  function normalizeText(value) {
    return String(value ?? "").trim().toLowerCase();
  }

  function getVisibleCards() {
    const q = normalizeText(state.search);

    return state.cards.filter(card => {
      const categoryMatch =
        state.filter === "all" ||
        card.type === state.filter;

      const searchMatch =
        !q ||
        normalizeText(card.name).includes(q) ||
        normalizeText(card.typeLabel).includes(q) ||
        normalizeText(card.description).includes(q);

      return categoryMatch && searchMatch;
    });
  }

  function updateCounters() {
    document.getElementById("favoritesCount").textContent = state.favorites.size;
    document.getElementById("cartCount").textContent = state.cart.size;
  }

  function updateActiveControls() {
    tabs.forEach(tab => {
      tab.classList.toggle("active", tab.dataset.filter === state.filter);
    });

    categories.forEach(category => {
      category.classList.toggle("active", category.dataset.filter === state.filter);
    });
  }

  function render() {
    const cards = getVisibleCards();

    updateActiveControls();
    updateCounters();

    catalogInfo.textContent =
      cards.length + " " +
      (cards.length === 1 ? "товар" : cards.length >= 2 && cards.length <= 4 ? "товара" : "товаров");

    productGrid.innerHTML = "";

    if (!cards.length) {
      const text = state.search
        ? `По запросу «${state.search}» ничего не найдено.`
        : state.cards.length
          ? "В этой категории пока нет товаров."
          : "Каталог пока пуст. Интерфейс уже готов к данным с backend.";

      productGrid.innerHTML = `
        <div class="empty">
          <div>
            <div class="empty__icon">☾</div>
            <h3>Витрина готовится</h3>
            <p>${text}</p>
          </div>
        </div>
      `;
      return;
    }

    cards.forEach(card => {
      const article = document.createElement("article");
      article.className = "product";

      const isFavorite = state.favorites.has(String(card.id));

      article.innerHTML = `
        <button class="product__img" type="button" data-open-card="${card.id}" aria-label="Открыть ${card.name}">
          ${card.image ? `<img src="${card.image}" alt="${card.name ?? ""}">` : ""}
          ${card.badge ? `<span class="product__badge">${card.badge}</span>` : ""}
        </button>

        <button class="product__heart ${isFavorite ? "active" : ""}" type="button" data-favorite="${card.id}" aria-label="Избранное">
          ${isFavorite ? "♥" : "♡"}
        </button>

        <div class="product__body">
          <h3 class="product__name">${card.name ?? "Без названия"}</h3>

          <div class="product__meta">
            ${card.typeLabel ?? "Авторская колода"}
            ${card.count ? ` · ${card.count} карт` : ""}
          </div>

          <div class="product__bottom">
            <div class="product__price">${formatPrice(card.price)}</div>

            <div class="product__actions">
              <button class="small-btn" type="button" data-open-card="${card.id}">Подробнее</button>
              <button class="small-btn" type="button" data-cart="${card.id}">
                ${state.cart.has(String(card.id)) ? "Добавлено" : "В корзину"}
              </button>
            </div>
          </div>
        </div>
      `;

      productGrid.appendChild(article);
    });
  }

  function setFilter(filter, scroll = false) {
    const allowed = new Set(["all", "tarot", "oracle", "limited", "accessory"]);
    state.filter = allowed.has(filter) ? filter : "all";
    render();

    if (scroll) {
      document.getElementById("catalog").scrollIntoView({behavior:"smooth", block:"start"});
    }
  }

  function toggleFavorite(id) {
    const key = String(id);
    if (state.favorites.has(key)) state.favorites.delete(key);
    else state.favorites.add(key);
    render();
  }

  function toggleCart(id) {
    const key = String(id);
    if (state.cart.has(key)) state.cart.delete(key);
    else state.cart.add(key);
    render();
  }

  const modal = document.getElementById("productModal");
  const modalImage = document.getElementById("modalImage");
  const modalType = document.getElementById("modalType");
  const modalTitle = document.getElementById("modalTitle");
  const modalDescription = document.getElementById("modalDescription");
  const modalPrice = document.getElementById("modalPrice");
  const modalCart = document.getElementById("modalCart");
  const modalFavorite = document.getElementById("modalFavorite");

  function getCard(id) {
    return state.cards.find(card => String(card.id) === String(id));
  }

  function openModal(id) {
    const card = getCard(id);
    if (!card) return;

    state.modalCardId = String(card.id);

    modalImage.innerHTML = card.image
      ? `<img src="${card.image}" alt="${card.name ?? ""}">`
      : "";

    modalType.textContent = card.typeLabel ?? "Авторская колода";
    modalTitle.textContent = card.name ?? "Без названия";
    modalDescription.textContent =
      card.description ??
      "Описание колоды будет отображаться здесь после подключения данных.";

    modalPrice.textContent = formatPrice(card.price);
    modalCart.textContent = state.cart.has(String(card.id))
      ? "Убрать из корзины"
      : "Добавить в корзину";

    modalFavorite.textContent = state.favorites.has(String(card.id))
      ? "Убрать из избранного"
      : "В избранное";

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
  }

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    state.modalCardId = null;
  }

  productGrid.addEventListener("click", event => {
    const open = event.target.closest("[data-open-card]");
    const favorite = event.target.closest("[data-favorite]");
    const cart = event.target.closest("[data-cart]");

    if (open) openModal(open.dataset.openCard);
    if (favorite) toggleFavorite(favorite.dataset.favorite);
    if (cart) toggleCart(cart.dataset.cart);
  });

  tabs.forEach(tab => {
    tab.addEventListener("click", () => setFilter(tab.dataset.filter));
  });

  categories.forEach(category => {
    category.addEventListener("click", () => setFilter(category.dataset.filter, true));
  });

  document.querySelectorAll("[data-nav-filter]").forEach(link => {
    link.addEventListener("click", () => {
      setFilter(link.dataset.navFilter);
    });
  });

  document.querySelectorAll("[data-mobile-filter]").forEach(link => {
    link.addEventListener("click", () => {
      setFilter(link.dataset.mobileFilter);
    });
  });

  // Search
  const searchPanel = document.getElementById("searchPanel");
  const searchInput = document.getElementById("searchInput");

  document.getElementById("searchBtn").addEventListener("click", () => {
    searchPanel.classList.toggle("open");
    if (searchPanel.classList.contains("open")) {
      setTimeout(() => searchInput.focus(), 0);
    }
  });

  document.getElementById("searchForm").addEventListener("submit", event => {
    event.preventDefault();
    state.search = searchInput.value.trim();
    render();
    document.getElementById("catalog").scrollIntoView({behavior:"smooth", block:"start"});
  });

  // Favorites shortcut
  document.getElementById("favoritesBtn").addEventListener("click", () => {
    state.search = "";
    searchInput.value = "";
    const favoriteCards = state.cards.filter(card => state.favorites.has(String(card.id)));

    const original = state.cards;
    state.cards = favoriteCards;
    state.filter = "all";
    render();

    // Restore source list immediately after rendering so the main state remains intact.
    state.cards = original;
    document.getElementById("catalog").scrollIntoView({behavior:"smooth", block:"start"});
  });

  // Modal
  document.getElementById("modalClose").addEventListener("click", closeModal);
  modal.addEventListener("click", event => {
    if (event.target === modal) closeModal();
  });

  modalCart.addEventListener("click", () => {
    if (state.modalCardId !== null) {
      toggleCart(state.modalCardId);
      openModal(state.modalCardId);
    }
  });

  modalFavorite.addEventListener("click", () => {
    if (state.modalCardId !== null) {
      toggleFavorite(state.modalCardId);
      openModal(state.modalCardId);
    }
  });

  // Mobile menu
  const mobileMenu = document.getElementById("mobileMenu");

  function openMenu() {
    mobileMenu.classList.add("open");
    mobileMenu.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
  }

  function closeMenu() {
    mobileMenu.classList.remove("open");
    mobileMenu.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
  }

  document.getElementById("openMenu").addEventListener("click", openMenu);
  document.getElementById("closeMenu").addEventListener("click", closeMenu);
  mobileMenu.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));

  // Subscription is decorative for now.
  document.getElementById("subscribeForm").addEventListener("submit", event => {
    event.preventDefault();
  });

  // Escape closes overlays.
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeModal();
      closeMenu();
      searchPanel.classList.remove("open");
    }
  });

  /*
   * ==========================================================
   * PUBLIC API FOR BACKEND INTEGRATION
   * ==========================================================
   *
   * Позже можно вызвать:
   *
   * SelenaCatalog.setCards(serverCards)
   *
   * и вся витрина сразу обновится.
   */
  window.SelenaCatalog = {
    setCards(cards) {
      state.cards = Array.isArray(cards) ? cards : [];
      state.search = "";
      state.filter = "all";
      render();
    },

    setFilter(filter) {
      setFilter(filter, false);
    },

    getCards() {
      return [...state.cards];
    }
  };

  async function init() {
    try {
      state.cards = await getTarotCards();
    } catch (error) {
      console.error("Ошибка загрузки каталога:", error);
      state.cards = [];
    }

    render();
  }

  init();
})();