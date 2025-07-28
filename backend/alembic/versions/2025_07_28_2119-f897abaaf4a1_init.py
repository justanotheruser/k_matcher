"""Init

Revision ID: f897abaaf4a1
Revises: 
Create Date: 2025-07-28 21:19:17.836916

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision: str = 'f897abaaf4a1'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'question_category',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column(
            'description', sqlmodel.sql.sqltypes.AutoString(), nullable=True
        ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_table(
        'result',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column(
            'created_at',
            sa.DateTime(),
            server_default=sa.text('(CURRENT_TIMESTAMP)'),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_table(
        'question',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('text', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('category_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ['category_id'],
            ['question_category.id'],
        ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_table(
        'answer',
        sa.Column('result_id', sa.Uuid(), nullable=False),
        sa.Column('question_id', sa.Integer(), nullable=False),
        sa.Column('answer', sa.Integer(), nullable=False),
        sa.Column('if_forced', sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(
            ['question_id'],
            ['question.id'],
        ),
        sa.ForeignKeyConstraint(
            ['result_id'], ['result.id'], ondelete='CASCADE'
        ),
        sa.PrimaryKeyConstraint('result_id', 'question_id'),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('answer')
    op.drop_table('question')
    op.drop_table('result')
    op.drop_table('question_category')
