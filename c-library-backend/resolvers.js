
const { GraphQLError } = require('graphql')
const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')
const jwt = require('jsonwebtoken')

const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

const resolvers = {
	Query: {
		bookCount: () => async () => Book.collection.countDocuments(),
		authorCount: () =>  async () => Author.collection.countDocuments(),
		allBooks: async (root, args) => {
			let condition = {}
			if (args.author) {
				const author = await Author.find({ name: args.author } )
				if (author) {
					condition.author = author._id 
				}
			}
			// console.log('genre', args.genre)
			if (args.genre) {
				condition.genres = args.genre
			}
			const books = await Book.find(condition).populate('author')
			return books
		},
		allAuthors: async () => {
			const authors = await Author.find({})
			if (!authors) return null
		
			const allAuthorsWithBookCount = [];
			for (const author of authors) {
				const authorBooks = await Book.find({ author: author._id })
				const bookCount = authorBooks.length
				allAuthorsWithBookCount.push({
					name: author.name,
					id: author._id,
					born: author.born,
					bookCount
				});
			}
			return allAuthorsWithBookCount;
		},
		allGenres: async (root, args) => {
			const books = await Book.find({})
			const genres = []
			
			books.forEach(element => {
				element.genres.forEach(genre => {
					if (!genres.includes(genre)) {
						console.log(genre)
						genres.push(genre)
					}
				})
			})
			return genres
		},
		me: (root, args, context) => {
			console.log(context)
			return context.currentUser
		}
	},
	Mutation: {
		addBook: async (root, args, context) => {
			const currentUser = context.currentUser

			if (!currentUser) {
				throw new GraphQLError('not authenticated', {
					extensions: {
						code: 'BAD_USER_INPUT',
					}
				})
			}
			if (args.title.length < 5) {
				throw new GraphQLError('Saving book failed, title too short', {
					extensions: {
						code: 'BAD_USER_INPUT',
						invalidArgs: args.title
					}
				})
			}
			if (args.author.length < 4) {
				throw new GraphQLError('Saving book failed, author too short', {
					extensions: {
						code: 'BAD_USER_INPUT',
						invalidArgs: args.author
					}
				})
			}
			try {
				const author = await Author.findOne({ name: args.author });
				let authorId;
				if (!author) {
					const newAuthor = new Author({
						name: args.author
					});
					await newAuthor.save();
					authorId = newAuthor.id;
				} else {
					authorId = author.id;
				}
				const book = new Book({ ...args, author: authorId })
				await book.save()
				await book.populate('author')

				pubsub.publish('BOOK_ADDED', {bookAdded: book})
				return book

			} catch (error) {
				throw new GraphQLError('Saving book failed', {
					extensions: {
						code: 'BAD_USER_INPUT',
						invalidArgs: args.name,
						error
					}
				})
			}
		},
		editAuthor: async (root, args, context) => {
						// const authorToChange = authors.find(a => a.name === args.name)
						// if (authorToChange) {
						// 	const updatedAuthor = {...authorToChange, born: args.setBornTo}
						// 	authors = authors.map(a => {
						// 		if (a.name === args.name) {
						// 			return updatedAuthor
						// 		}
						// 		return a					
						// 	})
						// 	return updatedAuthor
						// }
						// else {
						// 	return null
						// }
			const currentUser = context.currentUser

			if (!currentUser) {
				throw new GraphQLError('not authenticated', {
					extensions: {
						code: 'BAD_USER_INPUT',
					}
				})
			}

			const authorToChange = await Author.findOne( { name: args.name } )
				if (authorToChange) {
					authorToChange.born = args.setBornTo
				try {
					await authorToChange.save()
				} catch (error) {
					throw new GraphQLError('Editing author failed', {
						extensions: {
							code: 'BAD_USER_INPUT',
							invalidArgs: args.name,
							error
						}
					})
				}

				return authorToChange
			}
			else {
					return null
			}
		},
		createUser: async (root, args) => {
			const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre })      
			
			return user.save()
				.catch(error => {
					throw new GraphQLError('Creating the user failed', {
						extensions: {
							code: 'BAD_USER_INPUT',
							invalidArgs: args.username,
							error
						}
					})
				})
		},
		login: async (root, args) => {
			const user = await User.findOne({ username: args.username })
	
			if ( !user || args.password !== 'secret' ) {
				throw new GraphQLError('wrong credentials', {
					extensions: {
						code: 'BAD_USER_INPUT'
					}
				})
			}
	
			const userForToken = {
				username: user.username,
				id: user._id,
			}
	
			return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
		}
	},
	Subscription: {
		bookAdded: {
			subscribe: () => pubsub.asyncIterator('BOOK_ADDED')
		}
	}
}

module.exports = resolvers