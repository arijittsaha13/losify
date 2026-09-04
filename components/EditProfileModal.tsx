'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { updateUserProfile, type User } from '../lib/authStore';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Electrical & Electronics',
  'Mechanical Engineering',
  'Civil Engineering',
  'Business Administration (MBA / BBA)',
  'Sciences & Humanities',
  'Other Department'
];

const COURSES = [
  'B.Tech',
  'M.Tech',
  'BCA',
  'MCA',
  'B.Sc',
  'M.Sc',
  'BBA',
  'MBA',
  'Diploma',
  'Ph.D'
];

export function EditProfileModal({ isOpen, onClose, user }: EditProfileModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(user.name);
  const [registerId, setRegisterId] = useState(user.registerId);
  const [phone, setPhone] = useState(user.phone || '');
  const [department, setDepartment] = useState(user.department || DEPARTMENTS[0]);
  const [course, setCourse] = useState(user.course || COURSES[0]);
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    setName(user.name);
    setRegisterId(user.registerId);
    setPhone(user.phone || '');
    setDepartment(user.department || DEPARTMENTS[0]);
    setCourse(user.course || COURSES[0]);
    setAvatar(user.avatar || '');
    setSaveSuccess(false);
    setError(undefined);
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Photo size must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result as string);
      setError(undefined);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    if (!name.trim()) {
      setError('Please enter a valid full name.');
      return;
    }
    if (!registerId.trim()) {
      setError('Please enter a valid register number.');
      return;
    }

    try {
      updateUserProfile({
        name,
        registerId,
        phone,
        department,
        course,
        avatar,
      });
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 700);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  return (
    <div className="sq-modal-overlay">
      <div className="sq-modal-card">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="sq-modal-close-btn"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 className="sq-modal-title">
            Edit Profile
          </h2>
          <p className="sq-modal-subtext">
            Update your personal details, campus register ID and photo.
          </p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '20px', fontWeight: 600 }}>
            ⚠ {error}
          </div>
        )}

        {saveSuccess && (
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', color: '#15803d', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '20px', fontWeight: 700, textAlign: 'center' }}>
            ✓ Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Avatar Upload */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '32px',
                fontWeight: 800,
                overflow: 'hidden',
                boxShadow: '0 8px 20px rgba(37, 99, 235, 0.3)',
                border: '3px solid var(--card-bg, #ffffff)',
              }}
            >
              {avatar ? (
                <img src={avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                (user.name || 'User').charAt(0).toUpperCase()
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoUpload}
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  background: 'var(--card-sub-bg, #eff6ff)',
                  color: 'var(--sq-accent-blue, #2563eb)',
                  border: '1px solid var(--card-border, #bfdbfe)',
                  padding: '6px 14px',
                  borderRadius: '99px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Change Photo
              </button>
              {avatar && (
                <button
                  type="button"
                  onClick={() => setAvatar('')}
                  style={{
                    background: '#fef2f2',
                    color: '#ef4444',
                    border: '1px solid #fecaca',
                    padding: '6px 14px',
                    borderRadius: '99px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="sq-modal-label">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Arijit Saha"
              className="sq-modal-input"
            />
          </div>

          {/* Register No */}
          <div>
            <label className="sq-modal-label">
              Register / Roll Number
            </label>
            <input
              type="text"
              required
              value={registerId}
              onChange={(e) => setRegisterId(e.target.value)}
              placeholder="e.g. STU-2026104"
              className="sq-modal-input"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="sq-modal-label">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className="sq-modal-input"
            />
          </div>

          {/* Department & Course Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label className="sq-modal-label">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="sq-modal-select"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="sq-modal-label">
                Course / Program
              </label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="sq-modal-select"
              >
                {COURSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              className="sq-modal-btn-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                flex: 1.5,
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                background: '#2563eb',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
              }}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
