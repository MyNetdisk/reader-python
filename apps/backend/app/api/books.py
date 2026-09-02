from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.book import BookCreate, BookUpdate, BookResponse
from app.services import book_service

router = APIRouter()


@router.get("/", response_model=list[BookResponse])
async def list_books(skip: int = 0, limit: int = 20, db: AsyncSession = Depends(get_db)):
    return await book_service.get_books(db, skip=skip, limit=limit)


@router.get("/{book_id}", response_model=BookResponse)
async def get_book(book_id: int, db: AsyncSession = Depends(get_db)):
    book = await book_service.get_book(db, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book


@router.post("/", response_model=BookResponse, status_code=201)
async def create_book(book_data: BookCreate, db: AsyncSession = Depends(get_db)):
    return await book_service.create_book(db, book_data)


@router.put("/{book_id}", response_model=BookResponse)
async def update_book(book_id: int, book_data: BookUpdate, db: AsyncSession = Depends(get_db)):
    book = await book_service.update_book(db, book_id, book_data)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book


@router.delete("/{book_id}", status_code=204)
async def delete_book(book_id: int, db: AsyncSession = Depends(get_db)):
    deleted = await book_service.delete_book(db, book_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Book not found")