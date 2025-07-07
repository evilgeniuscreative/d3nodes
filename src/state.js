// Initial graph state including nodes and links
export const initialState = {
    nodes: [],
    links: [],
    selectedNode: null,
    expandedNodes: [],
};

// Reducer to manage updates to the graph state
export function graphReducer(state, action) {
    switch (action.type) {
        case 'SET_NEW_NODES':
            return {
                ...state,
                nodes: action.payload.nodes,
                links: action.payload.links,
            };

        case 'SELECT_NODE':
            return {
                ...state,
                selectedNode: action.payload,
            };

        case 'MARK_NODE_EXPANDED':
            return {
                ...state,
                expandedNodes: [...state.expandedNodes, action.payload],
            };

        default:
            return state;
    }
}
