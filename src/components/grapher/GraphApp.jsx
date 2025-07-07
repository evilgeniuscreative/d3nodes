import React, { useReducer, useRef, useEffect } from "react";
import * as d3 from "d3";
import { graphReducer, initialState } from "../../state.js";
import Details from "../details/Details.jsx";
import AsyncExample from "../typeahead/Typeahead.jsx";
import RateLimitStatus from "../ratelimit/RateLimit.jsx";

function GraphApp() {
  // useReducer holds graph state: nodes, links, expanded flags, etc.
  const [state, dispatch] = useReducer(graphReducer, initialState);
  const svgRef = useRef(null); // ref to the <svg> container for D3

  /**
   * 🔄 Fetch GitHub connections (followers + following) for a node
   * Adds new nodes and links to the graph.
   */
  async function fetchConnections(node) {
    const headers = {
      Authorization: `token ${import.meta.env.VITE_GITHUB_TOKEN}`,
    };

    console.log("Fetching connections for:", node.id);
    console.log("Token:", import.meta.env.VITE_GITHUB_TOKEN);

    const cache = {};

    const getUsers = async (url) => {
      if (cache[url]) return cache[url];

      const res = await fetch(url, { headers });
      if (!res.ok) {
        const error = await res.json();
        console.error(`GitHub error: ${res.status}`, error.message);
        return [];
      }

      const data = await res.json(); // THIS was missing
      cache[url] = data;
      return data;
    };

    const [followers, following] = await Promise.all([
      getUsers(`https://api.github.com/users/${node.id}/followers?per_page=50`),
      getUsers(`https://api.github.com/users/${node.id}/following?per_page=50`),
    ]);

    const connections = [...followers, ...following];
    if (!connections.length) {
      console.warn("No connections found for", node.id);
      return;
    }

    const newNodes = connections.map((user) => ({ id: user.login }));
    const combinedNodes = [
      { id: node.id },
      ...state.nodes,
      ...newNodes.filter((n) => !state.nodes.find((o) => o.id === n.id)),
    ];

    const newLinks = connections.map((user) => ({
      source: node.id,
      target: user.login,
    }));

    dispatch({
      type: "SET_NEW_NODES",
      payload: {
        nodes: combinedNodes,
        links: [...state.links, ...newLinks],
      },
    });

    dispatch({ type: "MARK_NODE_EXPANDED", payload: node.id });
  }

  /**
   * 👈 Node click expands it if not already expanded.
   */
  function handleNodeClick(d) {
    dispatch({ type: "SELECT_NODE", payload: d });
    if (!state.expandedNodes.includes(d.id)) {
      fetchConnections(d);
    }
  }

  /**
   * 🔍 Typeahead user selection → insert user and expand.
   */
  function handleUserSelect(user) {
    const newNode = { id: user.login };
    console.log("Selected user:", user);
    dispatch({
      type: "SET_NEW_NODES",
      payload: {
        nodes: [newNode],
        links: [],
      },
    });

    dispatch({ type: "SELECT_NODE", payload: newNode });
    console.log("Fetching connections for:", newNode);
    fetchConnections(newNode);
  }

  /**
   * 🎯 D3 render/update logic — runs every time the graph state updates.
   */
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear old graph before re-render

    const bounds = svgRef.current.getBoundingClientRect();
    const width = bounds.width;
    const height = bounds.height;

    const simulation = d3
      .forceSimulation(state.nodes)
      .force(
        "link",
        d3
          .forceLink(state.links)
          .id((d) => d.id)
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // 🔗 Draw edges
    const link = svg
      .append("g")
      .attr("stroke", "#aaa")
      .selectAll("line")
      .data(state.links)
      .join("line");

    // 🔵 Draw nodes as circles
    const node = svg
      .append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(state.nodes)
      .join("circle")
      .attr("r", 10)
      .attr("fill", (d) =>
        state.selectedNode?.id === d.id ? "lightblue" : "steelblue"
      )
      .call(drag(simulation)) // 🖱️ Enable dragging
      .on("click", handleNodeClick);

    node.append("title").text((d) => d.id); // Tooltip

    // 🔁 Update positions on each simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
    });
  }, [state.nodes, state.links, state.selectedNode]);

  /**
   * 🛠️ D3 drag behavior
   */
  function drag(simulation) {
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return d3
      .drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  }

  // ✅ Layout with sidebar and graph area
  return (
    <div className="flex h-screen">
      <RateLimitStatus />
      {/* 🟦 Sidebar: search and node details */}
      <div className="w-1/3 p-4 overflow-y-auto border-r">
        <h1 className="text-xl font-bold mb-4">PeopleGraph</h1>
        <AsyncExample onUserSelect={handleUserSelect} />

        {state.selectedNode && <Details userId={state.selectedNode.id} />}
      </div>

      {/* 🟥 D3 graph canvas */}
      <div style={{ flexGrow: 1, height: "100vh" }}>
        <svg ref={svgRef} width="100%" height="100%"></svg>
      </div>
    </div>
  );
}

export default GraphApp;
