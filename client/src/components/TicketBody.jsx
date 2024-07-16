import React from 'react';
import { Collapse } from 'react-bootstrap';
import BlockList from './BlockList';
import BlockForm from './BlockForm';

function TicketBody({ ticketData, blocks, open, body, setBody, handleBlockSubmit, loggedIn }) {
    return (
        <>
            {loggedIn ? (
                <Collapse in={open}>
                    <div>
                        <p>{ticketData.body.split('\n').map((line, index) => (
                            <React.Fragment key={index}>{line}<br /></React.Fragment>
                        ))}</p>
                        <hr />
                        <BlockList blocks={blocks} />
                        {ticketData.status !== 'closed' && (
                            <BlockForm body={body} setBody={setBody} handleBlockSubmit={handleBlockSubmit} />
                        )}
                    </div>
                </Collapse>
            ) : null}
        </>
    );
}

export default TicketBody;
