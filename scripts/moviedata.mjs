const apiKeyTmdb = 'bada3363919bda6dfbcf4b8a460e9229';
const apiKeyYouTube = 'AIzaSyBU5-P3iyWcMgaOL2CmJRFLwQxgnJNuPeQ';
const apiKeyWatchmode = 'oFGKctNKMv3lTtHABxqBQIFTup8ugi9waFj8PWLN';

export default class MovieData {
    constructor() {
        this.pages = 1;
    }

    async displayTrendingMovies(moviesContainer) {
        try {
            const response = await fetch(`https://api.themoviedb.org/3/trending/movie/day?api_key=${apiKeyTmdb}&page=${this.pages}`);
            const data = await response.json();
            const movies = data.results.slice(0, 20);

            movies.forEach(movie => {
                const movieElement = document.createElement('div');
                movieElement.classList.add('movie');

                movieElement.innerHTML = `
                    <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
                `;

                movieElement.querySelector('img').addEventListener('click', () => {
                    this.showMovieDetails(movie.id, movie.title);
                });

                moviesContainer.appendChild(movieElement);
            });

        } catch (error) {
            console.error('Error fetching data:', error);
            moviesContainer.innerHTML = '<p>Failed to load movies :(</p>';
        }
    }

    async showMovieDetails(movieId, movieTitle) {
        console.log('Movie ID:', movieId);

        try {
            // Fetch movie details from TMDb
            const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKeyTmdb}`);
            const movie = await response.json();

            // Fetch trailer
            const trailerId = await this.fetchYouTubeTrailer(movieTitle + " trailer");

            // Fetch streaming availability using Watchmode
            const platforms = await this.fetchStreamingAvailabilityFromWatchmode(movieTitle, movieId);

            // Build streaming availability HTML
            let platformHTML = '<p><strong>Available On:</strong><br>';
            if (platforms) {
                for (const [name, available] of Object.entries(platforms)) {
                    platformHTML += `${available ? '✅' : '❌'} ${name}<br>`;
                }
            } else {
                platformHTML += 'Unknown ❓';
            }
            platformHTML += '</p>';

            // Build modal
            let modal = document.getElementById('movieModal');
            let modalContent = document.getElementById('modalContent');

            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'movieModal';
                modal.classList.add('modal');
                modal.style.cssText = `
                position: fixed;
                top: 0; left: 0;
                width: 100%; height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 999;
            `;
                document.body.appendChild(modal);

                modalContent = document.createElement('div');
                modalContent.id = 'modalContent';
                modalContent.style.cssText = `
                background: #fff;
                padding: 20px;
                width: 90%;
                max-width: 600px;
                border-radius: 10px;
                position: relative;
                overflow-y: auto;
                max-height: 90%;
            `;
                modal.appendChild(modalContent);
            }

            // Fill modal content
            modalContent.innerHTML = `
            <span id="closeModal" style="position: absolute; top: 10px; right: 15px; font-size: 24px; cursor: pointer;">&times;</span>
            <h2>${movie.title}</h2>
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" style="width: 100%; border-radius: 8px;" />
            <p><strong>Release Date:</strong> ${movie.release_date}</p>
            <p><strong>Rating:</strong> ${movie.vote_average}</p>
            <p>${movie.overview}</p>
            ${trailerId ? `
                <div style="margin-top: 20px">
                    <iframe width="100%" height="315"
                        src="https://www.youtube.com/embed/${trailerId}"
                        frameborder="0"
                        allowfullscreen>
                    </iframe>
                </div>
            ` : '<p><em>No trailer found.</em></p>'}
            ${platformHTML}
        `;

            // Modal close behavior
            document.getElementById('closeModal').onclick = () => {
                modal.style.display = 'none';
            };
            modal.onclick = (e) => {
                if (e.target === modal) modal.style.display = 'none';
            };

            modal.style.display = 'flex';

        } catch (err) {
            console.error('Failed to load movie details:', err);
        }
    }


    async fetchYouTubeTrailer(query) {
        const encodedQuery = encodeURIComponent(query);
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${encodedQuery}&key=${apiKeyYouTube}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.items && data.items.length > 0) {
                return data.items[0].id.videoId;
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error fetching trailer:', error);
            return null;
        }
    }

    async fetchStreamingAvailabilityFromWatchmode(movieTitle, tmdbId) {
        try {
            // Step 1: Get Watchmode ID from TMDb ID
            const searchUrl = `https://api.watchmode.com/v1/search/?apiKey=${apiKeyWatchmode}&search_field=tmdb_movie_id&search_value=${tmdbId}`;

            const searchResponse = await fetch(searchUrl);
            const searchData = await searchResponse.json();

            console.log('Search results from Watchmode:', searchData);

            if (!searchData.title_results || searchData.title_results.length === 0) return null;

            const watchmodeId = searchData.title_results[0].id;

            // Step 2: Get sources
            const sourcesUrl = `https://api.watchmode.com/v1/title/${watchmodeId}/sources/?apiKey=${apiKeyWatchmode}`;
            const sourcesResponse = await fetch(sourcesUrl);
            const sources = await sourcesResponse.json();

            console.log('Sources from Watchmode:', sources);


            const services = {
                'Netflix': false,
                'Disney+': false,
                'Prime Video': false,
                'Apple TV+': false,
            };

            sources.forEach(src => {
                const name = src.name.toLowerCase();
                if (name.includes('netflix')) services['Netflix'] = true;
                if (name.includes('disney')) services['Disney+'] = true;
                if (name.includes('prime') || name.includes('amazon')) services['Prime Video'] = true;
                if (name.includes('apple')) services['Apple TV+'] = true;
            });

            return services;

        } catch (error) {
            console.error('Watchmode error:', error);
            return null;
        }
    }
}
