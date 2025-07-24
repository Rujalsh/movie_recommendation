// Fixed App.jsx
import { useEffect, useState } from "react";
import Search from "./components/Search.jsx";
import Spinner from "./components/Spinner.jsx";
import MovieCard from "./components/MovieCard.jsx";
import { useDebounce } from "react-use";
import { getTrendingMovies, updateSearchCount } from "./appwrite.js";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

// Debug API key
console.log("API Key present:", !!API_KEY);
console.log("API Key length:", API_KEY?.length);

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const App = () => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [movieList, setMovieList] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize as empty array to prevent crashes
  const [trendingMovies, setTrendingMovies] = useState([]);

  // Debounce the search term to prevent making too many API requests
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  const fetchMovies = async (query = "") => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      console.log("Fetching from:", endpoint);

      const response = await fetch(endpoint, API_OPTIONS);

      console.log("Response status:", response.status);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Invalid API key. Please check your TMDB API key in .env file"
          );
        }
        throw new Error(`Failed to fetch movies: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      if (data.Response === "False") {
        setErrorMessage(data.Error || "Failed to fetch movies");
        setMovieList([]);
        return;
      }

      setMovieList(data.results || []);

      // Only update search count if we have a query and results
      if (query && data.results && data.results.length > 0) {
        try {
          await updateSearchCount(query, data.results[0]);
        } catch (appwriteError) {
          console.warn("Failed to update search count:", appwriteError);
          // Don't let Appwrite errors break the main functionality
        }
      }
    } catch (error) {
      console.error(`Error fetching movies:`, error);
      setErrorMessage(
        error.message || "Error fetching movies. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      // Ensure we always set an array, even if the call fails
      setTrendingMovies(movies || []);
    } catch (error) {
      console.error(`Error fetching trending movies:`, error);
      // Set empty array on error to prevent crashes
      setTrendingMovies([]);
    }
  };

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  // Show API key warning if missing
  if (!API_KEY) {
    return (
      <main>
        <div
          style={{
            padding: "20px",
            color: "red",
            backgroundColor: "#ffe6e6",
            margin: "20px",
            borderRadius: "8px",
            border: "1px solid red",
          }}
        >
          <h2>Configuration Error</h2>
          <p>TMDB API key is missing. Please:</p>
          <ol>
            <li>
              Create a <code>.env</code> file in your project root
            </li>
            <li>
              Add: <code>VITE_TMDB_API_KEY=your_api_key_here</code>
            </li>
            <li>Restart your development server</li>
          </ol>
        </div>
      </main>
    );
  }

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

        {/* Only show trending section if we have movies */}
        {Array.isArray(trendingMovies) && trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>

            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id || `trending-${index}`}>
                  <p>{index + 1}</p>
                  <img
                    src={movie.poster_url}
                    alt={movie.title || "Movie poster"}
                    onError={(e) => {
                      e.target.src = "/no-movie.png";
                    }}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <h2>All Movies</h2>

          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <div
              style={{
                padding: "20px",
                color: "red",
                backgroundColor: "#ffe6e6",
                margin: "20px",
                borderRadius: "8px",
                border: "1px solid red",
              }}
            >
              <p>{errorMessage}</p>
              {errorMessage.includes("Invalid API key") && (
                <div style={{ marginTop: "10px", fontSize: "14px" }}>
                  <p>To fix this:</p>
                  <ol>
                    <li>
                      Go to{" "}
                      <a
                        href="https://www.themoviedb.org/settings/api"
                        target="_blank"
                      >
                        TMDB API Settings
                      </a>
                    </li>
                    <li>Copy your API Read Access Token (v4 auth)</li>
                    <li>
                      Update your .env file:{" "}
                      <code>VITE_TMDB_API_KEY=your_token_here</code>
                    </li>
                    <li>Restart your dev server</li>
                  </ol>
                </div>
              )}
            </div>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};

export default App;
