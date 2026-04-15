import asyncio
from app.core.database import engine
from app.models.base import Base
import app.models.user
import app.models.task

async def create_tables():
    print("⏳ Creating tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Tables created successfully!")

if __name__ == "__main__":
    asyncio.run(create_tables())
