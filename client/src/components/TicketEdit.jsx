import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import API from '../API.js';
import FormFields from './FormFields';
import PreviewModal from './PreviewModal';

const TicketForm = (props) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('');
  const [estimate, setEstimate] = useState(undefined);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);

  const getEstimate = (ticket) => {
    return API.getEstimate(ticket, props.authToken)
      .then((estimate) => {
        setEstimate(estimate.estimation);
      })
      .catch(() => {
        API.getAuthToken()
          .then(resp => {
            props.setAuthToken(resp.token);
            return API.getEstimate(ticket, resp.token);
          })
          .then((estimate) => {
            setEstimate(estimate.estimation);
          });
      });
  };

  const handleShow = () => {
    setShow(true);
    getEstimate({ title, body, category });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const ticket = {
      title: title,
      body: body,
      category: category,
    };
    if (ticket.title.length === 0 || ticket.body.length === 0) {
      handleClose();
      setErrorMsg('Please enter title and body');
    } else if (ticket.category === '') {
      handleClose();
      setErrorMsg('Please select a category');
    } else {
      setSuccessMsg('Ticket submitted successfully');
      handleClose();
      props.addTicket(ticket);
    }
  };

  return (
    <>
      {errorMsg && <Alert variant='danger' onClose={() => setErrorMsg('')} dismissible>{errorMsg}</Alert>}
      {successMsg && <Alert variant='success' onClose={() => setSuccessMsg('')} dismissible>{successMsg}</Alert>}
      <Form>
        <FormFields
          title={title}
          setTitle={setTitle}
          body={body}
          setBody={setBody}
          category={category}
          setCategory={setCategory}
          categories={props.categories}
        />
        <Button variant="primary" className='mt-3' onClick={handleShow} disabled={title.length === 0 || body.length === 0 || category === ''}>
          Preview
        </Button>
      </Form>
      <PreviewModal
        show={show}
        handleClose={handleClose}
        handleSubmit={handleSubmit}
        title={title}
        body={body}
        category={category}
        estimate={estimate}
        user={props.user}
        isAdmin={props.isAdmin}
      />
    </>
  );
};

export { TicketForm };
