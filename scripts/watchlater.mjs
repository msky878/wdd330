
export default class WatchLater {
    constructor(container, showDetailsCallback) {
        this.container = container;
        this.showDetails = showDetailsCallback;
        this.watchLaterKey = 'watchLaterList';
        this.seenKey = 'watchLaterSeen';
    }

    getList(key) {
        return JSON.parse(localStorage.getItem(key)) || [];
    }

    saveList(key, list) {
        localStorage.setItem(key, JSON.stringify(list));
    }

    addMovie(movie) {
        const list = this.getList(this.watchLaterKey);
        if (!list.find(m => m.id === movie.id)) {
            list.push(movie);
            this.saveList(this.watchLaterKey, list);
        }
    }

    markAsSeen(movieId) {
        let unseen = this.getList(this.watchLaterKey);
        let seen = this.getList(this.seenKey);

        const movie = unseen.find(m => m.id === movieId);
        if (movie) {
            unseen = unseen.filter(m => m.id !== movieId);
            seen.push(movie);
            this.saveList(this.watchLaterKey, unseen);
            this.saveList(this.seenKey, seen);
        }
    }

    removeMovie(movieId, fromSeen = false) {
        const key = fromSeen ? this.seenKey : this.watchLaterKey;
        const list = this.getList(key).filter(m => m.id !== movieId);
        this.saveList(key, list);
    }

    displayList() {
        this.container.innerHTML = '<h2>Watch Later</h2>';

        const unseen = this.getList(this.watchLaterKey);
        const seen = this.getList(this.seenKey);

        const createSection = (title, movies, seenSection) => {
            const section = document.createElement('div');
            section.innerHTML = `<h3>${title}</h3>`;
            const grid = document.createElement('div');
            grid.className = 'movie-grid';

            movies.forEach(movie => {
                const movieEl = document.createElement('div');
                movieEl.innerHTML = `
                    <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" class="trending-img" alt="${movie.title}">
                    <div class="button-group">
                        <button class="remove">❌</button>
                        ${!seenSection ? '<button class="seen seen-btn">✅</button>' : ''}
                    </div>
                `;

                movieEl.querySelector('img').addEventListener('click', () => {
                    this.showDetails(movie.id, movie.title);
                });

                movieEl.querySelector('.remove').addEventListener('click', () => {
                    this.removeMovie(movie.id, seenSection);
                    this.displayList();
                });

                if (!seenSection) {
                    movieEl.querySelector('.seen').addEventListener('click', () => {
                        this.markAsSeen(movie.id);
                        this.displayList();
                    });
                }

                grid.appendChild(movieEl);
            });

            section.appendChild(grid);
            this.container.appendChild(section);
        };

        createSection('To Watch', unseen, false);
        createSection('Watched', seen, true);
    }
}