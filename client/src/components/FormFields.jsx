import React from 'react';
import { Form } from 'react-bootstrap';

function FormFields({ title, setTitle, body, setBody, category, setCategory, categories }) {
  return (
    <>
      <Form.Group className="mb-3" controlId="formBasicTitle">
        <Form.Label>Title</Form.Label>
        <Form.Control type="text" placeholder="Title here" value={title} onChange={e => setTitle(e.target.value)} />
      </Form.Group>
      <Form.Group className="mb-3" controlId="formBasicBody">
        <Form.Label>Body</Form.Label>
        <Form.Control as="textarea" rows={3} placeholder="Enter your request" value={body} onChange={e => setBody(e.target.value)} />
      </Form.Group>
      <Form.Select aria-label="Category" value={category} onChange={e => setCategory(e.target.value)}>
        <option>Select a category</option>
        {categories.map((category) => (
          <option key={category.id} value={category.name}>{category.name}</option>
        ))}
      </Form.Select>
    </>
  );
}

export default FormFields;
