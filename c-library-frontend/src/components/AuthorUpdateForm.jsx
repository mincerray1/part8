import { useState } from 'react'
import Select from 'react-select'
import { useMutation } from '@apollo/client'
import { EDIT_AUTHOR, ALL_AUTHORS } from '../queries.jsx'

const AuthorUpdateForm = ({ setError, authors }) => {
  const [born, setBorn] = useState('')
  const [name, setName] = useState({value: '', label: ''})

  const [ editAuthor ] = useMutation(EDIT_AUTHOR, {
  refetchQueries: [ { query: ALL_AUTHORS } ],
  onError: (error) => {
    const messages = error.graphQLErrors.map(e => e.message).join('\n')
    setError(messages)
    console.log(messages)
    }
  })

  const options = authors.map((a) => {
    return {
      value: a.name,
      label: a.name
    }
  })

  options.unshift({value: '', label: ''})

  const submit = (event) => {
    event.preventDefault()

    console.log(name.value)
    editAuthor({  variables: { name: name.value, setBornTo: parseInt(born) } })

    setName({value: '', label: ''})
    setBorn('')
  }

  return (
    <div>
      <form onSubmit={submit}>
        <label id="aria-label" htmlFor="author-input">
          Select author
        </label>
        <Select options={options} inputId="author-input" value={name} onChange={(choice) => setName(choice)} />
        born <input value={born}
          onChange={({ target }) => setBorn(target.value)}
        />				
        <button type='submit'>update author!</button>
      </form>
    </div>
  )
}

export default AuthorUpdateForm