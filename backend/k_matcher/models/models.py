import datetime
import uuid
from typing import ClassVar

from pydantic import BaseModel
from sqlmodel import Column, Field, PrimaryKeyConstraint, Relationship, SQLModel, text

from k_matcher.domain.answer import AnswerEnum
from k_matcher.models.helpers import IntEnum


class QuestionCategory(SQLModel, table=True):
    __tablename__: ClassVar[str] = "question_category"  # type: ignore
    id: int | None = Field(default=None, primary_key=True)
    name: str
    description: str | None = None


class Question(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    text: str
    category_id: int = Field(foreign_key="question_category.id", ondelete="CASCADE")


class Result(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime.datetime = Field(
        sa_column_kwargs={"server_default": text("CURRENT_TIMESTAMP")}
    )
    # answers: list["Answer"] = Relationship(back_populates="result", cascade_delete=True)


class Answer(SQLModel, table=True):
    __table_args__ = (PrimaryKeyConstraint('result_id', 'question_id'),)
    result_id: uuid.UUID = Field(foreign_key="result.id", ondelete="CASCADE")
    question_id: int = Field(foreign_key="question.id")
    answer: AnswerEnum = Field(
        sa_column=Column(name="answer", nullable=False, type_=IntEnum(AnswerEnum))
    )
    if_forced: bool = Field(default=False, nullable=False)


class AnswerCreate(BaseModel):
    question_id: int
    answer: AnswerEnum
    if_forced: bool = False


class ResultCreate(BaseModel):
    answers: list[AnswerCreate]
