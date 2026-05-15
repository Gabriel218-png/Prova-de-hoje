const navButtons = document.querySelectorAll('.nav-button');
const contentTitle = document.getElementById('content-title');
const contentDescription = document.getElementById('content-description');
const cardsContainer = document.getElementById('cards-container');
const statusMessage = document.getElementById('status-message');
const themeToggle = document.getElementById('theme-toggle');

const pages = {
    home: {
        title: 'Bem-vindo ao Entertainment API Hub',
        description: 'Clique em um dos botões para carregar dados reais da PokéAPI em cards responsivos.',
        action: showHome,
    },
    pokemon: {
        title: 'Pokémons da PokéAPI',
        description: 'Veja informações sobre Pokémons, incluindo imagem, tipos, altura e peso.',
        action: loadPokemons,
    },
    abilities: {
        title: 'Habilidades da PokéAPI',
        description: 'Explore habilidades e seus efeitos em português quando disponíveis.',
        action: loadAbilities,
    },
    types: {
        title: 'Tipos da PokéAPI',
        description: 'Confira tipos e relações de dano para montar cards informativos.',
        action: loadTypes,
    },
};

navButtons.forEach((button) => {
    button.addEventListener('click', () => {
        navButtons.forEach((btn) => btn.classList.remove('active'));
        button.classList.add('active');
        const page = button.dataset.page;
        const pageConfig = pages[page];
        contentTitle.textContent = pageConfig.title;
        contentDescription.textContent = pageConfig.description;
        pageConfig.action();
    });
});

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    themeToggle.textContent = isDark ? 'Modo claro' : 'Modo escuro';
});

function showHome() {
    statusMessage.textContent = 'Pronto para carregar dados.';
    cardsContainer.innerHTML = `
        <article class="card card-large">
            <h3>Menu inicial</h3>
            <p>Selecione uma área para exibir cards de Pokémons, habilidades ou tipos.</p>
        </article>
    `;
}

async function loadPokemons() {
    updateStatus('Buscando pokémons...');
    cardsContainer.innerHTML = '';
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=6');
        const data = await response.json();
        const cards = await Promise.all(
            data.results.map(async (pokemon) => {
                const details = await fetch(pokemon.url).then((res) => res.json());
                return createPokemonCard(details);
            })
        );
        cardsContainer.innerHTML = cards.join('');
        updateStatus('Pokémons carregados com sucesso.');
    } catch (error) {
        updateStatus('Falha ao carregar pokémons. Tente novamente.');
        cardsContainer.innerHTML = `<article class="card card-large"><h3>Erro</h3><p>Não foi possível obter os dados da API.</p></article>`;
        console.error(error);
    }
}

async function loadAbilities() {
    updateStatus('Buscando habilidades...');
    cardsContainer.innerHTML = '';
    try {
        const response = await fetch('https://pokeapi.co/api/v2/ability?limit=6');
        const data = await response.json();
        const cards = await Promise.all(
            data.results.map(async (ability) => {
                const details = await fetch(ability.url).then((res) => res.json());
                return createAbilityCard(details);
            })
        );
        cardsContainer.innerHTML = cards.join('');
        updateStatus('Habilidades carregadas com sucesso.');
    } catch (error) {
        updateStatus('Falha ao carregar habilidades. Tente novamente.');
        cardsContainer.innerHTML = `<article class="card card-large"><h3>Erro</h3><p>Não foi possível obter os dados da API.</p></article>`;
        console.error(error);
    }
}

async function loadTypes() {
    updateStatus('Buscando tipos...');
    cardsContainer.innerHTML = '';
    try {
        const response = await fetch('https://pokeapi.co/api/v2/type?limit=6');
        const data = await response.json();
        const cards = await Promise.all(
            data.results.map(async (typeItem) => {
                const details = await fetch(typeItem.url).then((res) => res.json());
                return createTypeCard(details);
            })
        );
        cardsContainer.innerHTML = cards.join('');
        updateStatus('Tipos carregados com sucesso.');
    } catch (error) {
        updateStatus('Falha ao carregar tipos. Tente novamente.');
        cardsContainer.innerHTML = `<article class="card card-large"><h3>Erro</h3><p>Não foi possível obter os dados da API.</p></article>`;
        console.error(error);
    }
}

function createPokemonCard(pokemon) {
    const types = pokemon.types.map((item) => `<span class="tag">${item.type.name}</span>`).join('');
    return `
        <article class="card">
            <img src="${pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}" alt="${pokemon.name}" loading="lazy">
            <h3>${pokemon.name}</h3>
            <p><strong>Altura:</strong> ${pokemon.height / 10} m</p>
            <p><strong>Peso:</strong> ${pokemon.weight / 10} kg</p>
            <div class="tag-list">${types}</div>
        </article>
    `;
}

function createAbilityCard(ability) {
    const effectEntry = ability.effect_entries.find((entry) => entry.language.name === 'en') || ability.effect_entries[0];
    const shortEffect = effectEntry ? effectEntry.short_effect : 'Descrição não disponível.';
    return `
        <article class="card">
            <h3>${ability.name}</h3>
            <p><strong>Classe:</strong> ${ability.generation.name}</p>
            <p>${shortEffect}</p>
            <div class="tag-list">
                <span class="tag">Pokémon afetado: ${ability.pokemon.length}</span>
                <span class="tag">Efeito por geração</span>
            </div>
        </article>
    `;
}

function createTypeCard(type) {
    const damageTo = Object.keys(type.damage_relations.double_damage_to)
        .map((item) => `<span class="tag">${item}</span>`)
        .join('');
    const damageFrom = Object.keys(type.damage_relations.double_damage_from)
        .map((item) => `<span class="tag">${item}</span>`)
        .join('');
    return `
        <article class="card">
            <h3>${type.name}</h3>
            <p><strong>Pokémons registrados:</strong> ${type.pokemon.length}</p>
            <p>Tipos fortes contra:</p>
            <div class="tag-list">${damageTo || '<span class="tag">Nenhum</span>'}</div>
            <p>Tipos vulneráveis a:</p>
            <div class="tag-list">${damageFrom || '<span class="tag">Nenhum</span>'}</div>
        </article>
    `;
}

function updateStatus(message) {
    statusMessage.textContent = message;
}

showHome();
