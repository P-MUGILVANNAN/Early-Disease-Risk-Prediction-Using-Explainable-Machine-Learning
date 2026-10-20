from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

connect_args = {}
engine_kwargs = {"echo": False}

if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    engine_kwargs["connect_args"] = connect_args
else:
    # MySQL / MariaDB connection settings
    engine_kwargs["pool_pre_ping"] = True
    engine_kwargs["pool_recycle"] = 3600

engine = create_engine(settings.DATABASE_URL, **engine_kwargs)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    # If using MySQL, ensure database exists first
    if settings.DATABASE_URL.startswith("mysql"):
        try:
            import pymysql
            from urllib.parse import urlparse
            parsed = urlparse(settings.DATABASE_URL)
            db_name = parsed.path.lstrip("/")
            port = parsed.port or 3306
            conn = pymysql.connect(
                host=parsed.hostname or "localhost",
                user=parsed.username or "root",
                password=parsed.password or "",
                port=port
            )
            with conn.cursor() as cur:
                cur.execute(f"CREATE DATABASE IF NOT EXISTS `{db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
            conn.close()
        except Exception as e:
            # Continue if already exists or permission denied
            pass

    from app.database import models  # noqa: F401
    Base.metadata.create_all(bind=engine)
