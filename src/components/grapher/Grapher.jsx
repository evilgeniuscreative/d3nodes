import React, { createContext, useReducer, useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { graphReducer, initialState } from "../../state";
import { fetchUserAndConnections } from "../../api";
import Details from "../details/Details";
import { FormControl, InputLabel, Select, MenuItem, Box } from "@mui/material";

export const GraphContext = createContext();

function GraphApp({ selectedUser }) {
  const [state, dispatch] = useReducer(graphReducer, initialState);
  const svgRef = useRef(null);
  const gRef = useRef(null);
  const simulationRef = useRef(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [connectionLimit, setConnectionLimit] = useState(100);

  // Zoom and Pan setup
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
      .force("link", d3.forceLink().id(d => d.id).distance(d => {
        if (d.source.id === selectedUser?.login) return 200;
        return 100;
      }))
      .force("charge", d3.forceManyBody().strength(-160))
      .force("center", d3.forceCenter(svgRef.current.clientWidth / 2, 300))
      .force("x", d3.forceX(svgRef.current.clientWidth / 2).strength(0.05))
      .force("y", d3.forceY(300).strength(0.05));
  }, []);

  // Main rendering effect
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const g = gRef.current;
    const simulation = simulationRef.current;

    simulation.nodes(state.nodes);
    simulation.force("link").links(state.links);
    simulation.tick(10);

    const link = g.select("g.links")
      .selectAll("line")
      .data(state.links, d => d.source + "-" + d.target)
      .join("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6);

    const node = g.select("g.nodes")
      .selectAll("image")
      .data(state.nodes, d => d.id)
      .join("image")
      .attr("xlink:href", d => d.avatarUrl)
      .attr("x", d => d.x - 16)
      .attr("y", d => d.y - 16)
      .attr("width", 32)
      .attr("height", 32)
      .attr("clip-path", "circle(16px at center)")
      .attr("stroke", d => d.id === state.selectedUser?.id ? "red" : "#333")
      .attr("stroke-width", d => d.id === state.selectedUser?.id ? 2 : 1)
      .on("click", (event, d) => {
        if (!state.expandedNodes.includes(d.login)) {
          fetchAndExpandUser(d.login, d);
        } else {
          dispatch({ type: "SELECT_USER", payload: d });
        }
        setDetailsVisible(true);
      })
      .on("mouseover", function (event, d) {
        d3.select(this).transition().attr("width", 48).attr("height", 48)
          .attr("x", d.x - 24).attr("y", d.y - 24);
      })
      .on("mouseout", function (event, d) {
        d3.select(this).transition().attr("width", 32).attr("height", 32)
          .attr("x", d.x - 16).attr("y", d.y - 16);
      });

    g.select("g.labels")
      .selectAll("text")
      .data(state.nodes.filter(n => state.expandedNodes.includes(n.login)), d => d.id)
      .join("text")
      .text(d => d.login)
      .attr("x", d => d.x)
      .attr("y", d => d.y - 22)
      .attr("text-anchor", "middle")
      .attr("fill", "#F4C430")
      .attr("font-size", 10)
      .attr("font-family", "Ubuntu");

    simulation.on("tick", () => {
      node
        .attr("x", d => d.x - 16)
        .attr("y", d => d.y - 16);
      link
        .attr("x1", d => getNode(d.source)?.x)
        .attr("y1", d => getNode(d.source)?.y)
        .attr("x2", d => getNode(d.target)?.x)
        .attr("y2", d => getNode(d.target)?.y);
    });

  }, [state.nodes, state.links, state.selectedUser]);

  useEffect(() => {
    if (!selectedUser?.login || state.expandedNodes.includes(selectedUser.login)) return;
    fetchAndExpandUser(selectedUser.login, selectedUser);
    setDetailsVisible(true);
  }, [selectedUser, connectionLimit]);

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

      dispatch({ type: "MERGE_NODES_AND_LINKS", payload: { nodes, links, rateLimit } });
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} mb={1}>
        <FormControl size="small">
          <InputLabel>Selected User Connections to Show</InputLabel>
          <Select
            value={connectionLimit}
            label="Selected User Connections to Show"
            onChange={(e) => setConnectionLimit(parseInt(e.target.value))}
            style={{ width: 250 }}
          >
           {(() => {
  const maxConnections = (selectedUser?.followers?.totalCount || 0) + (selectedUser?.following?.totalCount || 0);
  const defaultMax = Math.max(100, maxConnections);
  const step = Math.ceil(defaultMax / 10);

  const options = Array.from({ length: 10 }, (_, i) => {
    const val = Math.round((i + 1) * step / 10) * 10;
    return val > maxConnections ? maxConnections : val;
  });

  const uniqueSorted = [...new Set(options)].sort((a, b) => a - b);

  return uniqueSorted.map(value => (
    <MenuItem key={value} value={value}>{value}</MenuItem>
  ));
})()}

          </Select>
        </FormControl>
      </Box>
      <svg ref={svgRef}></svg>
      {detailsVisible && (
        <Box position="absolute" right={0} top={0} width="250px" height="100%" bgcolor="#f5f5f5" p={2} overflow="auto">
          <Details user={state.selectedUser} />
        </Box>
      )}
    </GraphContext.Provider>
  );
}

export default GraphApp;
