import 'dayjs';
import { Card, Button } from 'react-bootstrap';
import API from '../API.js';
import React, { useState, useEffect } from 'react';
import TicketHeader from './TicketHeader';
import TicketBody from './TicketBody';

function Ticket(props) {
    const [open, setOpen] = useState(false);
    const [body, setBody] = useState('');
    const [estimate, setEstimate] = useState('NaN');
    const [blocks, setBlocks] = useState([]);
    const [dirtyBlock, setDirtyBlock] = useState(true);

    function addBlock(block) {
        API.addBlock(block)
            .then(() => setDirtyBlock(true))
            .catch(e => props.handleErrors(e));
    }

    useEffect(() => {
        const getBlocks = (ticket) => {
            return API.getBlocks(ticket.id)
                .then(blocks => {
                    setDirtyBlock(false);
                    setBlocks(blocks);
                })
                .catch(error => props.handleErrors(error));
        };

        if (props.loggedIn && open) {
            getBlocks(props.ticketData);
        }
    }, [dirtyBlock, open]);

    useEffect(() => {
        if (!props.loggedIn) setBlocks([]);
    }, [props.loggedIn]);

    useEffect(() => {
        setEstimate('getting estimate...');
        const getEstimate = (ticket, authToken) => {
            return API.getEstimate(ticket, authToken)
                .then(estimate => setEstimate(estimate.estimation))
                .catch(error => {
                    API.getAuthToken()
                        .then(resp => props.setAuthToken(resp.token));
                });
        };

        if (props.isAdmin && props.authToken) {
            getEstimate(props.ticketData, props.authToken);
        }
    }, [props.ticketData.category, props.authToken]);

    const handleStatusChange = (newStatus) => {
        const status = { status: newStatus };
        props.changeStatus(props.ticketData.id, status);
    };

    const handleCategoryChange = (newCategory) => {
        const category = { category: newCategory };
        props.changeCategory(props.ticketData.id, category);
    };

    const handleBlockSubmit = (event) => {
        event.preventDefault();
        const block = {
            ticketid: props.ticketData.id,
            body: body,
        };
        addBlock(block);
        setBody('');
    };

    return (
        <Card className="my-3">
            <Card.Header>
                <TicketHeader
                    ticketData={props.ticketData}
                    isAdmin={props.isAdmin}
                    categories={props.categories}
                    handleCategoryChange={handleCategoryChange}
                    handleStatusChange={handleStatusChange}
                    estimate={estimate}
                    user={props.user}
                />
            </Card.Header>
            <Card.Body>
                <TicketBody
                    ticketData={props.ticketData}
                    blocks={blocks}
                    open={open}
                    body={body}
                    setBody={setBody}
                    handleBlockSubmit={handleBlockSubmit}
                    loggedIn={props.loggedIn}
                />
                <hr />
                {props.loggedIn ? (
                    <Button variant="primary" onClick={() => setOpen(!open)}>
                        {open ? 'Show Less' : 'Show More'}
                    </Button>
                ) : (
                    <Button variant="secondary" disabled>
                        Log in to see more
                    </Button>
                )}
            </Card.Body>
        </Card>
    );
}

export { Ticket };
