import { useEffect, useState } from "react";

export function useMovies(query) {
  const [movies, setMovies] = useState([]);
  const [loader, setLoader] = useState(false);
  const [error, setError] = useState("");

  const key = "91899472";

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
      // handleCloseDetail();
      movieList();

      return function () {
        controller.abort();
      };
    },
    [query]
  );

  return { movies, loader, error };
}
