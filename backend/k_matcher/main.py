import datetime
import uuid
from contextlib import asynccontextmanager

import pydantic_core
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, column, select

from k_matcher.config import config
from k_matcher.database import create_db_and_tables, engine, get_session
from k_matcher.domain.question_result import MatchList, get_match
from k_matcher.models.models import (
    Answer,
    Question,
    QuestionCategory,
    Result,
    ResultCreate,
    ResultPublic,
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


@app.post("/results")
async def post_results(
    *, request: ResultCreate, session: Session = Depends(get_session)
) -> ResultPublic:
    if request.partner_id:
        partner_result = session.get(Result, uuid.UUID(request.partner_id))
        if not partner_result:
            raise HTTPException(status_code=404, detail="Result not found")
        return match_results(session, request, partner_result)

    return create_result(session, request)


@app.get("/results/{result_id}")
async def get_results(
    result_id: uuid.UUID, session: Session = Depends(get_session)
) -> ResultPublic:
    result = session.get(Result, result_id)
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    if result.matching_result:
        match_list = MatchList.model_validate(pydantic_core.from_json(result.matching_result))
    else:
        match_list = None
    return ResultPublic(id=str(result_id), matching_result=match_list)


def match_results(session: Session, result: ResultCreate, partner_result: Result) -> ResultPublic:
    question_ids = set(answer.question_id for answer in result.answers)
    partner_question_ids = set(answer.question_id for answer in partner_result.answers)
    if question_ids != partner_question_ids:
        raise HTTPException(status_code=400, detail="Question IDs do not match")

    match = get_match(partner_result.answers, result.answers, question_ids)
    partner_result.matching_result = match.model_dump_json()
    session.add(partner_result)
    session.commit()
    session.refresh(partner_result)
    return ResultPublic(id=str(partner_result.id), matching_result=match)


def create_result(session: Session, request: ResultCreate) -> ResultPublic:
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
        return ResultPublic(id=str(result.id))
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
