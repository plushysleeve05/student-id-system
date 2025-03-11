import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from dotenv import load_dotenv
import os
from backend.db_config import Base, engine
from backend.models.user_model import User
from backend.models.settings_model import Settings

load_dotenv()

def create_tables():
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully!")
    except Exception as e:
        print(f"An error occurred while creating tables: {e}")

def init_database():
    # Connect to PostgreSQL server
    conn = psycopg2.connect(
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "postgres"),
        host=os.getenv("DB_HOST", "localhost")
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    
    cursor = conn.cursor()
    db_name = os.getenv("DB_NAME", "student_id_system")
    
    try:
        # Check if database exists
        cursor.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{db_name}'")
        exists = cursor.fetchone()
        
        if not exists:
            print(f"Creating database {db_name}...")
            cursor.execute(f'CREATE DATABASE {db_name}')
            print(f"Database {db_name} created successfully!")
        else:
            print(f"Database {db_name} already exists.")
    except Exception as e:
        print(f"An error occurred while creating database: {e}")
        return
    finally:
        cursor.close()
        conn.close()

    # Create tables after database operations are complete
    create_tables()

if __name__ == "__main__":
    init_database()
