import React, { useState } from "react";
import { TextField, Autocomplete, Box, Avatar, Typography } from "@mui/material";
import { searchUsers } from "../../api";

function Typeahead({ onUserSelect }) {
  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = async (event, value) => {
    setInputValue(value);
    if (value.length > 2) {
      try {
        const results = await searchUsers(value);
        setOptions(results);
      } catch (error) {
        console.error("Search failed", error);
      }
    }
  };

  const handleChange = (event, value) => {
    if (value) {
      onUserSelect(value);
    }
  };

  return (
    <Box width={400}>
      <Autocomplete
        options={options}
        getOptionLabel={(option) => option.name || option.login}
        onInputChange={handleInputChange}
        onChange={handleChange}
        inputValue={inputValue}
        renderOption={(props, option) => (
          <Box component="li" {...props} display="flex" alignItems="center" gap={1}>
            <Avatar src={option.avatarUrl || ""} sx={{ width: 24, height: 24 }} />
            <Typography>{option.name} [{option.login}]</Typography>
          </Box>
        )}
        renderInput={(params) => (
          <TextField {...params} label="Search GitHub Users" variant="outlined" fullWidth />
        )}
      />
    </Box>
  );
}

export default Typeahead;
