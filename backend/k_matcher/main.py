from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from sqlmodel import Session, column, select

from k_matcher.database import create_db_and_tables, get_session
from k_matcher.domain.models import Question, QuestionCategory


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(lifespan=lifespan)


@app.get("/questions", response_model=list[Question])
async def get_questions(*, category_id: int | None = None, session: Session = Depends(get_session)):
    query = select(Question)
    if category_id:
        query = query.where(column('category_id') == category_id)
    return session.exec(query).all()


@app.get("/question_categories", response_model=list[QuestionCategory])
async def get_question_categories(*, session: Session = Depends(get_session)):
    return session.exec(select(QuestionCategory)).all()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
