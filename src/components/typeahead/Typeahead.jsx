// src/components/typeahead/Typeahead.jsx
import React from "react";
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Avatar,
  Paper,
  Box
} from "@mui/material";

export default function Typeahead({
  value,
  inputValue,
  options,
  loading,
  onChange,
  onSelect
}) {
  return (
    <Paper
      sx={{
        maxWidth: 500,
        mx: "auto",
        mt: 2,
        borderRadius: 2,
        p: 1
      }}
    >
      <Autocomplete
        fullWidth
        options={options}
        loading={loading}
        getOptionLabel={(option) => option.login || ""}
        value={value}
        inputValue={inputValue}
        onChange={(event, newValue) => onSelect(newValue)}
        onInputChange={(event, newInputValue) => {
          if (event?.type !== "change") return;
          onChange(newInputValue);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Search GitHub user..."
            variant="outlined"
            size="medium"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              )
            }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
        )}
        renderOption={(props, option) => (
          <Box component="li" {...props}>
            <Avatar src={option.avatarUrl} sx={{ width: 24, height: 24, mr: 1 }} />
            {option.login}
          </Box>
        )}
      />
    </Paper>
  );
}
