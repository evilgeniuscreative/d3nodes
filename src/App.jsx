import React, { useState } from "react";
import Grapher from "./components/grapher/Grapher";
import Typeahead from "./components/typeahead/Typeahead";
import {
  Box,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";

function App() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [connectionLimit, setConnectionLimit] = useState(100);

  const maxConnections =
    (selectedUser?.followers?.totalCount || 0) +
    (selectedUser?.following?.totalCount || 0);
  const defaultMax = Math.max(100, maxConnections);
  const step = Math.ceil(defaultMax / 10);
  const dropdownOptions = Array.from({ length: 10 }, (_, i) =>
    Math.min(defaultMax, Math.round(((i + 1) * step) / 10) * 10)
  ).filter((v, i, a) => a.indexOf(v) === i);

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Box display="flex" flexDirection="column" gap={2}>
        <Box
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          alignItems="center"
          gap={2}
        >
          <Box width="400px">
            <Typeahead onUserSelect={setSelectedUser} />
          </Box>

          <FormControl size="small" sx={{ minWidth: 250 }}>
            <InputLabel>Selected User Connections to Show</InputLabel>
            <Select
              value={connectionLimit}
              label="Selected User Connections to Show"
              onChange={(e) => setConnectionLimit(parseInt(e.target.value))}
              sx={{ textAlign: "center", py: 1, px: 2 }}
            >
              {(() => {
                const maxConnections =
                  (selectedUser?.followers?.totalCount || 0) +
                  (selectedUser?.following?.totalCount || 0);
                const defaultMax = Math.max(100, maxConnections);
                const step = Math.ceil(defaultMax / 10);

                const options = Array.from({ length: 10 }, (_, i) => {
                  const val = Math.round(((i + 1) * step) / 10) * 10;
                  return val > maxConnections ? maxConnections : val;
                });

                const uniqueSorted = [...new Set(options)].sort(
                  (a, b) => a - b
                );

                return uniqueSorted.map((value) => (
                  <MenuItem
                    key={value}
                    value={value}
                    sx={{ textAlign: "center", py: 1, px: 2 }}
                  >
                    {value}
                  </MenuItem>
                ));
              })()}
            </Select>
          </FormControl>
        </Box>

        <Grapher
          selectedUser={selectedUser}
          connectionLimit={connectionLimit}
        />
      </Box>
    </Container>
  );
}

export default App;
