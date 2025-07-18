const initialState = {
  nodes: [],
  links: [],
  expandedNodes: [],
  selectedUser: null,
  rateLimit: {},
};

function graphReducer(state, action) {
  switch (action.type) {
    case "MERGE_NODES_AND_LINKS": {
      const { nodes: newNodes, links: newLinks, rateLimit } = action.payload;

      const existingIds = new Set(state.nodes.map((n) => n.id));
      const mergedNodes = [...state.nodes];

      newNodes.forEach((n) => {
        if (!existingIds.has(n.id)) {
          // Default to center if no coordinates
          mergedNodes.push({
            ...n,
            x: n.x ?? 500,
            y: n.y ?? 300,
          });
        }
      });

      const linkKey = ({ source, target }) =>
        (typeof source === "object" ? source.id : source) +
        "-" +
        (typeof target === "object" ? target.id : target);

      const existingLinks = new Set(state.links.map(linkKey));
      const mergedLinks = [...state.links];

      newLinks.forEach((l) => {
        const key = linkKey(l);
        if (!existingLinks.has(key)) mergedLinks.push(l);
      });

      return {
        ...state,
        nodes: mergedNodes,
        links: mergedLinks,
        rateLimit,
      };
    }

    case "MARK_NODE_EXPANDED": {
      const login = action.payload;
      if (state.expandedNodes.includes(login)) return state;
      return {
        ...state,
        expandedNodes: [...state.expandedNodes, login],
      };
    }

    case "SELECT_USER": {
      return {
        ...state,
        selectedUser: action.payload,
      };
    }

    default:
      return state;
  }
}
export { initialState, graphReducer };
