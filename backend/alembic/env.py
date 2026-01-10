# alembic/env.py
from logging.config import fileConfig
from alembic import context
from app.core.database import engine, Base
from app.models.heritage import WorldHeritage
from app.models.visit import Visit
from app.models.user import User
from app.models.diary import Diary

# Alembic Config
config = context.config

# ログ設定
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# メタデータ（自動生成用）
target_metadata = Base.metadata


def run_migrations_online():
    with engine.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


run_migrations_online()
