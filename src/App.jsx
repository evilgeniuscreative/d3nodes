// src/App.jsx
import React, { useState, useEffect } from "react";
import { CssBaseline, Container } from "@mui/material";
import Typeahead from "./components/typeahead/Typeahead";
import Grapher from "./components/grapher/Grapher";
import UserProfile from "./components/userprofile/UserProfile";
import { searchUsers, fetchUserAndConnections } from "./api";
import { GitHubContext } from "./context/GitHubContext";

function App() {
  const [inputValue, setInputValue] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [gitHubData, setGitHubData] = useState(null);

  useEffect(() => {
    fetchUserAndConnections().then(setGitHubData).catch(console.error);
  }, []);

  useEffect(() => {
    if (!inputValue) {
      setOptions([]);
      return;
    }

    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const users = await searchUsers(inputValue);
        setOptions(users);
      } catch (err) {
        console.error("Error searching GitHub users:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [inputValue]);

  return (
    <GitHubContext.Provider value={gitHubData}>
      <CssBaseline />
      <Container sx={{ mt: selectedUser ? 1 : 4 }}>
        <Typeahead
          value={selectedUser}
          inputValue={inputValue}
          options={options}
          loading={isLoading}
          onChange={setInputValue}
          onSelect={setSelectedUser}
        />
        {selectedUser && <UserProfile user={selectedUser} />}
        <Grapher selectedUser={selectedUser} />
      </Container>
    </GitHubContext.Provider>
  );
}

export default App;
