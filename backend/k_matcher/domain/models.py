from sqlmodel import Field, SQLModel


class QuestionCategory(SQLModel, table=True):
    __tablename__: str = "question_category"
    id: int | None = Field(default=None, primary_key=True)
    name: str
    description: str | None = None


class Question(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    text: str
    category_id: int = Field(foreign_key="question_category.id")
