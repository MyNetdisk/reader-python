from datetime import datetime

from sqlalchemy import String, Text, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Book(Base):
    __tablename__ = "books"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False, comment="书名")
    author: Mapped[str] = mapped_column(String(255), nullable=False, comment="作者")
    description: Mapped[str | None] = mapped_column(Text, nullable=True, comment="简介")
    cover_url: Mapped[str | None] = mapped_column(String(500), nullable=True, comment="封面地址")
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), comment="创建时间"
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), comment="更新时间"
    )