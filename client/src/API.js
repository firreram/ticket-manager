import dayjs from 'dayjs';

const SERVER_URL = 'http://localhost:3001/api/';
const SERVER_URL2 = 'http://localhost:3002/api/';

/**
 * A utility function for parsing the HTTP response.
 */
function getJson(httpResponsePromise) {
    // server API always return JSON, in case of error the format is the following { error: <message> } 
    return new Promise((resolve, reject) => {
      httpResponsePromise
        .then((response) => {
          if (response.ok) {
  
           // the server always returns a JSON, even empty {}. Never null or non json, otherwise the method will fail
           response.json()
              .then( json => resolve(json) )
              .catch( err => reject({ error: "Cannot parse server response" }))
  
          } else {
            // analyzing the cause of error
            response.json()
              .then(obj => 
                reject(obj)
                ) // error msg in the response body
              .catch(err => reject({ error: "Cannot parse server response" })) // something else
          }
        })
        .catch(err => 
          reject({ error: "Cannot communicate"  })
        ) // connection error
    });
  }
  //timestamp in complete form, dayjs will take care of the rest
  const getTickets = async () => {
    // film.watchDate could be null or a string in the format YYYY-MM-DD
    return getJson(
      fetch(SERVER_URL + 'tickets', { credentials: 'include' })
    ).then( json => {
      return json.map((ticket) => {
        const getTicket = {
            id: ticket.id,
            title: ticket.title,
            category: ticket.category,
            userid: ticket.userid,
            username: ticket.username,
            timestamp: ticket.timestamp,
            body: ticket.body,
            status: ticket.status, //change in status, to be implemented
        }
        //console.log(getTicket);
        return getTicket;
      })
    })
  }

  const getBlocks = async (ticketId) => {
    return getJson(
      fetch(SERVER_URL + 'blocks/' + ticketId, { credentials: 'include' })
    ).then( json => {
      return json.map((block) => {
        const getBlock = {
            id: block.id,
            ticketid: block.ticketid,
            body: block.body,
            userid: block.userid,
            username: block.username,
            timestamp: block.timestamp,
        }
        //console.log(getBlock);
        return getBlock;
      })
    })
  }
  
  const getCategories = async () => {
    return getJson(
      fetch(SERVER_URL + 'categories', { credentials: 'include' })
    ).then( json => {
      return json.map((category) => {
        const getCategory = {
            name: category.name,
            id: category.id,
        } 
        return getCategory;
      })
    })
  }

  //addticket MUST send the timestamp in the complete format
  const addTicket = async (ticket) => {
    return getJson(
      fetch(SERVER_URL + 'tickets', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticket)
      })
    )
  }

  const addBlock = async (block) => {
    return getJson(
      fetch(SERVER_URL + 'blocks', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(block)
      })
    )
  }

  const changeTicketStatus = async (ticketId, status) => {
    return getJson(
      fetch(SERVER_URL + 'tickets/' + ticketId + '/status', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(status)
      })
    )
  }

  const changeTicketCategory = async (ticketId, category) => {
    return getJson(
      fetch(SERVER_URL + 'tickets/' + ticketId + '/category', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(category)
      })
    )
  }

  const logIn = async (credentials) => {
    return getJson(fetch(SERVER_URL + 'sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',  // this parameter specifies that authentication cookie must be forwared
      body: JSON.stringify(credentials),
    })
    )
  };

  /**
 * This function is used to verify if the user is still logged-in.
 * It returns a JSON object with the user info.
 */
const getUserInfo = async () => {
  return getJson(fetch(SERVER_URL + 'sessions/current', {
    // this parameter specifies that authentication cookie must be forwared
    credentials: 'include'
  })
  )
};

/**
 * This function destroy the current user's session and execute the log-out.
 */
const logOut = async() => {
  return getJson(fetch(SERVER_URL + 'sessions/current', {
    method: 'DELETE',
    credentials: 'include'  // this parameter specifies that authentication cookie must be forwared
  })
  )
}

async function getAuthToken() {
  return getJson(fetch(SERVER_URL + 'auth-token', {
    // this parameter specifies that authentication cookie must be forwared
    credentials: 'include'
  })
  )
}



  const getEstimate = async (ticketData, authToken) => {
    //console.log(authToken);
    return getJson(
      fetch(SERVER_URL2 + 'estimate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ticketData)
      })
    )
  }

  const API = { getTickets, getBlocks, getCategories, addTicket, addBlock, changeTicketStatus, changeTicketCategory, getEstimate, logIn, getUserInfo, logOut, getAuthToken};
  export default API;