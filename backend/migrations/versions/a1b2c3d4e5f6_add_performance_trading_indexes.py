"""add_performance_trading_indexes

Revision ID: a1b2c3d4e5f6
Revises: f7547e6a8210
Create Date: 2026-05-02 19:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '4af83e598bb1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add indexes for Trade table (Buyer/Seller history)
    op.create_index(op.f('ix_trades_buyer_id'), 'trades', ['buyer_id'], unique=False)
    op.create_index(op.f('ix_trades_seller_id'), 'trades', ['seller_id'], unique=False)
    
    # Add index for Order table (Time-sorting)
    op.create_index(op.f('ix_orders_created_at'), 'orders', ['created_at'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_orders_created_at'), table_name='orders')
    op.drop_index(op.f('ix_trades_seller_id'), table_name='trades')
    op.drop_index(op.f('ix_trades_buyer_id'), table_name='trades')
