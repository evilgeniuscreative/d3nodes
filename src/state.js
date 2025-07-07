export const initialState = {
  selectedUser: {},
  nodes: [],
  links: [],
  selectedNode: null,
  expandedNodes: [],
};

export function graphReducer(state, action) {
  switch (action.type) {
    case "SET_NEW_NODES":
      return {
        ...state,
        nodes: action.payload.nodes,
        links: action.payload.links,
      };

    case "SELECT_NODE":
      return {
        ...state,
        selectedNode: action.payload,
      };

    case "SELECT_USER":
      console.log("SELECT_USER", action.payload);
      return {
        ...state,
        selectedUser: action.payload,
      };

    case "MARK_NODE_EXPANDED":
      return {
        ...state,
        expandedNodes: [...state.expandedNodes, action.payload],
      };

    default:
      return state;
  }
}
