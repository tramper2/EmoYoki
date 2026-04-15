"""S3 이미지 업로드 유틸리티"""

import uuid

import boto3
from botocore.exceptions import ClientError

from app.core.config import get_settings

settings = get_settings()

s3_client = boto3.client(
    "s3",
    region_name=settings.AWS_REGION,
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
)


def generate_presigned_url(filename: str, content_type: str) -> str:
    """S3 presigned URL 생성 (클라이언트 직접 업로드용)"""
    key = f"uploads/{uuid.uuid4()}/{filename}"

    try:
        url = s3_client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": settings.AWS_S3_BUCKET,
                "Key": key,
                "ContentType": content_type,
            },
            ExpiresIn=3600,  # 1시간
        )
        return url
    except ClientError as e:
        print(f"S3 presigned URL 생성 실패: {e}")
        raise


def get_public_url(key: str) -> str:
    """S3 공개 URL 반환"""
    return f"https://{settings.AWS_S3_BUCKET}.s3.{settings.AWS_REGION}.amazonaws.com/{key}"
