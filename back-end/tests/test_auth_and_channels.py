from main import validate_registration_payload, validate_login_payload, hash_password, verify_password, create_channel
import sys
import unittest
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))


class AuthAndChannelTests(unittest.TestCase):
    def test_registration_validation_rejects_invalid_username(self):
        payload = {
            'username': 'bad name',
            'email': 'user@example.com',
            'password': 'StrongPass1!',
            'phone': '+251911234567',
        }
        is_valid, errors = validate_registration_payload(payload)
        self.assertFalse(is_valid)
        self.assertTrue(any('username' in error.lower() for error in errors))

    def test_registration_validation_rejects_weak_password(self):
        payload = {
            'username': 'user123',
            'email': 'user@example.com',
            'password': 'weak',
            'phone': '+251911234567',
        }
        is_valid, errors = validate_registration_payload(payload)
        self.assertFalse(is_valid)
        self.assertTrue(any('password' in error.lower() for error in errors))

    def test_password_hashing_and_verification(self):
        hashed = hash_password('StrongPass1!')
        self.assertTrue(verify_password('StrongPass1!', hashed))
        self.assertFalse(verify_password('WrongPass1!', hashed))

    def test_create_channel_returns_normalized_name(self):
        channel = create_channel('My New Channel', 'alice')
        self.assertEqual(channel['name'], 'my-new-channel')
        self.assertEqual(channel['created_by'], 'alice')


if __name__ == '__main__':
    unittest.main()
