import React, { useReducer } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import { GitHubContext } from "./context/GitHubContext";
import { initialState, graphReducer } from "./state";

function Main() {
  const [state, dispatch] = useReducer(graphReducer, initialState);

  return (
    <GitHubContext.Provider value={{ state, dispatch }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </GitHubContext.Provider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);
