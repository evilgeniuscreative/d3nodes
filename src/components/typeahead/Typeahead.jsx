import React, { useState, useEffect, useCallback, createContext } from "react";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import debounce from "lodash.debounce";
import "react-bootstrap-typeahead/css/Typeahead.css";
import "./typeahead.css";

// Simple in-memory cache
const searchCache = {};

function AsyncExample({ onUserSelect }) {
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Core GitHub user search
  const fetchUsers = async (query) => {
    const token = import.meta.env.VITE_GITHUB_TOKEN;

    // Return from cache if possible
    if (searchCache[query]) {
      setOptions(searchCache[query]);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(
        `https://api.github.com/search/users?q=${query}`,
        {
          headers: {
            Authorization: `token ${token}`,
          },
        }
      );

      const json = await res.json();

      if (res.status === 403) {
        console.warn("Rate limited or bad token:", json.message);
        setOptions([]);
        setIsLoading(false);
        return;
      }

      const users = json.items || [];
      searchCache[query] = users;
      setOptions(users);
    } catch (e) {
      console.error("Fetch failed:", e);
      setOptions([]);
    }

    setIsLoading(false);
  };

  // Debounce network calls
  const debouncedFetch = useCallback(debounce(fetchUsers, 400), []);

  return (
    <AsyncTypeahead
      id="github-user-search"
      isLoading={isLoading}
      labelKey="login"
      onSearch={(query) => {
        if (query.length > 3) debouncedFetch(query);
      }}
      options={options}
      placeholder="Search GitHub users..."
      onChange={(selected) => {
        if (selected.length > 0) {
          onUserSelect(selected[0]);
        }
      }}
      minLength={3}
      renderMenuItemChildren={(option) => (
        <>
          <img
            alt={option.login}
            src={option.avatar_url}
            style={{
              height: "24px",
              marginRight: "10px",
              width: "24px",
            }}
          />
          <span>{option.login}</span>
        </>
      )}
    />
  );
}



export default AsyncExample;
