import React, { useEffect, useRef, useContext, useState } from "react";
import * as d3 from "d3";
import { GitHubContext } from "../../context/GitHubContext";
import { fetchUserAndConnections } from "../../api";

function Grapher({ selectedUser, connectionLimit }) {
  const { state, dispatch } = useContext(GitHubContext);
  const svgRef = useRef();
  const gRef = useRef();
  const simulationRef = useRef();
  const [detailsVisible, setDetailsVisible] = useState(false);

  const fetchAndExpandUser = async (login, sourceNode = null) => {
    try {
      const { nodes, links, rateLimit } = await fetchUserAndConnections(
        login,
        connectionLimit
      );

      dispatch({
        type: "MERGE_NODES_AND_LINKS",
        payload: { nodes, links, rateLimit },
      });
      dispatch({ type: "MARK_NODE_EXPANDED", payload: login });
      dispatch({
        type: "SELECT_USER",
        payload: nodes.find((n) => n.login === login),
      });

      setDetailsVisible(true);
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };

  useEffect(() => {
    if (!selectedUser) return;
    if (state.expandedNodes.includes(selectedUser.login)) {
      dispatch({ type: "SELECT_USER", payload: selectedUser });
      return;
    }

    fetchAndExpandUser(selectedUser.login);
  }, [selectedUser, connectionLimit]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);

    svg.call(
      d3.zoom().on("zoom", (event) => {
        g.attr("transform", event.transform);
      })
    );
  }, []);

  useEffect(() => {
    if (!state.nodes.length) return;

    const g = d3.select(gRef.current);
    g.selectAll("*").remove();

    const linkGroup = g.append("g").attr("class", "links");
    const nodeGroup = g.append("g").attr("class", "nodes");
    const labelGroup = g.append("g").attr("class", "labels");

    const link = linkGroup
      .selectAll("line")
      .data(state.links)
      .join("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6);

    const node = nodeGroup
      .selectAll("image")
      .data(state.nodes, (d) => d.id)
      .join("image")
      .attr("xlink:href", (d) => d.avatarUrl)
      .attr("x", (d) => d.x - 16)
      .attr("y", (d) => d.y - 16)
      .attr("width", 32)
      .attr("height", 32)
      .attr("clip-path", "circle(16px at center)")
      .attr("stroke", (d) => (d.id === state.selectedUser?.id ? "red" : "#333"))
      .attr("stroke-width", (d) => (d.id === state.selectedUser?.id ? 2 : 1))
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        if (!state.expandedNodes.includes(d.login)) {
          fetchAndExpandUser(d.login, d);
        } else {
          dispatch({ type: "SELECT_USER", payload: d });
        }
        setDetailsVisible(true);
      })
      .on("mouseover", function (event, d) {
        d3.select(this)
          .transition()
          .attr("width", 48)
          .attr("height", 48)
          .attr("x", d.x - 24)
          .attr("y", d.y - 24);
      })
      .on("mouseout", function (event, d) {
        d3.select(this)
          .transition()
          .attr("width", 32)
          .attr("height", 32)
          .attr("x", d.x - 16)
          .attr("y", d.y - 16);
      });

    labelGroup
      .selectAll("text")
      .data(
        state.nodes.filter((n) => state.expandedNodes.includes(n.login)),
        (d) => d.id
      )
      .join("text")
      .text((d) => d.name || d.login)
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y - 26)
      .attr("text-anchor", "middle")
      .attr("fill", "#000000")
      .attr("font-size", 10)
      .attr("font-family", "Ubuntu")
      .attr("pointer-events", "none");

    simulationRef.current = d3
      .forceSimulation(state.nodes)
      .force(
        "link",
        d3
          .forceLink(state.links)
          .id((d) => d.id)
          .distance(80)
      )
      .force("charge", d3.forceManyBody().strength(-160))
      .force("center", d3.forceCenter(500, 300))
      .on("tick", () => {
        node.attr("x", (d) => d.x - 16).attr("y", (d) => d.y - 16);

        link
          .attr("x1", (d) => d.source.x)
          .attr("y1", (d) => d.source.y)
          .attr("x2", (d) => d.target.x)
          .attr("y2", (d) => d.target.y);

        labelGroup
          .selectAll("text")
          .attr("x", (d) => d.x)
          .attr("y", (d) => d.y - 26);
      });
  }, [state.nodes, state.links, state.selectedUser, state.expandedNodes]);

  return (
    <svg ref={svgRef} width="100%" height="600">
      <g ref={gRef} />
    </svg>
  );
}

export default Grapher;
