export async function fetchUserAndConnections(login, limit = 100) {
  const query = `
    query($login: String!, $limit: Int!) {
      user(login: $login) {
        login
        name
        avatarUrl
        email
        company
        bio
        twitterUsername
        url
        websiteUrl
        createdAt
        updatedAt
        followers(first: $limit) {
          nodes {
            login
            avatarUrl
            name
          }
        }
        following(first: $limit) {
          nodes {
            login
            avatarUrl
            name
          }
        }
        publicRepos: repositories(privacy: PUBLIC) {
          totalCount
        }
        privateRepos: repositories(privacy: PRIVATE) {
          totalCount
        }
        publicGists: gists(privacy: PUBLIC) {
          totalCount
        }
        totalPrivateRepos: repositories(privacy: PRIVATE, ownerAffiliations: [OWNER]) {
          totalCount
        }
      }
      rateLimit {
        limit
        remaining
        resetAt
      }
    }
  `;

  const res = await fetch("/api/github/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { login, limit } }),
  });

  const { data, errors } = await res.json();
  if (errors) throw new Error(errors.map((e) => e.message).join("; "));

  const normalize = (user) => ({
    id: user.login,
    login: user.login,
    name: user.name,
    avatarUrl: user.avatarUrl,
  });

  const userNode = normalize(data.user);
  const followerNodes = data.user.followers?.nodes?.map(normalize) || [];
  const followingNodes = data.user.following?.nodes?.map(normalize) || [];

  const seen = new Set();
  const nodes = [userNode, ...followerNodes, ...followingNodes].filter((u) => {
    if (seen.has(u.id)) return false;
    seen.add(u.id);
    return true;
  });

  const links = [
    ...followerNodes.map((f) => ({ source: f.id, target: userNode.id })),
    ...followingNodes.map((f) => ({ source: userNode.id, target: f.id })),
  ];

  return {
    nodes,
    links,
    rateLimit: data.rateLimit,
  };
}

export async function searchUsers(query) {
  const searchQuery = `
    query($query: String!) {
      search(query: $query, type: USER, first: 10) {
        nodes {
          ... on User {
            login
            name
            avatarUrl
          }
        }
      }
    }
  `;

  const res = await fetch("/api/github/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: searchQuery, variables: { query } }),
  });

  const { data, errors } = await res.json();
  if (errors) throw new Error(errors.map((e) => e.message).join("; "));

  return data.search.nodes;
}
