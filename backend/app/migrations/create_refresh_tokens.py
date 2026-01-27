"""
Database migration script to create refresh_tokens table.
Run this script after updating the models to add the refresh_tokens table.
"""

from sqlalchemy import create_engine, text
from app.core.config import settings

def run_migration():
    """Create refresh_tokens table"""
    engine = create_engine(settings.DATABASE_URL)
    
    # SQL to create refresh_tokens table
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS refresh_tokens (
        id SERIAL PRIMARY KEY,
        token VARCHAR(255) UNIQUE NOT NULL,
        user_id INTEGER NOT NULL,
        user_type VARCHAR(50) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        is_revoked BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id, user_type);
    """
    
    with engine.connect() as conn:
        conn.execute(text(create_table_sql))
        conn.commit()
        print("✅ refresh_tokens table created successfully")

if __name__ == "__main__":
    run_migration()
