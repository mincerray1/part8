import { gql } from '@apollo/client'

const BOOK_DETAILS = gql`
  fragment BookDetails on Book {
    id
    title
    author {
      name
    }
    published
  }
`

export const ALL_AUTHORS = gql`
query {
  allAuthors {
    name
    born
    id
    bookCount
  }
}
`

export const ALL_BOOKS = gql`
query AllBooks($genre: String){
  allBooks(genre: $genre) {
    ...BookDetails
  }
  allGenres
}
${BOOK_DETAILS}
`

export const CREATE_BOOK = gql`
mutation AddBook($title: String!, $published: Int, $author: String, $genres: [String!]) {
  addBook(title: $title, published: $published, author: $author, genres: $genres) {
    title
    author {
      born
      name
      id
    }
    genres
    id
    published
  }
}
`

export const EDIT_AUTHOR = gql`
mutation EditAuthor($name: String!, $setBornTo: Int) {
  editAuthor(name: $name, setBornTo: $setBornTo) {
    born
    id
    name
  }
}`

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password)  {
      value
    }
  }
`

export const ME = gql`
query {
  me {
    username
    favoriteGenre
  }
}
`
export const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`