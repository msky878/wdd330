import MovieData from './moviedata.mjs';
import WatchLater from './watchlater.mjs';

const trendingMoviesContainer = document.getElementById('trending-movies');
const watchLaterContainer = document.getElementById('watch-later-container');
const loadMoreBtn = document.getElementById('load-more-btn');
const randomMovieBtn = document.getElementById('randomMovieBtn');
const watchLaterBtn = document.getElementById('watchLaterBtn');
const backToTrendingBtn = document.getElementById('backToTrendingBtn');

const movieData = new MovieData();

// Function to show movie details
function showMovieDetails(movieId, movieTitle) {
    movieData.showMovieDetails(movieId, movieTitle);
}

// Initialize WatchLater with container and showDetails callback
const watchLater = new WatchLater(watchLaterContainer, showMovieDetails);

// Display trending movies
movieData.displayTrendingMovies(trendingMoviesContainer, watchLater);

// Load more trending
loadMoreBtn.addEventListener('click', () => {
    movieData.pages++;
    movieData.displayTrendingMovies(trendingMoviesContainer, watchLater);
});

// Random movie
randomMovieBtn.addEventListener('click', () => {
    movieData.showRandomTrendingMovie();
});

// Show Watch Later list
watchLaterBtn.addEventListener('click', () => {
    trendingMoviesContainer.style.display = 'none';
    loadMoreBtn.style.display = 'none';
    watchLaterContainer.style.display = 'block';
    backToTrendingBtn.style.display = 'inline-block';
    watchLater.displayList();
});

// Return to trending
backToTrendingBtn.addEventListener('click', () => {
    trendingMoviesContainer.style.display = 'grid';
    loadMoreBtn.style.display = 'inline-block';
    watchLaterContainer.style.display = 'none';
    backToTrendingBtn.style.display = 'none';
});
