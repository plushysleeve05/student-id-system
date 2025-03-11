"""
Migration script to add cache statistics columns to the settings table.
"""

from sqlalchemy import create_engine, Float, Integer
from alembic import op
import sqlalchemy as sa
from backend.db_config import SQLALCHEMY_DATABASE_URL

def upgrade():
    """Add cache statistics columns"""
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    
    # Add cache_size_mb column
    op.add_column('settings', sa.Column('cache_size_mb', Float, nullable=True, server_default='0'))
    
    # Add cache_file_count column
    op.add_column('settings', sa.Column('cache_file_count', Integer, nullable=True, server_default='0'))
    
    # Set default values for existing rows
    with engine.connect() as connection:
        connection.execute(
            sa.text(
                "UPDATE settings SET cache_size_mb = 0, cache_file_count = 0 WHERE cache_size_mb IS NULL"
            )
        )
    
    # Make columns non-nullable after setting defaults
    op.alter_column('settings', 'cache_size_mb', nullable=False)
    op.alter_column('settings', 'cache_file_count', nullable=False)

def downgrade():
    """Remove cache statistics columns"""
    op.drop_column('settings', 'cache_size_mb')
    op.drop_column('settings', 'cache_file_count')

if __name__ == "__main__":
    upgrade()
