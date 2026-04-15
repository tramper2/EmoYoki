"""SMS 발송 유틸리티"""

import httpx

from app.core.config import get_settings

settings = get_settings()


async def send_verification_code(phone: str, code: str) -> bool:
    """인증 코드 SMS 발송"""
    # TODO: 실제 SMS 서비스 연동 (Naver Cloud SENS, Alibaba Cloud, etc.)
    # 개발 환경에서는 콘솔에 출력만

    print(f"📱 SMS 발송: {phone} -> 인증 코드: {code}")

    # 예시: NCP SENS 사용 시
    # async with httpx.AsyncClient() as client:
    #     response = await client.post(
    #         "https://sens.apigw.ntruss.com/sms/v2/services/",
    #         headers={
    #             "Content-Type": "application/json",
    #             "x-ncp-apigw-timestamp": str(timestamp),
    #             "x-ncp-iam-access-key": settings.AWS_ACCESS_KEY_ID,
    #             "x-ncp-apigw-signature-v2": signature,
    #         },
    #         json={
    #             "type": "SMS",
    #             "contentType": "COMM",
    #             "from": settings.SMS_SENDER,
    #             "content": f"[이모~여기!] 인증 코드: {code}",
    #             "messages": [{"to": phone}],
    #         },
    #     )
    #     return response.status_code == 202

    return True


async def send_push_notification(user_id: str, title: str, message: str, data: dict | None = None) -> bool:
    """푸시 알림 발송 (FCM/APNs)"""
    # TODO: FCM 또는 APNs 연동
    print(f"🔔 Push: {user_id} - {title}: {message}")
    return True
