import datetime
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, column, select

from k_matcher.config import config
from k_matcher.database import create_db_and_tables, engine, get_session
from k_matcher.models.models import (
    Answer,
    Question,
    QuestionCategory,
    Result,
    ResultCreate,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables(engine)
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


@app.post("/result")
async def post_result(*, request: ResultCreate, session: Session = Depends(get_session)) -> Result:
    try:
        result = Result(created_at=datetime.datetime.now())
        session.add(result)
        session.flush()

        answers = []
        for answer in request.answers:
            answers.append(
                Answer(
                    result_id=result.id,
                    question_id=answer.question_id,
                    answer=answer.answer,
                    if_forced=answer.if_forced,
                )
            )
        session.add_all(answers)
        session.commit()
        return result
    except IntegrityError as e:
        session.rollback()
        if "FOREIGN KEY constraint failed" in str(e):
            raise HTTPException(status_code=400, detail="Foreign key constraint violated")
        raise HTTPException(status_code=500, detail="Database integrity error")


app.add_middleware(
    CORSMiddleware,
    allow_origins=config.http.allow_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
