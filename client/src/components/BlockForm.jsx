import React from 'react';
import { Form, Button } from 'react-bootstrap';

function BlockForm({ body, setBody, handleBlockSubmit }) {
    return (
        <Form onSubmit={handleBlockSubmit} className="my-2">
            <Form.Group className="mb-3" controlId="formBasicBody">
                <Form.Control as="textarea" rows={3} placeholder="Your answer" value={body} onChange={e => setBody(e.target.value)} />
            </Form.Group>
            <Button variant="primary" type="submit" className="mb-3" disabled={body.trim() === ''}>
                Send
            </Button>
        </Form>
    );
}

export default BlockForm;
