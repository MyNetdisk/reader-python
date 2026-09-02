from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.book import Book
from app.schemas.book import BookCreate, BookUpdate


async def get_books(db: AsyncSession, skip: int = 0, limit: int = 20):
    result = await db.execute(select(Book).offset(skip).limit(limit))
    return result.scalars().all()


async def get_book(db: AsyncSession, book_id: int):
    return await db.get(Book, book_id)


async def create_book(db: AsyncSession, book_data: BookCreate):
    book = Book(**book_data.model_dump())
    db.add(book)
    await db.flush()
    await db.refresh(book)
    return book


async def update_book(db: AsyncSession, book_id: int, book_data: BookUpdate):
    book = await db.get(Book, book_id)
    if not book:
        return None
    update_data = book_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(book, key, value)
    await db.flush()
    await db.refresh(book)
    return book


async def delete_book(db: AsyncSession, book_id: int):
    book = await db.get(Book, book_id)
    if not book:
        return False
    await db.delete(book)
    await db.flush()
    return True