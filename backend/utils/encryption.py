from cryptography.fernet import Fernet
from config import settings

cipher_suite = Fernet(settings.ENCRYPTION_KEY.encode())


def encrypt_password(password: str) -> str:
    encrypted = cipher_suite.encrypt(password.encode())
    return encrypted.decode()


def decrypt_password(encrypted_password: str) -> str:
    decrypted = cipher_suite.decrypt(encrypted_password.encode())
    return decrypted.decode()
