import MovieData from './moviedata.mjs';
import WatchLater from './watchlater.mjs';

const trendingMoviesContainer = document.getElementById('trending-movies');
const watchLaterContainer = document.getElementById('watch-later-container');
const loadMoreBtn = document.getElementById('load-more-btn');
const randomMovieBtn = document.getElementById('randomMovieBtn');
const watchLaterBtn = document.getElementById('watchLaterBtn');
const backToTrendingBtn = document.getElementById('backToTrendingBtn');

const movieData = new MovieData();
const watchLater = new WatchLater(watchLaterContainer, showMovieDetails);

function showMovieDetails(movieId, movieTitle) {
    movieData.showMovieDetails(movieId, movieTitle);
}

movieData.displayTrendingMovies(trendingMoviesContainer, watchLater);

loadMoreBtn.addEventListener('click', () => {
    movieData.pages++;
    movieData.displayTrendingMovies(trendingMoviesContainer, watchLater);
});

randomMovieBtn.addEventListener('click', () => {
    movieData.showRandomTrendingMovie();
});

watchLaterBtn.addEventListener('click', () => {
    trendingMoviesContainer.style.display = 'none';
    loadMoreBtn.style.display = 'none';
    watchLaterContainer.style.display = 'block';
    backToTrendingBtn.style.display = 'inline-block';
    watchLater.displayList();
});

backToTrendingBtn.addEventListener('click', () => {
    trendingMoviesContainer.style.display = 'grid';
    loadMoreBtn.style.display = 'inline-block';
    watchLaterContainer.style.display = 'none';
    backToTrendingBtn.style.display = 'none';
});
