const apiKey = 'd93abaa72c3c412c90877a1ce8193280';
const apiBaseUrl = 'https://api.spoonacular.com/recipes';

function searchRecipes() {
    const query = document.getElementById('searchInput').value;
    if (query) {
        document.getElementById('suggestions').style.display = 'none'; 
        fetch(`${apiBaseUrl}/complexSearch?query=${query}&number=12&apiKey=${apiKey}`)
            .then(response => response.json())
            .then(data => displayRecipes(data.results));
    }
}

function autoSuggest() {
    const query = document.getElementById('searchInput').value;
    if (query.length > 2) {
        fetch(`${apiBaseUrl}/autocomplete?query=${query}&number=5&apiKey=${apiKey}`)
            .then(response => response.json())
            .then(data => {
                const suggestions = document.getElementById('suggestions');
                if (data.length) {
                    suggestions.innerHTML = data.map(recipe => `<p onclick="selectSuggestion('${recipe.title}')">${recipe.title}</p>`).join('');
                    suggestions.style.display = 'block';
                } else {
                    suggestions.style.display = 'none';
                }
            });
    } else {
        document.getElementById('suggestions').style.display = 'none';
    }
}

function selectSuggestion(title) {
    document.getElementById('searchInput').value = title;
    document.getElementById('suggestions').style.display = 'none';
}



async function displayRecipes(recipes) {
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.innerHTML = '';

    if (recipes.length === 0) {
        resultsContainer.innerHTML = '<p class="no-results">No recipes found. Try a different search!</p>';
        return;
    }

    for (let recipe of recipes) {
        let prepTime = 'N/A';
        
        if (recipe.readyInMinutes !== undefined) {
            prepTime = recipe.readyInMinutes;
        } else {
            try {
                const response = await fetch(`${apiBaseUrl}/${recipe.id}/information?apiKey=${apiKey}`);
                const recipeDetails = await response.json();
                prepTime = recipeDetails.readyInMinutes || 'N/A'; 
            } catch (error) {
                console.error('Error fetching additional recipe details:', error);
            }
        }

        const recipeCard = document.createElement('div');
        recipeCard.className = 'recipe-card';
        recipeCard.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}">
            <div class="recipe-info">
                <h3 class="recipe-name">${recipe.title}</h3>
                <p class="prep-time"><span>⏱️</span> ${prepTime} mins</p>
                <p class="short-description">${recipe.summary ? recipe.summary.slice(0, 80) + '...' : ''}</p>
                <button class="view-button" onclick="viewRecipeDetails(${recipe.id})">View Details</button>
                <button class="favorite-button" onclick="addToFavorites(${recipe.id}, '${recipe.title}', '${recipe.image}', '${prepTime}')">Add to Favorites</button>
            </div>
        `;
        resultsContainer.appendChild(recipeCard);
    }
}

async function viewRecipeDetails(recipeId) {
    try {
        const response = await fetch(`${apiBaseUrl}/${recipeId}/information?apiKey=${apiKey}`);
        const recipe = await response.json();

        const calories = recipe.nutrition && recipe.nutrition.nutrients ?
            recipe.nutrition.nutrients.find(n => n.name === 'Calories') : { amount: 'N/A' };
        const prepTime = recipe.readyInMinutes !== undefined ? recipe.readyInMinutes : 'N/A';

        const recipeDetails = document.getElementById('recipeDetails');
        recipeDetails.innerHTML = `
            <h2>${recipe.title}</h2>
            <img src="${recipe.image}" alt="${recipe.title}">
            <h3>Ingredients:</h3>
            <ul>${recipe.extendedIngredients.map(ing => `<li>${ing.original}</li>`).join('')}</ul>
            <h3>Instructions:</h3>
            <p>${recipe.instructions}</p>
            <h3>Nutritional Information:</h3>
            <p>Calories: ${calories.amount !== 'N/A' ? calories.amount : 'Not available'} kcal</p>
            <h3>Preparation Time:</h3>
            <p>${prepTime} mins</p>
        `;

        document.getElementById('recipeModal').style.display = 'block';
    } catch (error) {
        console.error('Error fetching recipe details:', error);
        alert('Error fetching recipe details. Please try again later.');
    }
}

function closeModal() {
    document.getElementById('recipeModal').style.display = 'none';
}

function addToFavorites(id, title, image, readyInMinutes) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (!favorites.some(fav => fav.id === id)) {
        favorites.push({ id, title, image, readyInMinutes });
        localStorage.setItem('favorites', JSON.stringify(favorites));
        alert(`${title} added to favorites!`);
    } else {
        alert(`${title} is already in favorites.`);
    }
}

function displayFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.innerHTML = '';

    if (favorites.length === 0) {
        resultsContainer.innerHTML = '<p class="no-results">No favorite recipes found. Try adding some!</p>';
        return;
    }

    favorites.forEach(favorite => {
        const prepTime = favorite.readyInMinutes !== undefined ? favorite.readyInMinutes : 'N/A';
        const recipeCard = document.createElement('div');
        recipeCard.className = 'recipe-card';
        recipeCard.innerHTML = `
            <img src="${favorite.image}" alt="${favorite.title}">
            <div class="recipe-info">
                <h3 class="recipe-name">${favorite.title}</h3>
                <p class="prep-time"><span>⏱️</span> ${prepTime} mins</p>
                <button class="view-button" onclick="viewRecipeDetails(${favorite.id})">View Details</button>
                <button class="remove-button" onclick="removeFromFavorites(${favorite.id})">Remove</button>
            </div>
        `;
        resultsContainer.appendChild(recipeCard);
    });
}

function removeFromFavorites(recipeId) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites = favorites.filter(favorite => favorite.id !== recipeId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    displayFavorites();
}

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    if (path.includes('saved-recipe.html')) {
        displayFavorites();
    }
});
