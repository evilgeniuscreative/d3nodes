import React, { useContext } from "react";
import { GraphContext } from "../grapher/Grapher";
import {
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Typography,
} from "@mui/material";

function Details() {
  const { state } = useContext(GraphContext);
  const user = state.selectedUser;

  if (!user?.login) return null;

  return (
    <Card sx={{ mb: 2 }}>
      <CardHeader
        avatar={<Avatar src={user.avatarUrl} />}
        title={user.name || user.login}
        subheader={user.company || ""}
      />
      <CardContent>
        {user.bio && (
          <Typography variant="body2" paragraph>
            {user.bio}
          </Typography>
        )}
        <Typography variant="body2">
          GitHub: <a href={`https://github.com/${user.login}`} target="_blank" rel="noreferrer">{user.login}</a>
        </Typography>
      </CardContent>
    </Card>
  );
}

export default Details;
