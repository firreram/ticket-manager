import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

import dayjs from 'dayjs';

import { React, useState, useEffect } from 'react';
import { Container, Row, Col, Button, Toast } from 'react-bootstrap';
import { BrowserRouter, Routes, Route, Outlet, Link, useParams, Navigate, useNavigate } from 'react-router-dom';
import { GenericLayout, NotFoundLayout, TableLayout, LoginLayout, AddLayout } from './components/Layout';
import API from './API.js';


function App() {
  return (
    <BrowserRouter>
      <AppWithRouter />
    </BrowserRouter>
  );
}

function AppWithRouter(props) {
  const navigate = useNavigate();
  /* app states */
  const [ticketList, setTicketList] = useState([]);
  //const [blockList, setBlockList] = useState([]);
  const [categories, setCategories] = useState([]); // categories for the tickets

  const [message, setMessage] = useState(''); // error message
  const [loading, setLoading] = useState(false); // loading flag
  const [dirty, setDirty] = useState(true); // dirty flag to force a refresh of the page
  //const [dirtyBlock, setDirtyBlock] = useState(true); // dirty flag to force a refresh of the blocks

  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(undefined);

  function handleErrors(err) {
    console.log('handleError: ',err);
    let errMsg = 'Unkwnown error';
    if (err.errors) {
      if (err.errors[0].msg) {
        errMsg = err.errors[0].msg;
      }
    } else {
      if (err.error) {
        errMsg = err.error;
      }
    }
    setMessage(errMsg);

    if (errMsg === 'Not authorized') // logout the user if not authorized
      setTimeout(() => {  // do logout in the app state
        setUser(undefined); setLoggedIn(false); setDirty(true); setAuthToken(undefined); setIsAdmin(false); setCategories([]);
      }, 2000);
    else
      setTimeout(()=>setDirty(true), 2000);  // Fetch the current version from server, after a while
  }

  const renewToken = () => {
    API.getAuthToken().then((resp) => { setAuthToken(resp.token)} )
    .catch(err => {console.log("DEBUG: renewToken err: ",err)});
  }

  useEffect(()=> {
    const checkAuth = async() => {
      try {
        // here you have the user info, if already logged in
        const user = await API.getUserInfo();
        setLoggedIn(true);
        setIsAdmin(user.admin == 1);
        setUser(user);
        API.getAuthToken().then((resp) => { setAuthToken(resp.token); })
        //console.log(authToken);
      } catch(err) {
        // NO need to do anything: user is simply not yet authenticated
        //handleError(err);
      }
    };
    checkAuth();

  }, []);  // The useEffect callback is called only the first time the component is mounted.

  const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      //console.log(user);
      setUser(user);
      setIsAdmin(user.admin == 1);
      setLoggedIn(true);
      renewToken();
      setDirty(true); // force a reload of the complete(with body) ticket list
    } catch (err) {
      // error is handled and visualized in the login form, do not manage error, throw it
      throw err;
    }
  };

  const handleLogout = async () => {
    await API.logOut();
    setLoggedIn(false);
    // clean up everything
    setUser(null);
    setAuthToken(undefined);
    setIsAdmin(false);
    setCategories([]);
    setDirty(true);
  };

  //gategories loaded once at application start
  //load categories if the user is logged in?
  //api authentication???
  useEffect(() => {
    if (loggedIn) {
      API.getCategories()
      .then(categories => {
        setCategories(categories);
        //console.log(categories);
      })
      .catch(e => {
        handleErrors(e);
      });
    }
  }, [loggedIn]); // The useEffect callback is called only when the user logs in.
    

  // Add a new ticket, force a reload and navigate to the main page
  //for responsiveness the app will navigate to home even before the update
  function addTicket(ticket) {
    navigate('/');
    setLoading(true);
    API.addTicket(ticket)
      .then( () => {
        setDirty(true);
      })
      .catch( e => handleErrors(e) );
  }

  function changeStatus(ticketId, status){
    API.changeTicketStatus(ticketId, status)
      .then( () => {
        setDirty(true);
      })
      .catch( e => handleErrors(e) );
  }

  function changeCategory(ticketId, category){
    API.changeTicketCategory(ticketId, category)
      .then( () => {
        setDirty(true);
      })
      .catch( e => handleErrors(e) );
  }

  return (
        <Routes>
          <Route path="/" element={<GenericLayout message={message} setMessage={setMessage} loggedIn={loggedIn} user={user} logout={handleLogout}/>} >
            <Route index element={<TableLayout 
                 ticketList={ticketList} setTicketList={setTicketList} handleErrors={handleErrors}
                 dirty={dirty} setDirty={setDirty} loading={loading} setLoading={setLoading}
                changeStatus={changeStatus} categories={categories} changeCategory={changeCategory} authToken={authToken} setAuthToken={setAuthToken}
                 loggedIn={loggedIn} isAdmin={isAdmin} user={user}/>} />
            <Route path="/add" element={loggedIn ? <AddLayout addTicket={addTicket} categories={categories} 
                    user={user} authToken={authToken} setAuthToken={setAuthToken} isAdmin={isAdmin} /> : <Navigate replace to='/' />}/>   
            <Route path="/login" element={!loggedIn ? <LoginLayout login={handleLogin} /> : <Navigate replace to='/' />} />
            <Route path="*" element={<NotFoundLayout />} />
          </Route>
        </Routes>
);
};

export default App
