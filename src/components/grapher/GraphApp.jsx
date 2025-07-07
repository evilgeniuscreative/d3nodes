import React, { useReducer, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { graphReducer, initialState } from '../../state.js';
import AsyncExample from '../typeahead/Typeahead.jsx';

export default function GraphApp() {
    const [state, dispatch] = useReducer(graphReducer, initialState);
    const svgRef = useRef(null);

    async function fetchConnections(node) {
        const headers = {
            Authorization: `token ${import.meta.env.VITE_GITHUB_TOKEN}`,
        };

        const [followers, following] = await Promise.all([
            fetch(
                `https://api.github.com/users/${node.id}/followers?per_page=50`,
                { headers }
            ).then((res) => res.json()),
            fetch(
                `https://api.github.com/users/${node.id}/following?per_page=50`,
                { headers }
            ).then((res) => res.json()),
        ]);

        const connections = [...followers, ...following];
        const newNodes = connections.map((user) => ({ id: user.login }));
        const combinedNodes = [
            { id: node.id }, // ensure source is always in nodes
            ...state.nodes,
            ...newNodes.filter((n) => !state.nodes.find((o) => o.id === n.id)),
        ];

        // ✅ Dispatch nodes first to avoid D3 "node not found" error
        dispatch({
            type: 'SET_NEW_NODES',
            payload: {
                nodes: combinedNodes,
                links: state.links,
            },
        });

        // ✅ Dispatch links after a small delay
        setTimeout(() => {
            const newLinks = connections.map((user) => ({
                source: node.id,
                target: user.login,
            }));
            dispatch({
                type: 'SET_NEW_NODES',
                payload: {
                    nodes: combinedNodes,
                    links: [...state.links, ...newLinks],
                },
            });
        }, 50);

        dispatch({ type: 'MARK_NODE_EXPANDED', payload: node.id });
    }

    function handleNodeClick(d) {
        dispatch({ type: 'SELECT_NODE', payload: d });
        if (!state.expandedNodes.includes(d.id)) {
            fetchConnections(d);
        }
    }

    function handleUserSelect(user) {
        const newNode = { id: user.login };

        dispatch({
            type: 'SET_NEW_NODES',
            payload: {
                nodes: [newNode],
                links: [],
            },
        });

        dispatch({ type: 'SELECT_NODE', payload: newNode });
        fetchConnections(newNode);
    }

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const width = 600;
        const height = 600;

        const simulation = d3
            .forceSimulation(state.nodes)
            .force(
                'link',
                d3
                    .forceLink(state.links)
                    .id((d) => d.id)
                    .distance(100)
            )
            .force('charge', d3.forceManyBody().strength(-200))
            .force('center', d3.forceCenter(width / 2, height / 2));

        const link = svg
            .append('g')
            .attr('stroke', '#aaa')
            .selectAll('line')
            .data(state.links)
            .join('line');

        const node = svg
            .append('g')
            .attr('stroke', '#fff')
            .attr('stroke-width', 1.5)
            .selectAll('circle')
            .data(state.nodes)
            .join('circle')
            .attr('r', 10)
            .attr('fill', (d) =>
                state.selectedNode?.id === d.id ? 'lightblue' : 'steelblue'
            )
            .call(drag(simulation))
            .on('click', handleNodeClick);

        node.append('title').text((d) => d.id);

        simulation.on('tick', () => {
            link.attr('x1', (d) => d.source.x)
                .attr('y1', (d) => d.source.y)
                .attr('x2', (d) => d.target.x)
                .attr('y2', (d) => d.target.y);

            node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
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
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended);
    }

    return (
        <div className='p-4 max-w-xl mx-auto'>
            <h1 className='text-xl font-bold mb-4'>PeopleGraph</h1>
            <AsyncExample onUserSelect={handleUserSelect} />
            <svg
                ref={svgRef}
                width={600}
                height={600}
            ></svg>

            {state.selectedNode && (
                <div className='mt-4 p-4 border rounded bg-gray-50'>
                    <h2 className='font-semibold text-lg mb-2'>
                        Selected Node
                    </h2>
                    <p>ID: {state.selectedNode.id}</p>
                </div>
            )}
        </div>
    );
}
