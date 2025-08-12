import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine
from sqlmodel.pool import StaticPool

from k_matcher.database import create_db_and_tables, get_session
from k_matcher.main import app
from k_matcher.models.models import Question, QuestionCategory


@pytest.fixture
def engine():
    return create_engine(
        "sqlite:///:memory:",
        echo=True,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )


@pytest.fixture
def session(engine):
    with Session(engine) as session:
        yield session


@pytest.fixture
def test_client(engine):
    create_db_and_tables(engine)
    with Session(engine) as session:

        def get_session_override():
            return session

        app.dependency_overrides[get_session] = get_session_override
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def fill_db_with_questions(session: Session):
    session.bulk_insert_mappings(
        QuestionCategory,  # type: ignore
        [{"id": 1, "name": "category_1"}, {"id": 2, "name": "category_2"}],
    )
    session.bulk_insert_mappings(
        Question,  # type: ignore
        [
            {"id": 1, "text": "text 1", "category_id": 1},
            {"id": 2, "text": "text 2", "category_id": 2},
            {"id": 3, "text": "text 3", "category_id": 2},
            {"id": 4, "text": "text 4", "category_id": 1},
        ],
    )
    session.commit()
