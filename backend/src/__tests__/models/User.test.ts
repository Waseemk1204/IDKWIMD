import User from '../../models/User';
import bcrypt from 'bcryptjs';

describe('User Model', () => {
  describe('User Creation', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        fullName: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123',
        role: 'employee'
      };

      const user = new User(userData);
      await user.save();

      expect(user._id).toBeDefined();
      expect(user.fullName).toBe(userData.fullName);
      expect(user.username).toBe(userData.username);
      expect(user.email).toBe(userData.email);
      expect(user.role).toBe(userData.role);
      expect(user.isActive).toBe(true);
      expect(user.isVerified).toBe(false);
    });

    it('should hash password before saving', async () => {
      const userData = {
        fullName: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123',
        role: 'employee'
      };

      const user = new User(userData);
      await user.save();

      expect(user.password).not.toBe(userData.password);
      expect(user.password).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash pattern
    });

    it('should validate required fields', async () => {
      const user = new User({});
      
      await expect(user.save()).rejects.toThrow();
    });

    it('should validate email format', async () => {
      const userData = {
        fullName: 'John Doe',
        username: 'johndoe',
        email: 'invalid-email',
        password: 'password123',
        role: 'employee'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it('should validate username format', async () => {
      const userData = {
        fullName: 'John Doe',
        username: 'invalid username!',
        email: 'john@example.com',
        password: 'password123',
        role: 'employee'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });
  });

  describe('Password Comparison', () => {
    it('should compare password correctly', async () => {
      const userData = {
        fullName: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123',
        role: 'employee'
      };

      const user = new User(userData);
      await user.save();

      const isMatch = await user.comparePassword('password123');
      expect(isMatch).toBe(true);

      const isNotMatch = await user.comparePassword('wrongpassword');
      expect(isNotMatch).toBe(false);
    });
  });

  describe('User Profile Virtual', () => {
    it('should return user profile data', async () => {
      const userData = {
        fullName: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123',
        role: 'employee',
        headline: 'Software Developer',
        location: 'New York'
      };

      const user = new User(userData);
      await user.save();

      const profile = user.profile;
      expect(profile.id).toBe(user._id.toString());
      expect(profile.fullName).toBe(userData.fullName);
      expect(profile.username).toBe(userData.username);
      expect(profile.email).toBe(userData.email);
      expect(profile.headline).toBe(userData.headline);
      expect(profile.location).toBe(userData.location);
    });
  });

  describe('Unique Constraints', () => {
    it('should enforce unique username', async () => {
      const userData1 = {
        fullName: 'John Doe',
        username: 'johndoe',
        email: 'john1@example.com',
        password: 'password123',
        role: 'employee'
      };

      const userData2 = {
        fullName: 'Jane Doe',
        username: 'johndoe',
        email: 'john2@example.com',
        password: 'password123',
        role: 'employee'
      };

      const user1 = new User(userData1);
      await user1.save();

      const user2 = new User(userData2);
      await expect(user2.save()).rejects.toThrow();
    });

    it('should enforce unique email', async () => {
      const userData1 = {
        fullName: 'John Doe',
        username: 'johndoe1',
        email: 'john@example.com',
        password: 'password123',
        role: 'employee'
      };

      const userData2 = {
        fullName: 'Jane Doe',
        username: 'johndoe2',
        email: 'john@example.com',
        password: 'password123',
        role: 'employee'
      };

      const user1 = new User(userData1);
      await user1.save();

      const user2 = new User(userData2);
      await expect(user2.save()).rejects.toThrow();
    });
  });
});
