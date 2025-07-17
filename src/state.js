export const initialState = {
  selectedUser: {},
  nodes: [],
  links: [],
  selectedNode: null,
  expandedNodes: [],
  rateLimit: null,
};

export function graphReducer(state, action) {
  switch (action.type) {
    case "SET_NEW_NODES":
      return {
        ...state,
        nodes: action.payload.nodes,
        links: action.payload.links,
        rateLimit: action.payload.rateLimit || state.rateLimit
      };

    case "SELECT_NODE":
      return { ...state, selectedNode: action.payload };

    case "SELECT_USER":
      return { ...state, selectedUser: action.payload };

    case "MARK_NODE_EXPANDED":
      return {
        ...state,
        expandedNodes: [...state.expandedNodes, action.payload],
      };

    default:
      return state;
  }
}
