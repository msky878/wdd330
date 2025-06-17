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
                movieElement.classList.add('trending-card');

                movieElement.innerHTML = `
                    <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" class="trending-img" alt="${movie.title}">
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
            const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKeyTmdb}`);
            const movie = await response.json();

            const trailerId = await this.fetchYouTubeTrailer(movieTitle + " trailer");

            const platforms = await this.fetchStreamingAvailabilityFromWatchmode(movieTitle, movieId);

            let platformHTML = '<p class="platforms"><strong>Available On:</strong><br>';
            if (platforms) {
                for (const [name, available] of Object.entries(platforms)) {
                    platformHTML += `${available ? '✅' : '❌'} ${name}<br>`;
                }
            } else {
                platformHTML += 'Unknown ❓';
            }
            platformHTML += '</p>';

            let modal = document.getElementById('movieModal');
            let modalContent = document.getElementById('modalContent');

            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'movieModal';
                document.body.appendChild(modal);

                modalContent = document.createElement('div');
                modalContent.id = 'modalContent';
                modal.appendChild(modalContent);
            }

            const watchLaterList = JSON.parse(localStorage.getItem('watchLaterList')) || [];
            const isAlreadyInList = watchLaterList.some(item => item.id === movie.id);


            modalContent.innerHTML = `
    <span id="closeModal">&times;</span>
    
    <h2 style="font-size: 2rem; margin-bottom: 20px; text-align: center;">
        ${movie.title}
    </h2>
    
    <div style="display: flex; gap: 20px; align-items: flex-start; flex-wrap: wrap;">
        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" 
             alt="${movie.title}" 
             style="width: 250px; border-radius: 8px;" />
             
        <div style="flex: 1;">
            <p style="margin-top: 0;">${movie.overview}</p>
        </div>
    </div>

    ${trailerId ? `
        <div style="margin-top: 30px;">
            <iframe width="100%" height="315"
                src="https://www.youtube.com/embed/${trailerId}"
                frameborder="0"
                allowfullscreen>
            </iframe>
        </div>
    ` : '<p style="margin-top: 30px;"><b>No trailer found.</b></p>'}

    <div style="margin-top: 20px;">
        <p><strong>Release Date:</strong> ${movie.release_date}</p>
        <p><strong>Rating:</strong> ${movie.vote_average}</p>
        ${platformHTML}
    </div>

    <div class="button-group" style="margin-top: 20px;">
        <button id="addToWatchLaterBtn" ${isAlreadyInList ? 'disabled' : ''}>
            📺 ${isAlreadyInList ? 'Already in Watch Later' : 'Add to Watch Later'}
        </button>
    </div>
`;

            const addBtn = document.getElementById('addToWatchLaterBtn');
            if (addBtn && !isAlreadyInList) {
                addBtn.addEventListener('click', () => {
                    const updatedList = [...watchLaterList, {
                        id: movie.id,
                        title: movie.title,
                        poster_path: movie.poster_path
                    }];
                    localStorage.setItem('watchLaterList', JSON.stringify(updatedList));
                    this.showNotification(`${movie.title} added to your Watch Later list!`);

                    addBtn.textContent = '📺 Already in Watch Later';
                    addBtn.disabled = true;
                });
            }


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
            const searchUrl = `https://api.watchmode.com/v1/search/?apiKey=${apiKeyWatchmode}&search_field=tmdb_movie_id&search_value=${tmdbId}`;

            const searchResponse = await fetch(searchUrl);
            const searchData = await searchResponse.json();

            if (!searchData.title_results || searchData.title_results.length === 0) return null;

            const watchmodeId = searchData.title_results[0].id;

            const sourcesUrl = `https://api.watchmode.com/v1/title/${watchmodeId}/sources/?apiKey=${apiKeyWatchmode}`;
            const sourcesResponse = await fetch(sourcesUrl);
            const sources = await sourcesResponse.json();

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

    async showRandomTrendingMovie() {
        try {
            const response = await fetch(`https://api.themoviedb.org/3/trending/movie/day?api_key=${apiKeyTmdb}`);
            const data = await response.json();

            const movies = data.results;
            if (!movies || movies.length === 0) {
                console.warn("No movies found in trending list.");
                return;
            }

            const randomMovie = movies[Math.floor(Math.random() * movies.length)];

            this.showMovieDetails(randomMovie.id, randomMovie.title);

        } catch (error) {
            console.error("Error fetching trending movies for random selection:", error);
        }
    }

    showNotification(message, duration = 3000) {
        const existing = document.getElementById('custom-notification');
        if (existing) existing.remove();

        const notif = document.createElement('div');
        notif.id = 'custom-notification';
        notif.textContent = message;
        document.body.appendChild(notif);

        requestAnimationFrame(() => {
            notif.style.opacity = '1';
            notif.style.transform = 'translateY(0)';
        });

        setTimeout(() => {
            notif.style.opacity = '0';
            notif.style.transform = 'translateY(20px)';
            setTimeout(() => notif.remove(), 300);
        }, duration);
    }


}
