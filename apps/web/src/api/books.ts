import api from './index'

export interface Book {
  id: number
  title: string
  author: string
  description: string | null
  cover_url: string | null
  created_at: string
  updated_at: string
}

export interface BookCreate {
  title: string
  author: string
  description?: string
  cover_url?: string
}

export async function getBooks(skip = 0, limit = 20) {
  const { data } = await api.get<Book[]>('/books', { params: { skip, limit } })
  return data
}

export async function getBook(id: number) {
  const { data } = await api.get<Book>(`/books/${id}`)
  return data
}

export async function createBook(book: BookCreate) {
  const { data } = await api.post<Book>('/books', book)
  return data
}

export async function deleteBook(id: number) {
  await api.delete(`/books/${id}`)
}