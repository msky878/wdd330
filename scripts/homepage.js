import MovieData from './moviedata.mjs';

const movieData = new MovieData();

const trendingMoviesContainer = document.getElementById('trending-movies');

movieData.displayTrendingMovies(trendingMoviesContainer);

document.getElementById('load-more-btn').addEventListener('click', () => {
    movieData.pages++;
    movieData.displayTrendingMovies(trendingMoviesContainer);
});