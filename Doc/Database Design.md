Database Design (Schema)
users (사용자 테이블)
id: UUID (PK)

role: VARCHAR (USER, HELPER)

base_location: GEOMETRY(POINT, 4326) - 이모님 활동 중심지

preferred_radius: INTEGER (2000, 5000, 10000) - 이모님 설정 반경

rating: FLOAT (기본값 5.0)

tasks (업무 테이블)
id: UUID (PK)

requester_id: UUID (FK)

helper_id: UUID (FK, Nullable)

category: VARCHAR (HOSPITAL, DOG, CLEAN, SHOP)

task_location: GEOMETRY(POINT, 4326) - 업무 발생 위치

status: VARCHAR (WAITING, MATCHED, ONGOING, DONE)