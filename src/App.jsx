import { useState, useEffect } from "react";
import MovieCard from "./MovieCard";

const API_KEY = "881be056";
const API_URL = "http://www.omdbapi.com/";
const HISTORY_KEY = "movie_search_history";

function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");

  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  const addToHistory = (q) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setHistory((prev) => {
      const filtered = prev.filter((item) => item !== trimmed);
      return [trimmed, ...filtered].slice(0, 5);
    });
  };

  const fetchMovies = async (q, pageNum = 1) => {
    if (!q.trim()) return;
    setStatus("loading");
    setError(null);

    try {
      const url = `${API_URL}?s=${encodeURIComponent(q)}&page=${pageNum}&apikey=${API_KEY}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Ошибка сети");

      const data = await res.json();

      if (data.Error) {
        setMovies([]);
        setTotalResults(0);
        setStatus("error");
        setError("Ничего не найдено");
        return;
      }

      setMovies(data.Search || []);
      setTotalResults(Number(data.totalResults) || 0);
      setStatus("success");
      addToHistory(q);
    } catch (err) {
      setMovies([]);
      setTotalResults(0);
      setStatus("error");
      setError(err.message);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchMovies(query, 1);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  useEffect(() => {
    if (query.trim().length <= 2) {
      if (query.trim() === "") {
        setMovies([]);
        setStatus("idle");
        setError(null);
      }
      return;
    }

    const timer = setTimeout(() => {
      setPage(1);
      fetchMovies(query, 1);
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const totalPages = Math.ceil(totalResults / 10);

  const handlePrevPage = () => {
    if (page > 1) {
      const newPage = page - 1;
      setPage(newPage);
      fetchMovies(query, newPage);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      const newPage = page + 1;
      setPage(newPage);
      fetchMovies(query, newPage);
    }
  };

  const filteredMovies = movies.filter((m) => {
    const year = parseInt(m.Year, 10);
    if (isNaN(year)) return true;
    if (yearFrom && year < Number(yearFrom)) return false;
    if (yearTo && year > Number(yearTo)) return false;
    return true;
  });

  return (
    <div className="app">
      <h1>Поиск фильмов</h1>

      <div className="search-bar">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Введите название фильма..."
        />
        <button onClick={handleSearch} disabled={status === "loading"}>
          {status === "loading" ? "Поиск..." : "Найти"}
        </button>
      </div>

      <div className="year-filter">
        <label>
          Год от:
          <input
            type="number"
            value={yearFrom}
            onChange={(e) => setYearFrom(e.target.value)}
            placeholder="1900"
          />
        </label>
        <label>
          Год до:
          <input
            type="number"
            value={yearTo}
            onChange={(e) => setYearTo(e.target.value)}
            placeholder="2026"
          />
        </label>
      </div>

      {history.length > 0 && (
        <div className="history">
          <span className="history-label">История: </span>
          {history.map((q) => (
            <button
              key={q}
              className="history-item"
              onClick={() => {
                setQuery(q);
                setPage(1);
                fetchMovies(q, 1);
              }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {status === "idle" && (
        <p className="hint">Введите название фильма и нажмите «Найти».</p>
      )}
      {status === "loading" && <p className="hint">Загрузка...</p>}
      {status === "error" && (
        <div className="error">
          <p>Ошибка: {error}</p>
        </div>
      )}

      {status === "success" && filteredMovies.length === 0 && (
        <p className="hint">Ничего не найдено по вашему запросу.</p>
      )}
      {status === "success" && filteredMovies.length > 0 && (
        <>
          <div className="movie-list">
            {filteredMovies.map((movie) => (
              <MovieCard key={movie.imdbID} movie={movie} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button onClick={handlePrevPage} disabled={page === 1}>
                ← Предыдущая
              </button>
              <span>
                Страница {page} из {totalPages}
              </span>
              <button onClick={handleNextPage} disabled={page >= totalPages}>
                Следующая →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;