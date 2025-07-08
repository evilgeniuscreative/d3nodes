import React, { createContext, useReducer, useRef, useEffect } from "react";
import * as d3 from "d3";
import { graphReducer, initialState } from "../../state";
import Details from "../details/Details";
import AsyncExample from "../typeahead/Typeahead";
export const GraphContext = createContext();

function GraphApp() {
  const [state, dispatch] = useReducer(graphReducer, initialState);
  const svgRef = useRef(null);

  async function fetchUserDetails(userId) {
    const headers = {
      Authorization: `token ${import.meta.env.VITE_GITHUB_TOKEN}`,
    };

    try {
      const res = await fetch(`https://api.github.com/users/${userId}`, {
        headers,
      });
      if (!res.ok)
        throw new Error(`Failed to fetch user details for ${userId}`);
      const user = await res.json();
      dispatch({ type: "SELECT_USER", payload: user });
    } catch (err) {
      console.error("Error fetching user details:", err);
    }
  }

  async function fetchConnections(node) {
    const headers = {
      Authorization: `token ${import.meta.env.VITE_GITHUB_TOKEN}`,
    };

    const cache = {};

    const getUsers = async (url) => {
      if (cache[url]) return cache[url];

      const res = await fetch(url, { headers });
      if (!res.ok) {
        const error = await res.json();
        console.error(`GitHub error: ${res.status}`, error.message);
        return [];
      }

      const data = await res.json();
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

  //TODO: This seems to be the key, but I can't get the right data in
  function handleNodeClick(d) {
    dispatch({ type: "SELECT_NODE", payload: d });
    if (!state.expandedNodes.includes(d.id)) {
      console.log("fetching connections for", d);
      fetchConnections(d);
    }
    fetchUserDetails(d.id);
  }

  function handleUserSelect(user) {
    const newNode = { id: user.login };

    dispatch({
      type: "SELECT_USER",
      payload: user,
    });

    dispatch({
      type: "SET_NEW_NODES",
      payload: {
        nodes: [newNode],
        links: [],
      },
    });

    dispatch({ type: "SELECT_NODE", payload: newNode });

    fetchConnections(newNode);
  }

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

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

    const link = svg
      .append("g")
      .attr("stroke", "#aaa")
      .selectAll("line")
      .data(state.links)
      .join("line");

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
      .call(drag(simulation))
      .on("click", (event, d) => handleNodeClick(d));

    node.append("title").text((d) => d.id);

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
    });
  }, [state.nodes, state.links, state.selectedNode]);

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

  return (
    <GraphContext.Provider value={{ state, dispatch }}>
      <div className="">
        <div className="">
          <h1 className="">Git Connections Graph</h1>
          <AsyncExample onUserSelect={handleUserSelect} />
          {state.selectedNode && <Details />}
        </div>

        <div style={{ flexGrow: 1, height: "100vh" }}>
          <svg ref={svgRef} width="100%" height="100%"></svg>
        </div>
      </div>
    </GraphContext.Provider>
  );
}

export default GraphApp;
