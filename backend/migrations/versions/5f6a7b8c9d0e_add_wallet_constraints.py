"""Add non-negative wallet constraints

Revision ID: 5f6a7b8c9d0e
Revises: 885a4e83af6c
Create Date: 2026-04-25 22:05:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '5f6a7b8c9d0e'
down_revision: Union[str, Sequence[str], None] = '885a4e83af6c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Users table: investor wallet
    op.create_check_constraint(
        constraint_name='ck_users_wallet_balance_non_negative',
        table_name='users',
        condition='wallet_balance >= 0'
    )

    # Builders table: business wallet
    op.create_check_constraint(
        constraint_name='ck_builders_wallet_balance_non_negative',
        table_name='builders',
        condition='wallet_balance >= 0'
    )


def downgrade() -> None:
    op.drop_constraint(
        constraint_name='ck_builders_wallet_balance_non_negative',
        table_name='builders',
        type_='check'
    )
    op.drop_constraint(
        constraint_name='ck_users_wallet_balance_non_negative',
        table_name='users',
        type_='check'
    )
