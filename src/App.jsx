import React, { useState, useEffect } from "react";
import { CssBaseline, Container, Typography } from "@mui/material";
import Grapher from "./components/grapher/Grapher";
import Typeahead from "./components/typeahead/Typeahead";
import { searchUsers } from "./api";

function App() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    searchUsers(query)
      .then(setSearchResults)
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <>
      <CssBaseline />
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom>
          GitHub Network Grapher
        </Typography>
        <Typeahead
          options={searchResults}
          loading={loading}
          inputValue={query}
          onChange={setQuery}
          value={selectedUser}
          onSelect={setSelectedUser}
        />
        <Grapher selectedUser={selectedUser} />
      </Container>
    </>
  );
}

export default App;
