// context/GitHubContext.js
import { createContext, useContext } from "react";

export const GitHubContext = createContext(null);

export const useGitHub = () => useContext(GitHubContext);
