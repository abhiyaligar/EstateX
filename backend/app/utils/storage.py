import boto3
from botocore.exceptions import ClientError
from app.core.config import settings
import uuid
import logging

logger = logging.getLogger(__name__)

from botocore.client import Config

def get_s3_client():
    return boto3.client(
        's3',
        endpoint_url=settings.S3_ENDPOINT,
        aws_access_key_id=settings.S3_ACCESS_KEY,
        aws_secret_access_key=settings.S3_SECRET_KEY,
        region_name=settings.S3_REGION,
        config=Config(s3={'addressing_style': 'path'}, signature_version='s3v4')
    )

async def upload_file_to_s3(file_content, filename: str, content_type: str) -> str:
    """
    Uploads a file to Supabase S3 bucket and returns the public URL.
    """
    s3_client = get_s3_client()
    
    # Generate a unique filename to prevent collisions
    unique_filename = f"{uuid.uuid4()}-{filename}"
    file_key = f"projects/images/{unique_filename}"
    
    try:
        s3_client.put_object(
            Bucket=settings.S3_BUCKET,
            Key=file_key,
            Body=file_content,
            ContentType=content_type
        )
        
        # Construct the public URL
        # Supabase S3 endpoint is typically https://<project-ref>.storage.supabase.co/storage/v1/s3
        # The public URL for accessed objects is usually:
        # https://<project-ref>.supabase.co/storage/v1/object/public/<bucket>/<key>
        
        project_ref = settings.SUPABASE_URL.split("//")[1].split(".")[0]
        public_url = f"https://{project_ref}.supabase.co/storage/v1/object/public/{settings.S3_BUCKET}/{file_key}"
        
        return public_url
        
    except ClientError as e:
        error_code = e.response.get("Error", {}).get("Code", "")
        if error_code == "NoSuchBucket":
            logger.info(f"Bucket {settings.S3_BUCKET} not found. Creating it now...")
            try:
                s3_client.create_bucket(Bucket=settings.S3_BUCKET)
                s3_client.put_object(
                    Bucket=settings.S3_BUCKET,
                    Key=file_key,
                    Body=file_content,
                    ContentType=content_type
                )
                project_ref = settings.SUPABASE_URL.split("//")[1].split(".")[0]
                public_url = f"https://{project_ref}.supabase.co/storage/v1/object/public/{settings.S3_BUCKET}/{file_key}"
                return public_url
            except Exception as create_e:
                logger.error(f"Failed to create bucket and retry upload: {create_e}")
                raise Exception(f"Failed to upload image to storage: {str(create_e)}")
        else:
            logger.error(f"S3 upload failed: {e}")
            raise Exception(f"Failed to upload image to storage: {str(e)}")
