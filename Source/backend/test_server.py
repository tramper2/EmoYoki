#!/usr/bin/env python3
"""테스트용 간단 API 서버"""

import json
import uuid
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import sqlite3
import os

# 데이터베이스 초기화
DB_PATH = "/tmp/emo_test.db"


def init_db():
    """테스트 데이터베이스 초기화"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 사용자 테이블
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            phone TEXT UNIQUE,
            name TEXT,
            role TEXT,
            tier TEXT,
            rating REAL DEFAULT 5.0,
            review_count INTEGER DEFAULT 0,
            completed_tasks INTEGER DEFAULT 0,
            is_verified BOOLEAN DEFAULT 1,
            status TEXT DEFAULT 'ACTIVE',
            created_at TEXT
        )
    """)

    # 업무 테이블
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            requester_id TEXT,
            helper_id TEXT,
            category TEXT,
            status TEXT DEFAULT 'WAITING',
            title TEXT,
            description TEXT,
            lat REAL,
            lng REAL,
            address TEXT,
            scheduled_at TEXT,
            duration_minutes INTEGER,
            amount INTEGER,
            is_deposit_paid BOOLEAN DEFAULT 1,
            created_at TEXT
        )
    """)

    # 지원서 테이블
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS applications (
            id TEXT PRIMARY KEY,
            task_id TEXT,
            helper_id TEXT,
            status TEXT DEFAULT 'PENDING',
            message TEXT,
            created_at TEXT,
            FOREIGN KEY (task_id) REFERENCES tasks(id),
            FOREIGN KEY (helper_id) REFERENCES users(id)
        )
    """)

    conn.commit()
    conn.close()


def seed_test_data():
    """테스트 데이터 생성"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 이미 데이터가 있으면 건너뜀
    cursor.execute("SELECT COUNT(*) FROM users WHERE phone = '01000000001'")
    if cursor.fetchone()[0] > 0:
        conn.close()
        return

    # 구인자
    cursor.execute("""
        INSERT INTO users (id, phone, name, role, rating, review_count, completed_tasks, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (str(uuid.uuid4()), "01000000001", "김구인", "USER", 4.8, 15, 12, datetime.now().isoformat()))

    # 이모님들
    helpers = [
        ("01000000201", "이이모", "PREMIUM", 4.9),
        ("01000000301", "박이모", "PREMIUM", 4.8),
        ("01000000401", "최이모", "NORMAL", 4.7),
        ("01000000501", "정이모", "NORMAL", 4.6),
        ("01000000601", "강이모", "NORMAL", 4.5),
    ]

    for phone, name, tier, rating in helpers:
        cursor.execute("""
            INSERT INTO users (id, phone, name, role, tier, rating, review_count, completed_tasks, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (str(uuid.uuid4()), phone, name, "HELPER", tier, rating, 10 + int(rating * 2), 8, datetime.now().isoformat()))

    # 업무들
    categories = ["HOSPITAL", "DOG_WALK", "CLEANING", "SHOPPING", "CAREGIVING", "ETC"]
    titles = [
        "어머니 병원 동행 도와주세요",
        "강아지 산책 30분 부탁드려요",
        "이사 청소 도와주세요",
        "마트 심부름 부탁드립니다",
        "요양원 모시고 다녀오실 분",
    ]

    requester_id = cursor.execute("SELECT id FROM users WHERE phone = '01000000001'").fetchone()[0]

    for i in range(10):
        scheduled_at = datetime.fromtimestamp(i * 3600 + datetime.now().timestamp()).isoformat()
        cursor.execute("""
            INSERT INTO tasks (id, requester_id, category, status, title, description,
                           lat, lng, address, scheduled_at, duration_minutes, amount, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            str(uuid.uuid4()),
            requester_id,
            categories[i % 5],
            "WAITING",
            titles[i % 5],
            f"{i + 1}번째 테스트 업무입니다.",
            37.51 + i * 0.001,
            127.02 + i * 0.001,
            f"서울시 강남구 역삼동 {i + 1}번지",
            scheduled_at,
            [30, 60, 90, 120][i % 4],
            10000 + i * 5000,
            datetime.now().isoformat()
        ))

    conn.commit()
    conn.close()


class TestAPIHandler(BaseHTTPRequestHandler):
    """테스트 API 핸들러"""

    def _set_headers(self, status=200, content_type="application/json"):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers()

    def _send_json(self, data):
        self._set_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode("utf-8"))

    def _read_json(self):
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length > 0:
            return json.loads(self.rfile.read(content_length))
        return {}

    def do_GET(self):
        path = urlparse(self.path).path

        # 헬스 체크
        if path == "/health":
            self._send_json({"status": "healthy", "service": "이모~여기!"})
            return

        # 테스트 계정 목록
        if path == "/api/test/accounts":
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("SELECT phone, name, role, tier FROM users")
            users = [
                {"phone": row[0], "name": row[1], "role": row[2], "tier": row[3], "password": "test1234"}
                for row in cursor.fetchall()
            ]
            conn.close()
            self._send_json({"accounts": users})
            return

        # 로그인 (GET으로 토큰 발급하는 테스트용)
        if path == "/api/test/login":
            params = parse_qs(urlparse(self.path).query)
            phone = params.get("phone", ["01000000001"])[0]

            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE phone = ?", (phone,))
            user = cursor.fetchone()
            conn.close()

            if user:
                import hashlib
                token_data = f"{{'sub': '{user[0]}', 'role': '{user[3]}', 'phone': '{user[1]}'}}"
                access_token = hashlib.sha256(token_data.encode()).hexdigest()

                self._send_json({
                    "access_token": f"test_token_{access_token[:16]}",
                    "user": {
                        "id": user[0],
                        "phone": user[1],
                        "name": user[2],
                        "role": user[3],
                        "tier": user[4],
                        "rating": user[5],
                        "review_count": user[6],
                        "completed_tasks": user[7],
                    }
                })
            else:
                self._set_headers(404)
                self.wfile.write(b"User not found")

        # 업무 목록
        elif path == "/api/tasks":
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("""
                SELECT t.id, t.title, t.category, t.status, t.amount, t.duration_minutes,
                       t.scheduled_at, t.address, t.description, u.name as requester_name, u.rating as requester_rating
                FROM tasks t
                LEFT JOIN users u ON t.requester_id = u.id
                WHERE t.status = 'WAITING'
                ORDER BY t.created_at DESC
            """)
            tasks = [
                {
                    "id": row[0],
                    "title": row[1],
                    "category": row[2],
                    "status": row[3],
                    "amount": row[4],
                    "duration_minutes": row[5],
                    "scheduled_at": row[6],
                    "address": row[7],
                    "content": row[8],
                    "requester_name": row[9],
                    "requester_rating": row[10],
                    "lat": 37.51,
                    "lng": 127.02,
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat(),
                }
                for row in cursor.fetchall()
            ]
            conn.close()
            self._send_json({"tasks": tasks, "total": len(tasks), "page": 1, "page_size": 20})

        # 특정 업무의 지원자 목록
        elif path.startswith("/api/tasks/") and path.endswith("/applications"):
            task_id = path.split("/")[3]
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("""
                SELECT a.id, a.task_id, a.helper_id, a.status, a.message, a.created_at,
                       u.name, u.tier, u.rating, u.review_count, u.completed_tasks
                FROM applications a
                JOIN users u ON a.helper_id = u.id
                WHERE a.task_id = ?
                ORDER BY
                    CASE a.status
                        WHEN 'PENDING' THEN 1
                        WHEN 'ACCEPTED' THEN 2
                        WHEN 'REJECTED' THEN 3
                        ELSE 4
                    END,
                    u.rating DESC,
                    a.created_at ASC
            """, (task_id,))

            applications = [
                {
                    "id": row[0],
                    "task_id": row[1],
                    "helper_id": row[2],
                    "status": row[3],
                    "message": row[4],
                    "created_at": row[5],
                    "helper": {
                        "name": row[6],
                        "tier": row[7],
                        "rating": row[8],
                        "review_count": row[9],
                        "completed_tasks": row[10],
                    }
                }
                for row in cursor.fetchall()
            ]
            conn.close()
            self._send_json({"applications": applications, "total": len(applications)})

        # 현재 사용자
        elif path == "/api/auth/me":
            # 테스트용: 항상 첫 번째 사용자 반환
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users LIMIT 1")
            user = cursor.fetchone()
            conn.close()

            if user:
                self._send_json({
                    "id": user[0],
                    "phone": user[1],
                    "name": user[2],
                    "role": user[3],
                    "tier": user[4],
                    "rating": user[5],
                    "review_count": user[6],
                    "completed_tasks": user[7],
                    "is_verified": user[8],
                    "status": user[9],
                    "created_at": user[10],
                })
            else:
                self._set_headers(401)
                self.wfile.write(b"Unauthorized")

        else:
            self._set_headers(404)
            self.wfile.write(b"Not Found")

    def do_POST(self):
        path = urlparse(self.path).path

        # 테스트 데이터 생성
        if path == "/api/test/seed-data":
            try:
                seed_test_data()
                self._send_json({
                    "message": "테스트 데이터가 생성되었습니다",
                    "users": {
                        "requester": {"phone": "01000000001", "password": "test1234", "name": "김구인"},
                        "helpers": [
                            {"phone": "01000000201", "password": "test1234", "name": "이이모", "tier": "PREMIUM"},
                            {"phone": "01000000401", "password": "test1234", "name": "최이모", "tier": "NORMAL"},
                        ]
                    }
                })
            except Exception as e:
                self._set_headers(500)
                self.wfile.write(str(e).encode())

        # 회원가입
        elif path == "/api/auth/register":
            data = self._read_json()
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()

            try:
                user_id = str(uuid.uuid4())
                cursor.execute("""
                    INSERT INTO users (id, phone, name, role, tier, rating, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (user_id, data["phone"], data["name"], data["role"],
                     data.get("tier"), 5.0, datetime.now().isoformat()))
                conn.commit()

                self._send_json({
                    "id": user_id,
                    "phone": data["phone"],
                    "name": data["name"],
                    "role": data["role"],
                    "rating": 5.0,
                    "review_count": 0,
                    "completed_tasks": 0,
                })
            except Exception as e:
                self._set_headers(400)
                self.wfile.write(str(e).encode())
            finally:
                conn.close()

        # 로그인
        elif path == "/api/auth/login":
            data = self._read_json()
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE phone = ?", (data["phone"],))
            user = cursor.fetchone()
            conn.close()

            if user:
                import hashlib
                token_data = f"{{'sub': '{user[0]}', 'role': '{user[3]}', 'phone': '{user[1]}'}}"
                access_token = f"test_token_{hashlib.sha256(token_data.encode()).hexdigest()[:32]}"

                self._send_json({
                    "access_token": access_token,
                    "refresh_token": access_token,
                    "token_type": "bearer"
                })
            else:
                self._set_headers(401)
                self.wfile.write(b"Invalid credentials")

        # 업무 등록
        elif path == "/api/tasks":
            data = self._read_json()
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()

            try:
                task_id = str(uuid.uuid4())
                # 토큰에서 사용자 정보 추출 (간단히)
                user_id = "user-001"  # 테스트용

                cursor.execute("""
                    INSERT INTO tasks (id, requester_id, category, status, title, description,
                           lat, lng, address, scheduled_at, duration_minutes, amount, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    task_id,
                    user_id,
                    data["category"],
                    "WAITING",
                    data["title"],
                    data.get("content", data.get("description", "")),
                    37.51,
                    127.02,
                    data["address"],
                    data["scheduled_at"],
                    data["duration_minutes"],
                    data["amount"],
                    datetime.now().isoformat()
                ))
                conn.commit()

                self._send_json({
                    "id": task_id,
                    "title": data["title"],
                    "category": data["category"],
                    "amount": data["amount"],
                    "status": "WAITING"
                })
            except Exception as e:
                self._set_headers(400)
                self.wfile.write(str(e).encode())
            finally:
                conn.close()

        # 업무 지원
        elif path.startswith("/api/tasks/") and path.endswith("/apply"):
            task_id = path.split("/")[3]
            data = self._read_json()

            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()

            try:
                # 업무 존재 확인
                cursor.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
                task = cursor.fetchone()

                if not task:
                    self._set_headers(404)
                    self.wfile.write(b"Task not found")
                    return

                # 지원 생성
                application_id = str(uuid.uuid4())
                # 테스트용: 첫 번째 HELPER 사용 (실제로는 토큰에서 가져와야 함)
                cursor.execute("SELECT id FROM users WHERE role = 'HELPER' LIMIT 1")
                helper_result = cursor.fetchone()
                helper_id = helper_result[0] if helper_result else "default-helper"

                cursor.execute("""
                    INSERT INTO applications (id, task_id, helper_id, status, message, created_at)
                    VALUES (?, ?, ?, 'PENDING', ?, ?)
                """, (application_id, task_id, helper_id, data.get("message", ""), datetime.now().isoformat()))
                conn.commit()

                self._send_json({
                    "id": application_id,
                    "task_id": task_id,
                    "helper_id": helper_id,
                    "status": "PENDING",
                    "message": data.get("message", ""),
                    "created_at": datetime.now().isoformat()
                })
            except Exception as e:
                self._set_headers(400)
                self.wfile.write(str(e).encode())
            finally:
                conn.close()

        else:
            self._set_headers(404)
            self.wfile.write(b"Not Found")

    def do_PATCH(self):
        """PATCH 요청 처리 (지원 상태 변경 등)"""
        path = urlparse(self.path).path
        data = self._read_json()

        # 지원 상태 변경 (승인/거절)
        if path.startswith("/api/applications/") and path.endswith("/status"):
            application_id = path.split("/")[3]
            new_status = data.get("status")  # ACCEPTED or REJECTED

            if new_status not in ["ACCEPTED", "REJECTED", "CANCELLED"]:
                self._set_headers(400)
                self.wfile.write(b"Invalid status")
                return

            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()

            try:
                # 지원서 존재 확인 및 상태 변경
                cursor.execute("""
                    UPDATE applications
                    SET status = ?
                    WHERE id = ?
                """, (new_status, application_id))
                conn.commit()

                if cursor.rowcount == 0:
                    self._set_headers(404)
                    self.wfile.write(b"Application not found")
                    return

                # 승인된 경우 업무 상태도 변경
                if new_status == "ACCEPTED":
                    cursor.execute("SELECT task_id, helper_id FROM applications WHERE id = ?", (application_id,))
                    app = cursor.fetchone()
                    if app:
                        cursor.execute("UPDATE tasks SET helper_id = ?, status = 'ASSIGNED' WHERE id = ?", (app[1], app[0]))
                        conn.commit()

                self._send_json({
                    "id": application_id,
                    "status": new_status,
                    "updated_at": datetime.now().isoformat()
                })
            except Exception as e:
                self._set_headers(400)
                self.wfile.write(str(e).encode())
            finally:
                conn.close()

        else:
            self._set_headers(404)
            self.wfile.write(b"Not Found")

    def log_message(self, format, *args):
        return  # 로그 출력 억제


def run_server(port=8000):
    """서버 실행"""
    init_db()

    # 초기 데이터 생성
    try:
        seed_test_data()
        print("✅ 테스트 데이터 생성 완료")
    except Exception as e:
        print(f"⚠️ 테스트 데이터 생성 실패: {e}")

    server = HTTPServer(("0.0.0.0", port), TestAPIHandler)
    print(f"🚀 테스트 API 서버 실행 중: http://localhost:{port}")
    print("📋 사용 가능한 엔드포인트:")
    print("   - GET  /health")
    print("   - GET  /api/test/accounts")
    print("   - GET  /api/test/login?phone=01000000001")
    print("   - POST /api/test/seed-data")
    print("   - GET  /api/tasks")
    print("   - GET  /api/auth/me")
    print("   - POST /api/auth/login")
    print("")
    print("🧪 테스트 계정:")
    print("   - 구인자: 01000000001 / test1234")
    print("   - 이모님(프리미엄): 01000000201 / test1234")
    print("   - 이모님(일반): 01000000401 / test1234")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 서버 종료")
        server.shutdown()


if __name__ == "__main__":
    run_server()
