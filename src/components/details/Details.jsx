import React from "react";
import {
  Box,
  Typography,
  Avatar,
  Divider,
  Link as MuiLink,
} from "@mui/material";

function Details({ user }) {
  if (!user) return null;

  return (
    <Box>
      <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
        <Avatar src={user.avatarUrl} alt={user.login} sx={{ width: 80, height: 80 }} />
        <Typography variant="h6" mt={1}>
          {user.name || user.login}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          @{user.login}
        </Typography>
      </Box>

      <Divider />

      <Box mt={2}>
        {user.bio && (
          <>
            <Typography variant="subtitle2">Bio</Typography>
            <Typography variant="body2" mb={1}>{user.bio}</Typography>
          </>
        )}

        {user.company && (
          <>
            <Typography variant="subtitle2">Company</Typography>
            <Typography variant="body2" mb={1}>{user.company}</Typography>
          </>
        )}

        {user.email && (
          <>
            <Typography variant="subtitle2">Email</Typography>
            <Typography variant="body2" mb={1}>{user.email}</Typography>
          </>
        )}

        {user.websiteUrl && (
          <>
            <Typography variant="subtitle2">Website</Typography>
            <MuiLink href={user.websiteUrl} target="_blank" rel="noopener" variant="body2" mb={1}>
              {user.websiteUrl}
            </MuiLink>
          </>
        )}

        <Typography variant="subtitle2" mt={2}>GitHub Profile</Typography>
        <MuiLink href={user.url} target="_blank" rel="noopener" variant="body2">
          {user.url}
        </MuiLink>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2">Repositories</Typography>
        <Typography variant="body2">
          Public: {user.publicRepos?.totalCount ?? 0}<br />
          Private: {user.privateRepos?.totalCount ?? 0}<br />
          Owned Private: {user.totalPrivateRepos?.totalCount ?? 0}
        </Typography>

        <Typography variant="subtitle2" mt={2}>Gists</Typography>
        <Typography variant="body2">
          Public: {user.publicGists?.totalCount ?? 0}
        </Typography>

        {user.twitterUsername && (
          <>
            <Typography variant="subtitle2" mt={2}>Twitter</Typography>
            <MuiLink href={`https://twitter.com/${user.twitterUsername}`} target="_blank" rel="noopener">
              @{user.twitterUsername}
            </MuiLink>
          </>
        )}

        <Typography variant="caption" color="textSecondary" mt={3} display="block">
          Joined: {new Date(user.createdAt).toLocaleDateString()}
        </Typography>
      </Box>
    </Box>
  );
}

export default Details;
