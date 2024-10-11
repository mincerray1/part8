import { useQuery } from '@apollo/client'
import { useState, useEffect } from 'react'
import { ALL_BOOKS, ME } from '../queries.jsx'
const Recommend = (props) => {
	const result = useQuery(ALL_BOOKS, {
    variables: { genre: props.favoriteGenre }
  })

  if (!props.show) {
    return null
  }

	if (result.loading) {
    return <div>loading...</div>
  }

  const books = result.data.allBooks

  if (!books) {
    return
  }

  return (
    <div>
      <h2>recommendations</h2>
      {
        props.favoriteGenre ? 
        <span>books in your favorite genre <b>{props.favoriteGenre}</b></span>
        : ''
      }
      
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Recommend
