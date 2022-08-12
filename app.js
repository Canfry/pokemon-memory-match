const game = document.getElementById('game');
const pokeAPIBaseUrl = 'https://pokeapi.co/api/v2/pokemon/';

let isPaused = false;
let firstPick;
let matches;

const colors = {
  fire: '#FDDFDF',
  grass: '#DEFDE0',
  electric: '#FCF7DE',
  water: '#DEF3FD',
  ground: '#f4e7da',
  rock: '#d5d5d4',
  fairy: '#fceaff',
  poison: '#98d7a5',
  bug: '#f8d5a3',
  dragon: '#97b3e6',
  psychic: '#eaeda1',
  flying: '#F5F5F5',
  fighting: '#E6E0D4',
  normal: '#F5F5F5',
};

const loadPokemon = async () => {
  // create a set so there is not duplicate
  const randomIds = new Set();
  while (randomIds.size < 8) {
    const randomNumber = Math.floor(Math.random() * 150);
    randomIds.add(randomNumber);
  }
  console.log([...randomIds]);
  // const randomArray = [...randomIds];
  // for (let i = 0; i < randomArray.length; i++) {
  //   const res = await fetch(pokeAPIBaseUrl + randomArray[i]);
  //   const pokemon = await res.json();
  //   console.log(pokemon);
  // }

  // Instaead can use Promise.all() to take care about an Array of promises.
  const pokePromises = [...randomIds].map((id) => fetch(pokeAPIBaseUrl + id));
  console.log(pokePromises);
  const responses = await Promise.all(pokePromises);
  return await Promise.all(responses.map((res) => res.json()));
};

const displayPokemon = (pokemon) => {
  // The 2 arrays of Pokemon cards have to appear in a random order and not one array and then the other.
  pokemon.sort((_) => Math.random() - 0.5);
  const pokemonHTML = pokemon
    .map((poke) => {
      const type = poke.types[0]?.type?.name || 'normal';
      const color = colors[type];
      return `
    <div class='card' style='background-color: ${color}' onClick='clickCard(event)' data-pokename='${poke.name}'>
      <div class='front'></div>
      <div class='back rotated' style='background-color: ${color}'>
        <img src='${poke.sprites.front_default}' alt=${poke.name}/>
        <h2>${poke.name}</h2>
      </div>
    </div>
    `;
    })
    .join('');
  game.innerHTML = pokemonHTML;
};

const clickCard = (event) => {
  // console.log(event.currentTarget.dataset.pokename);
  const pokemonCard = event.currentTarget;
  const [front, back] = getFrontAndBackFromCard(pokemonCard);

  if (front.classList.contains('rotated') || isPaused) return;

  isPaused = true;
  rotateElements([front, back]);
  if (!firstPick) {
    firstPick = pokemonCard;
    isPaused = false;
  } else {
    const secondPokemonName = pokemonCard.dataset.pokename;
    const firstPokemonName = firstPick.dataset.pokename;
    if (firstPokemonName !== secondPokemonName) {
      const [firstFront, firstback] = getFrontAndBackFromCard(firstPick);
      setTimeout(() => {
        rotateElements([front, back, firstFront, firstback]);
        firstPick = null;
        isPaused = false;
      }, 500);
    } else {
      matches++;
      if (matches === 8) {
        alert('Winner');
      }
      firstPick = null;
      isPaused = false;
    }
  }
};

const rotateElements = (elements) => {
  // Be sure that elements is an Array
  if (typeof elements !== 'object' || !elements.length) return;
  elements.forEach((element) => element.classList.toggle('rotated'));
};

const getFrontAndBackFromCard = (card) => {
  const front = card.querySelector('.front');
  const back = card.querySelector('.back');
  return [front, back];
};

const resetGame = () => {
  game.innerHTML = '';
  isPaused = true;
  firstPick = null;
  matches = 0;
  setTimeout(async () => {
    const pokemon = await loadPokemon();
    // Pokemon Card have to appear twice
    displayPokemon([...pokemon, ...pokemon]);
    isPaused = false;
  }, 200);
};

resetGame();
