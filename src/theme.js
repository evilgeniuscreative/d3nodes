import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#fbc02d",
    },
    background: {
      default: "#f4f6f8",
    },
  },
  typography: {
    fontFamily: "Roboto, Helvetica, Arial, sans-serif",
  },
});

export default theme;
