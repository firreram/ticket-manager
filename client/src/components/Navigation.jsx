import 'bootstrap-icons/font/bootstrap-icons.css';

import { Navbar, Nav, Form, Container} from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { LoginButton, LogoutButton } from './Auth';
//a shield appears for admin users
const Navigation = (props) => {
    //console.log(props);
    return (
        <Navbar bg="dark" variant="dark" className="justify-content-between" sticky="top">
            <Link to="/" style={{ textDecoration: 'none' }}>
                <Navbar.Brand>
                    <i className="bi bi-badge-tm fs-2 mx-3" />
                    Home
                </Navbar.Brand>
            </Link>
            <Nav>
                <Navbar.Text className="mx-2 fs-5">
                    {props.user && props.user.username && `You are logged in as: ${props.user.username}`}
                    {props.user && props.user.admin ? (<i className="bi bi-shield fs-5 mx-2" />) : (<> </>)}
                </Navbar.Text>
                <Form className="mx-2 mt-1">
                    {props.loggedIn ? <LogoutButton logout={props.logout} /> : <LoginButton />}
                </Form>
            </Nav>
        </Navbar>
    );
}


export { Navigation };
