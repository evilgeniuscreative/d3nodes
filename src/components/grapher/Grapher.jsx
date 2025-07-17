import React, { createContext, useReducer, useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { graphReducer, initialState } from "../../state";
import Details from "../details/Details";
import { fetchUserAndConnections } from "../../api";

export const GraphContext = createContext();

function GraphApp({ selectedUser }) {
  const [state, dispatch] = useReducer(graphReducer, initialState);
  const svgRef = useRef(null);
  const gRef = useRef(null);
  const simulationRef = useRef(null);
  const [detailsVisible, setDetailsVisible] = useState(false);

  useEffect(() => {
    const svg = d3.select(svgRef.current)
      .attr("width", "100%")
      .attr("height", 600);

    if (!gRef.current) {
      gRef.current = svg.append("g").attr("class", "zoom-container");
      gRef.current.append("g").attr("class", "links");
      gRef.current.append("g").attr("class", "nodes");
      gRef.current.append("g").attr("class", "labels");

      svg.call(
        d3.zoom()
          .scaleExtent([0.25, 4])
          .on("zoom", (event) => {
            gRef.current.attr("transform", event.transform);
          })
      );
    }

    simulationRef.current = d3.forceSimulation()
      .force("link", d3.forceLink().id(d => d.id).distance(80))
      .force("charge", d3.forceManyBody().strength(-120))
      .force("center", d3.forceCenter(svgRef.current.clientWidth / 2, 300))
      .force("x", d3.forceX(svgRef.current.clientWidth / 2).strength(0.05))
      .force("y", d3.forceY(300).strength(0.05));
  }, []);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const g = gRef.current;
    const simulation = simulationRef.current;

    simulation.nodes(state.nodes);
    simulation.force("link").links(state.links);
    simulation.tick(10); // Run 10 ticks to initialize layout

    const link = g.select("g.links")
      .selectAll("line")
      .data(state.links, d => d.source + "-" + d.target)
      .join("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6);

    const node = g.select("g.nodes")
      .selectAll("circle")
      .data(state.nodes, d => d.id)
      .join("circle")
      .attr("r", 16)
      .attr("fill", "#ccc")
      .attr("stroke", "#333")
      .attr("stroke-width", 1.5)
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        if (!state.expandedNodes.includes(d.login)) {
          fetchAndExpandUser(d.login, d);
        } else {
          dispatch({ type: "SELECT_USER", payload: d });
        }
        if (!detailsVisible) setDetailsVisible(true);
      })
      .call(d3.drag()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    simulation.on("tick", () => {
      node.attr("cx", d => d.x).attr("cy", d => d.y);
      link
        .attr("x1", d => getNode(d.source)?.x)
        .attr("y1", d => getNode(d.source)?.y)
        .attr("x2", d => getNode(d.target)?.x)
        .attr("y2", d => getNode(d.target)?.y);
    });
  }, [state.nodes, state.links]);

  useEffect(() => {
    if (!selectedUser?.login || state.expandedNodes.includes(selectedUser.login)) return;
    fetchAndExpandUser(selectedUser.login, selectedUser);
    setDetailsVisible(true);
  }, [selectedUser]);

  const fetchAndExpandUser = async (login, nodeData) => {
    if (!login) return;
    try {
      const { nodes, links, rateLimit } = await fetchUserAndConnections(login);

      const centeredX = svgRef.current.clientWidth / 2;
      const centeredY = 300;

      nodes.forEach((node) => {
        if (!("x" in node)) node.x = centeredX;
        if (!("y" in node)) node.y = centeredY;
      });

      dispatch({ type: "SET_NEW_NODES", payload: { nodes, links, rateLimit } });
      dispatch({ type: "MARK_NODE_EXPANDED", payload: login });
      dispatch({ type: "SELECT_USER", payload: nodeData });

      if (simulationRef.current) {
        simulationRef.current.alpha(1).restart();
      }
    } catch (err) {
      console.error("Failed to fetch user data for:", login, err);
    }
  };

  const getNode = idOrNode =>
    typeof idOrNode === "string"
      ? state.nodes.find(n => n.id === idOrNode)
      : idOrNode;

  return (
    <GraphContext.Provider value={{ state, dispatch }}>
      <svg ref={svgRef}></svg>
      {detailsVisible && <Details user={state.selectedUser} />}
    </GraphContext.Provider>
  );
}

export default GraphApp;
