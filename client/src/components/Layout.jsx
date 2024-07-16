import { Row, Col, Button, Alert, Toast, Container } from 'react-bootstrap';
import { Outlet, Link, useParams, Navigate, useLocation } from 'react-router-dom';

import { Navigation } from './Navigation';
import { TicketTable } from './TicketLibrary';
import { TicketForm } from './TicketEdit';
import { LoginForm } from './Auth';
import { useEffect } from 'react';

import API from '../API.js';
import dayjs from 'dayjs';

function NotFoundLayout() {
    return (
      <>
        <h2>This route is not valid!</h2>
        <Link to="/">
          <Button variant="primary">Go back to the main page!</Button>
        </Link>
      </>
    );
  }

function AddLayout(props) {
    return (
      <TicketForm addTicket={props.addTicket} categories={props.categories} user={props.user} authToken={props.authToken} setAuthToken={props.setAuthToken} isAdmin={props.isAdmin}/>
    );
  }

function LoginLayout(props) {
    return (
        <Row>
            <Col>
                <LoginForm login={props.login} />
            </Col>
        </Row>
    );
}

function TableLayout(props) {
  
    //console.log("DEBUG: re-render TableLayout");
    //console.log(JSON.stringify(props));
    useEffect(() => {
      if (props.dirty) {
        props.setLoading(true); // Set loading state to true
        API.getTickets()
          .then(tickets => {
            // Sort tickets by date using dayjs in descending order
            tickets = tickets.sort((a, b) => dayjs(b.timestamp).diff(dayjs(a.timestamp)));
            //console.log(tickets);
            props.setTicketList(tickets);
            props.setDirty(false);
            props.setLoading(false); // Set loading state to false after tickets are loaded
          })
          .catch(e => {
            props.handleErrors(e);
            props.setLoading(false); // Set loading state to false if there's an error
          });
      }
    }, [props.dirty]);

    //console.log(props.blockList);
    return (
      <>
        <Row className="my-3">
          <Col>
            <h2>All tickets</h2>
          </Col>
          <Col className={"text-end"}>
            {props.loggedIn ? (
              <Link to="/add">
                <Button variant="primary">Add ticket</Button>
              </Link>
            ) : (
              <Button variant="secondary" disabled>
                Add ticket
              </Button>
            )}
          </Col>
        </Row>
        <hr />
        <TicketTable
          tickets={props.ticketList}
          blocks={props.blockList}
          loading={props.loading}
          addBlock={props.addBlock}
          changeStatus={props.changeStatus}
          categories={props.categories}
          changeCategory={props.changeCategory}
          loggedIn={props.loggedIn}
          authToken={props.authToken}
          setAuthToken={props.setAuthToken}
          isAdmin={props.isAdmin}
          user={props.user}
          handleErrors={props.handleErrors}
        />
      </>
    );
  }

  function GenericLayout(props) {
    return (
      <>
        <Navigation loggedIn={props.loggedIn} user={props.user} logout={props.logout} />
        <Container fluid>
        <Row>
          <Col>
          {props.message? <Alert className='my-1' onClose={() => props.setMessage('')} variant='danger' dismissible>
            {props.message}</Alert> : null}
          </Col>
        </Row>
        <Row>
            <Col>
                <Outlet/>
            </Col>
        </Row>
        </Container>
      </>
    );
  }

  export { GenericLayout, TableLayout, NotFoundLayout, LoginLayout, AddLayout };