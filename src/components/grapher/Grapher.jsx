import React, { createContext, useReducer, useRef, useEffect } from "react";
import * as d3 from "d3";
import { graphReducer, initialState } from "../../state";
import Details from "../details/Details";
import { fetchUserAndConnections } from "../../api";

export const GraphContext = createContext();

function GraphApp() {
  const [state, dispatch] = useReducer(graphReducer, initialState);
  const svgRef = useRef(null);

  async function fetchAndExpandUser(login) {
    const token = import.meta.env.VITE_GITHUB_TOKEN;

    try {
      const user = await fetchUserAndConnections(login, token);
      dispatch({ type: "SELECT_USER", payload: user });

      const connections = [...user.followers.nodes, ...user.following.nodes];
      const newNodes = connections.map((u) => ({
        id: u.login,
        avatar: u.avatarUrl,
      }));

      const combinedNodes = [
        { id: user.login, avatar: user.avatarUrl },
        ...state.nodes,
        ...newNodes.filter((n) => !state.nodes.find((o) => o.id === n.id)),
      ];

      const newLinks = connections.map((u) => ({
        source: user.login,
        target: u.login,
      }));

      dispatch({
        type: "SET_NEW_NODES",
        payload: {
          nodes: combinedNodes,
          links: [...state.links, ...newLinks],
        },
      });

      dispatch({ type: "MARK_NODE_EXPANDED", payload: user.login });
    } catch (err) {
      console.error("GraphQL error:", err);
    }
  }

  function handleNodeClick(d) {
    dispatch({ type: "SELECT_NODE", payload: d });
    if (!state.expandedNodes.includes(d.id)) {
      fetchAndExpandUser(d.id);
    }
  }

  function handleUserSelect(user) {
    const newNode = { id: user.login, avatar: user.avatarUrl };

    dispatch({ type: "SELECT_USER", payload: user });
    dispatch({ type: "SELECT_NODE", payload: newNode });

    const alreadyExists = state.nodes.find(n => n.id === user.login);
    if (!alreadyExists) {
      dispatch({
        type: "SET_NEW_NODES",
        payload: {
          nodes: [...state.nodes, newNode],
          links: [...state.links],
        },
      });
    }

    if (!state.expandedNodes.includes(user.login)) {
      fetchAndExpandUser(user.login);
    }
  }

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const bounds = svgRef.current.getBoundingClientRect();
    const width = bounds.width;
    const height = bounds.height;

    const defs = svg.append("defs");
    state.nodes.forEach((d) => {
      if (!d.avatar) return;
      defs.append("pattern")
        .attr("id", `avatar-${d.id}`)
        .attr("patternUnits", "objectBoundingBox")
        .attr("width", 1)
        .attr("height", 1)
        .append("image")
        .attr("href", d.avatar)
        .attr("width", 20)
        .attr("height", 20)
        .attr("x", 0)
        .attr("y", 0);
    });

    const simulation = d3
      .forceSimulation(state.nodes)
      .force(
        "link",
        d3.forceLink(state.links).id(d => d.id).distance(100)
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
        d.avatar ? `url(#avatar-${d.id})` :
        state.selectedNode?.id === d.id ? "lightblue" : "steelblue"
      )
      .call(drag(simulation))
      .on("click", (event, d) => handleNodeClick(d));

    node.append("title").text(d => d.id);

    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node.attr("cx", d => d.x).attr("cy", d => d.y);
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
          {state.selectedUser?.login && (
            <div style={{
              position: "absolute",
              top: 10,
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "#fff8b0",
              padding: "6px 12px",
              borderRadius: "4px",
              fontWeight: "bold"
            }}>
              {state.selectedUser.login}
            </div>
          )}
          {/* <AsyncExample onUserSelect={handleUserSelect} /> */}
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
