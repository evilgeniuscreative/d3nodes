// src/components/typeahead/Typeahead.jsx
import React from "react";
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Avatar,
  Popper,
  Paper,
  Box
} from "@mui/material";

export default function Typeahead({ value, options, loading, onChange, onSelect }) {
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
        onChange={(event, newValue) => onSelect(newValue)}
        inputValue={value?.login || ""}
        onInputChange={(event, newInputValue) => {
          if (event?.type !== "change") return;
          onChange(newInputValue);
        }}
        PopperComponent={(props) => (
          <Popper {...props} modifiers={[{ name: 'offset', options: { offset: [0, 20] } }]} />
        )}
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
            <Avatar src={option.avatar_url} sx={{ width: 24, height: 24, mr: 1 }} />
            {option.login}
          </Box>
        )}
      />
    </Paper>
  );
}
