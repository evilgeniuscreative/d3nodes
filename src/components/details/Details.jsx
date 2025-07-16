import React, { useEffect, useState, useContext } from "react";
import { GraphContext } from "../grapher/Grapher";
import { fetchUserAndConnections } from "../../api";
import {
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";

function Details() {
  const { state } = useContext(GraphContext);
  const user = state.selectedUser;

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.login) return;

    setLoading(true);
    fetchUserAndConnections(user.login)
      .then(setDetails)
      .catch((err) => {
        console.error("Failed to fetch user details:", err);
        setDetails(null);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (!user?.login) return null;

  return (
    <Card sx={{ mb: 2 }}>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <CardHeader
            avatar={<Avatar src={details?.avatarUrl} />}
            title={details?.name || details?.login}
            subheader={details?.location || ""}
          />
          <CardContent>
            {details?.bio && (
              <Typography variant="body2" paragraph>
                {details.bio}
              </Typography>
            )}
            {details?.company && (
              <Typography variant="body2">
                Works at: {details.company}
              </Typography>
            )}
            <Typography variant="body2">
              Followers: {details?.followers?.nodes?.length || 0} &nbsp;|&nbsp;
              Following: {details?.following?.nodes?.length || 0}
            </Typography>
            {details?.url && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                <a href={details.url} target="_blank" rel="noreferrer">
                  View on GitHub
                </a>
              </Typography>
            )}
          </CardContent>
        </>
      )}
    </Card>
  );
}

export default Details;
