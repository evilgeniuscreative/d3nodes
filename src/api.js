// src/api.js

export async function fetchUserAndConnections(login) {
  const query = `
    query GetUserAndConnections($login: String!) {
      user(login: $login) {
        login
        name
        avatarUrl
        bio
        followers(first: 50) {
          nodes {
            login
            avatarUrl
          }
        }
        following(first: 50) {
          nodes {
            login
            avatarUrl
          }
        }
      }
    }
  `;

  const res = await fetch("/api/github/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables: { login } }),
  });

  const { data, errors } = await res.json();
  if (errors) throw new Error(errors.map(e => e.message).join("; "));
  return data.user;
}
