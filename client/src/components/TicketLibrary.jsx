
import {Row, Col, Spinner} from 'react-bootstrap';
import React from 'react';
import { Ticket } from './TicketCard.jsx';

function TicketTable(props) {
        //console.log(props);
        const tickets = props.tickets;
        //row-col for the tickets
        return (
                <Row>
                        <Col>
                                {props.loading ? (
                                        <Spinner animation="border" role="status"></Spinner>
                                ) : null}
                                {tickets.map((ticket) => (
                                        <React.Fragment key={ticket.id}>
                                                <Ticket ticketData={ticket} addBlock={props.addBlock} changeStatus={props.changeStatus} categories={props.categories}
                                                        changeCategory={props.changeCategory} loggedIn={props.loggedIn} authToken={props.authToken} setAuthToken={props.setAuthToken} isAdmin={props.isAdmin} user={props.user}
                                                        handleErrors={props.handleErrors}/>
                                        </React.Fragment>
                                ))}
                        </Col>
                </Row>
        );
}
//add onClick on every row to navigate to the ticket details page
//the details stored in state? CHECK
//newline rendered in the details page only?
//limit the number of chars of the body in the table

export { TicketTable };
