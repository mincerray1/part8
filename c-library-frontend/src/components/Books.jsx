import { useQuery } from '@apollo/client'
import { useState, useEffect } from 'react'
import { ALL_BOOKS } from '../queries.jsx'
const Books = (props) => {
  const [selectedGenre, setSelectedGenre] = useState('')
	const result = useQuery(ALL_BOOKS, {
    variables: { genre: selectedGenre }
  })

  if (!props.show) {
    return null
  }

	if (result.loading) {
    return <div>loading...</div>
  }

  const books = result.data.allBooks
  const genres = result.data.allGenres

  const handleClick = (g) => {
    setSelectedGenre(g)
    result.refetch()
  }
  

  if (!books && !genres) {
    return
  }

  return (
    <div>
      <h2>books</h2>
      {
        selectedGenre ? 
        <span>in genre <b>{selectedGenre}</b></span>
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
      {
        genres.map((g) => (
          <button onClick={() => handleClick(g)} key={g}>{g}</button>
        ))
      }
    </div>
  )
}

export default Books
