import { gql, useQuery, useApolloClient, useSubscription } from '@apollo/client'
import { useState, useEffect } from "react"
import Authors from "./components/Authors"
import Books from "./components/Books"
import Recommend from "./components/Recommend"
import NewBook from "./components/NewBook"
import LoginForm from './components/LoginForm'
import { ME, BOOK_ADDED, ALL_BOOKS } from './queries.jsx'

export const updateCache = (cache, query, addedBook) => {
  // alert('hellow')
  cache.updateQuery(query, ({ allBooks }) => {
    console.log('allBooks', allBooks)
    return {
      allBooks: allBooks.concat(addedBook),
    }
  })
}

const App = () => {
  const [page, setPage] = useState("authors");
  const [errorMessage, setErrorMessage] = useState(null)
  const [token, setToken] = useState(null)
  const client = useApolloClient()
  const result_me = useQuery(ME)

  useSubscription(BOOK_ADDED, {
    onData: ({ data, client }) => {
			const addedBook = data.data.bookAdded
      console.log(addedBook)
      notify(`${addedBook.title} added`)
      updateCache(client.cache, { query: ALL_BOOKS }, addedBook)
    }
  })

  useEffect(() => {
    if (!token) {
      setToken(localStorage.getItem('library-user-token'))      
    }
  }, [token])

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 3000)
  }
	if (result_me.loading) {
    return <div>loading...</div>
  }
  
  const currentUser = result_me.data.me  

  if (!currentUser) {
    return
  }

  // if (!token) {
  //   return (
  //     <>
  //       <Notify errorMessage={errorMessage} />
  //       <LoginForm setToken={setToken} setError={notify} />
  //     </>
  //   )
  // }

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {
          token ? 
          <><button onClick={() => setPage("add")}>add book</button><button onClick={() => setPage("recommend")}>recommend</button><button onClick={logout}>logout</button></>
          : <button onClick={() => setPage("login")}>login</button>
        }
      </div>
      <Notify errorMessage={errorMessage} />

      <Authors show={page === "authors"} />

      <Books show={page === "books"} />

      <NewBook show={(page === "add") && token} setError={notify} />
      {
        !token ? <LoginForm setToken={setToken} setError={notify} show={page === "login"} /> : <Recommend show={page === "recommend"} favoriteGenre={currentUser.favoriteGenre}/>
      }
      
    </div>
  );
};

const Notify = ({errorMessage}) => {
  if ( !errorMessage ) {
    return null
  }
  return (
    <div style={{color: 'red'}}>
    {errorMessage}
    </div>
  )
}

export default App;
