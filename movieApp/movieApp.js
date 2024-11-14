const apiKey = '261870a3b747009bee9ac11793e1c6bf'; 
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const moviesGrid = document.getElementById('moviesGrid');
const suggestions = document.getElementById('suggestions');
const movieModal = document.getElementById('movieModal');
const closeModal = document.getElementById('closeModal');
const watchlistBtn = document.getElementById('watchlistBtn');
const watchlistPageBtn = document.getElementById('watchlistPageBtn');

async function searchMovies(query) {
    const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`);
    const data = await response.json();
    displayMovies(data.results);
}
function displayMovies(movies) {
    moviesGrid.innerHTML = ''; 
    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        const posterPath = movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : 'placeholder.jpg';
        movieCard.innerHTML = `
            <img src="${posterPath}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <p>Release Date: ${movie.release_date}</p>
        `;
        movieCard.addEventListener('click', () => showMovieDetails(movie));
        moviesGrid.appendChild(movieCard);
    });
}

async function showMovieDetails(movie) {
    console.log('Открытие модального окна для фильма:', movie.title);
    
    document.getElementById('movieTitle').textContent = movie.title;
    document.getElementById('movieSynopsis').textContent = movie.overview || "No synopsis available.";
    document.getElementById('movieRating').textContent = movie.vote_average || "N/A";
    document.getElementById('movieRuntime').textContent = 'Loading...';

    movieModal.style.display = 'flex'; 

    /*
    const response = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}`);
    const movieDetails = await response.json();
    document.getElementById('movieRuntime').textContent = movieDetails.runtime ? `${movieDetails.runtime} mins` : 'N/A';
    */
}




if (closeModal) {
    closeModal.addEventListener('click', () => {
        console.log("Закрытие модального окна"); 
        movieModal.style.display = 'none';
    });
}

function addToWatchlist(movie) {
    let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    if (!watchlist.some(watchedMovie => watchedMovie.id === movie.id)) {
        watchlist.push(movie);
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
    }
}
if (searchBtn) {
    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            searchMovies(query);
            suggestions.style.display = 'none';
        }
    });
}

if (searchInput) {
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim();
        if (query.length > 2) {
            fetchSuggestions(query);
        } else {
            suggestions.style.display = 'none'; 
        }
    });
}


async function fetchSuggestions(query) {
    const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`);
    const data = await response.json();
    displaySuggestions(data.results);
}

function displaySuggestions(movies) {
    suggestions.innerHTML = ''; 
    if (movies.length > 0) {
        movies.forEach(movie => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = movie.title;
            suggestionItem.addEventListener('click', () => {
                searchInput.value = movie.title; 
                suggestions.style.display = 'none';
                searchMovies(movie.title); 
            });
            suggestions.appendChild(suggestionItem);
        });
        suggestions.style.display = 'block'; 
    } else {
        suggestions.style.display = 'none'; 
    }
}

if (watchlistPageBtn) {
    watchlistPageBtn.addEventListener('click', () => {
        window.location.href = 'watchlist.html'; 
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const watchlistGrid = document.getElementById('watchlistGrid');
    const backToSearchBtn = document.getElementById('backToSearchBtn');
    let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

    function displayWatchlist() {
        watchlistGrid.innerHTML = ''; 
        if (watchlist.length > 0) {
            watchlist.forEach(movie => {
                const movieCard = document.createElement('div');
                movieCard.classList.add('movie-card');
                const posterPath = movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : 'placeholder.jpg';
                movieCard.innerHTML = `
                    <img src="${posterPath}" alt="${movie.title}">
                    <h3>${movie.title}</h3>
                    <p>Release Date: ${movie.release_date}</p>
                    <button class="remove-btn" onclick="removeFromWatchlist(${movie.id})">Remove</button>
                `;
                watchlistGrid.appendChild(movieCard);
            });
        } else {
            watchlistGrid.innerHTML = '<p>Your watchlist is empty.</p>';
        }
    }

    window.removeFromWatchlist = function(movieId) {
        watchlist = watchlist.filter(movie => movie.id !== movieId);
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        displayWatchlist(); 
    }

    displayWatchlist();

    if (backToSearchBtn) {
        backToSearchBtn.addEventListener('click', () => {
            window.location.href = 'movieApp.html'; 
        });
    }
});

window.addEventListener('click', (event) => {
    if (event.target === movieModal) {
        movieModal.style.display = 'none';
    }
});
