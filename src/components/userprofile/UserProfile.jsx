// src/components/UserProfile.jsx
import React from "react";
import { Avatar } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";

export function UserAvatar({ src, alt, size = 64 }) {
  return (
    <Avatar src={src} alt={alt} sx={{ width: size, height: size }}>
      {!src && <PersonIcon />}
    </Avatar>
  );
}

export default UserAvatar;
