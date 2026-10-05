import { useState, useEffect } from "react";

const API_KEY = "881be056";
const API_URL = "http://www.omdbapi.com/";

function MovieCard({ movie }) {
  const [plot, setPlot] = useState(null);
  const [plotLoading, setPlotLoading] = useState(true);

  const posterUrl =
    movie.Poster && movie.Poster !== "N/A"
      ? movie.Poster
      : "https://via.placeholder.com/300x450?text=No+Poster";

  useEffect(() => {
    let cancelled = false;

    const fetchPlot = async () => {
      try {
        setPlotLoading(true);
        const res = await fetch(
          `${API_URL}?i=${movie.imdbID}&apikey=${API_KEY}`
        );
        if (!res.ok) throw new Error("Ошибка");
        const data = await res.json();
        if (!cancelled) {
          setPlot(
            data.Plot && data.Plot !== "N/A"
              ? data.Plot
              : "Описание недоступно"
          );
        }
      } catch {
        if (!cancelled) setPlot("Описание недоступно");
      } finally {
        if (!cancelled) setPlotLoading(false);
      }
    };

    fetchPlot();

    return () => {
      cancelled = true;
    };
  }, [movie.imdbID]);

  return (
    <article className="movie-card">
      <img src={posterUrl} alt={movie.Title} />
      <h3>{movie.Title}</h3>
      <p>
        <strong>Год:</strong> {movie.Year}
      </p>
      {plotLoading ? (
        <div className="plot-spinner">Загрузка описания...</div>
      ) : (
        <p className="plot">{plot}</p>
      )}
    </article>
  );
}

export default MovieCard;