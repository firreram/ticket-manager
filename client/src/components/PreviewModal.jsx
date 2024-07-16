import React from 'react';
import { Modal, Card, Button, Row, Col } from 'react-bootstrap';
import dayjs from 'dayjs';

function PreviewModal({ show, handleClose, handleSubmit, title, body, category, estimate, user, isAdmin }) {
  return (
    <Modal size="lg" show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Preview</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Card>
          <Card.Header>
            <Row>
              <Col md="auto">
                <h5><strong>{title}</strong></h5>
              </Col>
              <Col md='auto'><Button variant="info" size="sm" disabled>{category}</Button></Col>
              <Col className="text-muted text-end">{user.username}</Col>
              <Col className="text-muted text-end" md="auto">{dayjs().format('YYYY-MM-DD')}</Col>
            </Row>
          </Card.Header>
          <Card.Body>
            <p>{body.split('\n').map((line, index) => (
              <React.Fragment key={index}>
                {line}
                <br />
              </React.Fragment>
            ))}</p>
          </Card.Body>
        </Card>
      </Modal.Body>
      <Modal.Footer>
        {isAdmin ? 
          <h5 style={{ color: 'red' }}>Ticket resolve estimation: {estimate} hours</h5> : 
          <h5 style={{ color: 'red' }}>Ticket resolve estimation: {estimate} days</h5>
        }
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default PreviewModal;
