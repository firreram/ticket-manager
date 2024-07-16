import React from 'react';
import { Row, Col, Dropdown, Button } from 'react-bootstrap';

function TicketHeader({ ticketData, isAdmin, categories, handleCategoryChange, handleStatusChange, estimate, user }) {
    return (
        <Row>
            <Col md="auto">
                <h5><strong>{ticketData.title}</strong></h5>
            </Col>
            <Col md="auto">
                {isAdmin ? (
                    <Dropdown>
                        <Dropdown.Toggle variant="info" id="dropdown-basic">
                            {ticketData.category}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            {categories.map((category) => (
                                <Dropdown.Item key={category.id} onClick={() => handleCategoryChange(category.name)}>
                                    {category.name}
                                </Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                ) : (
                    <Button variant="info" disabled>{ticketData.category}</Button>
                )}
            </Col>
            <Col md="auto">
                <Row>
                    <Col>
                        {(isAdmin || (user && ticketData.userid == user.id)) ? (
                            (ticketData.status === 'closed' && !isAdmin) ? (
                                <Button variant="danger" disabled>{ticketData.status}</Button>
                            ) : (
                                <Dropdown>
                                    <Dropdown.Toggle variant={ticketData.status === 'open' ? 'success' : 'danger'} id="dropdown-basic">
                                        {ticketData.status}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        {ticketData.status === 'open' ? (
                                            <Dropdown.Item onClick={() => handleStatusChange('closed')}>Close</Dropdown.Item>
                                        ) : (
                                            <Dropdown.Item onClick={() => handleStatusChange('open')}>Open</Dropdown.Item>
                                        )}
                                    </Dropdown.Menu>
                                </Dropdown>
                            )
                        ) : (
                            <Button variant={ticketData.status === 'open' ? 'success' : 'danger'} disabled>{ticketData.status}</Button>
                        )}
                    </Col>
                </Row>
            </Col>
            <Col className="text-muted text-start">
                {isAdmin && <p>Estimation: {estimate} hours</p>}
            </Col>
            <Col className="text-muted text-end" md="auto">{ticketData.username}</Col>
            <Col className="text-muted text-end" md="auto">{ticketData.timestamp}</Col>
        </Row>
    );
}

export default TicketHeader;
