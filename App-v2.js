import { useEffect, useState } from "react";
import StarRating from "./src/starRating";

// const tempMovieData = [
//   {
//     imdbID: "tt1375666",
//     Title: "Inception",
//     Year: "2010",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
//   },
//   {
//     imdbID: "tt0133093",
//     Title: "The Matrix",
//     Year: "1999",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
//   },
//   {
//     imdbID: "tt6751668",
//     Title: "Parasite",
//     Year: "2019",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
//   },
// ];

// const tempWatchedData = [
//   {
//     imdbID: "tt1375666",
//     Title: "Inception",
//     Year: "2010",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
//     runtime: 148,
//     imdbRating: 8.8,
//     userRating: 10,
//   },
//   {
//     imdbID: "tt0088763",
//     Title: "Back to the Future",
//     Year: "1985",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
//     runtime: 116,
//     imdbRating: 8.5,
//     userRating: 9,
//   },
// ];

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const key = "91899472";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [loader, setLoader] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  // useEffect(function () {
  //   fetch(`http://www.omdbapi.com/?apikey=${key}&s=ben`)
  //     .then((data) => data.json())
  //     .then((d) => setMovies(d.Search));
  // }, []);
  // console.log(watched);

  useEffect(
    function () {
      const controller = new AbortController();

      async function movieList() {
        try {
          setError("");
          setLoader(true);
          const movieFetch = await fetch(
            `http://www.omdbapi.com/?apikey=${key}&s=${query}`,
            { signal: controller.signal }
          );
          if (!movieFetch.ok) {
            throw new Error("Error on loading");
          }
          const json = await movieFetch.json();
          if (json.Response === "False") throw new Error("Movie not found");

          setMovies(json.Search);
          // console.log(json.Search);
          setError("");
        } catch (err) {
          if (!err.name !== "AbortError") {
            setError(err.message);
          }
        } finally {
          setLoader(false);
        }
      }
      if (!query.length) {
        setMovies([]);
        setError("Search something great to watch!");
        return;
      }
      handleCloseDetail();
      movieList();

      return function () {
        controller.abort();
      };
    },
    [query]
  );
  function handleSelectId(id) {
    setSelectedId((selectedId) => (selectedId === id ? null : id));
  }
  function handleCloseDetail() {
    setSelectedId(null);
  }

  function addSetWatched(mov) {
    setWatched((w) => [...w, mov]);
  }

  function handleDeleteWatched(id) {
    setWatched((w) => w.filter((m) => m.imdbID !== id));
  }
  return (
    <>
      <Nav movies={movies}>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <Numresults movies={movies} />
      </Nav>
      <Main>
        <Box>
          {loader && <Loader />}
          {!loader && !error && (
            <MovieList onSelectId={handleSelectId} movies={movies} />
          )}
          {error && <ErrorShow message={error} />}
          {/* {loader ? <Loader /> : <MovieList movies={movies} />} */}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              details={selectedId}
              onCloseDetail={handleCloseDetail}
              onSetWatched={addSetWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchMoviesList
                watched={watched}
                handleDeleteWatched={handleDeleteWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Loader() {
  return <p className="loader">Loading..</p>;
}
function ErrorShow({ message }) {
  return <p className="error">{message}</p>;
}

function Nav({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}
function Numresults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function MovieDetails({ details, onCloseDetail, onSetWatched, watched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");

  const thisRating = watched.find((m) => m.imdbID === details)?.userRating;
  const isWatched = watched.map((movie) => movie.imdbID).includes(details);

  // console.log(isWatched + "true");
  // console.log(isWatched);

  const {
    imdbID,
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;
  // console.log(movie);

  function handleAdd() {
    const addMovie = {
      imdbID,
      title,
      year,
      poster,
      runtime: Number(runtime.split(" ").at(0)),
      released,
      imdbRating: Number(imdbRating),
      userRating,
    };
    onSetWatched(addMovie);
    onCloseDetail();
  }

  // useEffect(
  //   function () {
  //     function callback(e) {
  //       if (e.code === "Escape") {
  //         onCloseDetail();
  //         console.log("hello I am ");
  //       }
  //     }
  //     document.addEventListener("keydown", callback);

  //     return function () {
  //       document.removeEventListener("keydown", callback);
  //     };
  //   },
  //   [onCloseDetail]
  // );

  useEffect(
    function () {
      async function movieDetails() {
        setIsLoading(true);
        const movieFetch = await fetch(
          `http://www.omdbapi.com/?apikey=${key}&i=${details}`
        );
        const data = await movieFetch.json();
        setMovie(data);
        setIsLoading(false);
      }
      movieDetails();
      // onCloseDetail();
    },
    [details]
  );

  useEffect(
    function () {
      document.title = `Movie | ${title ? title : "..."}`;
      return function () {
        document.title = "Pop Corn";
      };
    },
    [title]
  );

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseDetail}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${movie} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>{imdbRating} IMDb rating</p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    size={25}
                    maxRating={10}
                    setOutRating={(e) => setUserRating(e)}
                  />

                  {userRating > 0 && (
                    <button onClick={handleAdd} className="btn-add">
                      + Add Movie list
                    </button>
                  )}
                </>
              ) : (
                <p>You have already rated this movie Rating:- {thisRating}</p>
              )}
            </div>

            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>

      {isOpen && children}
    </div>
  );
}

function MovieList({ movies, onSelectId }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectId={onSelectId} />
      ))}
    </ul>
  );
}

function Movie({ movie, onSelectId }) {
  return (
    <li onClick={() => onSelectId(movie.imdbID)} key={movie.imdbID}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

// function Watchedlist() {
//   const [isOpen2, setIsOpen2] = useState(true);

//   return (
//     <div className="box">
//       <button
//         className="btn-toggle"
//         onClick={() => setIsOpen2((open) => !open)}
//       >
//         {isOpen2 ? "–" : "+"}
//       </button>
//       {isOpen2 && (

//       )}
//     </div>
//   );
// }

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchMoviesList({ watched, handleDeleteWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          handleDeleteWatched={handleDeleteWatched}
          movie={movie}
          key={movie.imdbID}
        />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, handleDeleteWatched }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime}</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => handleDeleteWatched(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}
