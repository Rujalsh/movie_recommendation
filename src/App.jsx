import React, { useEffect, useState } from "react";
import Search from "./components/Search";
import Spinner from "./components/spinner";
import MovieCard from "./components/MovieCard";

// OMDb API - Working API key
const API_KEY = "d1e38681"; // Your working API key
const API_BASE_URL = "https://www.omdbapi.com/";

const App = () => {
  const [searchTerm, setSearchTerm] = useState("avengers"); // default search
  const [movieList, setMovieList] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchMovies = async (query) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      let endpoint;

      if (query && query.trim()) {
        // Search for specific movies
        endpoint = `${API_BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(
          query
        )}&type=movie`;
      } else {
        // Default search for popular movies
        endpoint = `${API_BASE_URL}?apikey=${API_KEY}&s=marvel&type=movie`;
      }

      console.log("🔍 Fetching from:", endpoint);

      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("📦 API Response:", data);

      if (data.Response === "False") {
        setErrorMessage(data.Error || "No movies found.");
        setMovieList([]);
        return;
      }

      if (!data.Search || data.Search.length === 0) {
        setErrorMessage("No movies found.");
        setMovieList([]);
        return;
      }

      // Transform OMDb data to match your MovieCard component
      const movies = data.Search.map((movie) => ({
        id: movie.imdbID,
        title: movie.Title,
        poster_path: movie.Poster !== "N/A" ? movie.Poster : null,
        release_date: movie.Year,
        overview: `${movie.Type} from ${movie.Year}`, // OMDb doesn't provide overview in search
      }));

      setMovieList(movies);
    } catch (error) {
      console.error("💥 Error fetching movies:", error);
      setErrorMessage("Failed to fetch movies. Please try again later.");
      setMovieList([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search when searchTerm changes
  useEffect(() => {
    fetchMovies(searchTerm);
  }, [searchTerm]);

  // Initial load
  useEffect(() => {
    fetchMovies("avengers"); // Load default movies
  }, []);

  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="Hero Banner" />
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Enjoy
            Without the Hassle
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        <section className="all-movies">
          <h2 className="mt-[40px]">
            {searchTerm
              ? `Search Results for "${searchTerm}"`
              : "Popular Movies"}
          </h2>

          {/* API key is ready to use */}
          {/* <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <strong>✅ API Ready!</strong> Using your OMDb API key. Try
            searching for movies!
          </div> */}

          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                // <MovieCard key={movie.id} movie={movie} />
                <p className="text-white">{movie.title} </p>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};

export default App;
