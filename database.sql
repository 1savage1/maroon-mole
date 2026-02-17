-- Minhaj Platform Database Schema
-- Run this in phpMyAdmin or MySQL CLI

CREATE DATABASE IF NOT EXISTS minhaj CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE minhaj;

-- Users table (all roles)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('user','apprentice','institute','company','admin') DEFAULT 'user',
  avatar VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Institutes
CREATE TABLE institutes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  wilaya VARCHAR(100),
  has_residence BOOLEAN DEFAULT FALSE,
  description TEXT,
  image VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Specializations
CREATE TABLE specializations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Institute-Specialization link
CREATE TABLE institute_specializations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  institute_id INT NOT NULL,
  specialization_id INT NOT NULL,
  available_spots INT DEFAULT 0,
  FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE,
  FOREIGN KEY (specialization_id) REFERENCES specializations(id) ON DELETE CASCADE
);

-- Companies
CREATE TABLE companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  wilaya VARCHAR(100),
  description TEXT,
  image VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Company-Specialization link
CREATE TABLE company_specializations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  specialization_id INT NOT NULL,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (specialization_id) REFERENCES specializations(id) ON DELETE CASCADE
);

-- Applications (user -> institute)
CREATE TABLE institute_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  institute_id INT NOT NULL,
  specialization_id INT NOT NULL,
  status ENUM('pending','accepted','rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE,
  FOREIGN KEY (specialization_id) REFERENCES specializations(id) ON DELETE CASCADE
);

-- Applications (user -> company)
CREATE TABLE company_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  company_id INT NOT NULL,
  specialization_id INT NOT NULL,
  status ENUM('pending','accepted','rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (specialization_id) REFERENCES specializations(id) ON DELETE CASCADE
);

-- Grades (PDF transcripts)
CREATE TABLE grades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  semester VARCHAR(50),
  uploaded_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Attendance
CREATE TABLE attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  date DATE NOT NULL,
  status ENUM('present','absent','late') DEFAULT 'present',
  note TEXT,
  marked_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (marked_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Notes/Remarks on apprentice
CREATE TABLE remarks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  written_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (written_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Notifications
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  from_role VARCHAR(50),
  from_id INT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Announcements (from institute)
CREATE TABLE announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  institute_id INT NOT NULL,
  specialization_id INT,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE,
  FOREIGN KEY (specialization_id) REFERENCES specializations(id) ON DELETE SET NULL
);

-- Apprentice-Institute-Company linking
CREATE TABLE apprentice_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  institute_id INT NOT NULL,
  company_id INT,
  specialization_id INT NOT NULL,
  status ENUM('active','completed','cancelled') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
  FOREIGN KEY (specialization_id) REFERENCES specializations(id) ON DELETE CASCADE
);

-- Premium subscriptions
CREATE TABLE subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  plan ENUM('free','premium','enterprise') DEFAULT 'free',
  feature VARCHAR(100),
  starts_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ends_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default admin
INSERT INTO users (name, email, password, role) VALUES ('Admin', 'admin@minhaj.dz', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Sample data: Algerian Wilayas for institutes
INSERT INTO specializations (name, description, duration) VALUES
('Informatique de gestion', 'Gestion des systemes informatiques', '30 mois'),
('Comptabilite et finance', 'Gestion comptable et financiere', '24 mois'),
('Electricite batiment', 'Installation electrique', '18 mois'),
('Plomberie sanitaire', 'Installation sanitaire', '18 mois'),
('Mecanique automobile', 'Reparation et entretien automobile', '24 mois'),
('Coiffure et esthetique', 'Soins de beaute et coiffure', '18 mois'),
('Couture et confection', 'Fabrication de vetements', '18 mois'),
('Soudure', 'Techniques de soudage', '18 mois'),
('Froid et climatisation', 'Installation et maintenance climatique', '24 mois'),
('Hotellerie et tourisme', 'Services hoteliers', '24 mois');

INSERT INTO institutes (name, location, wilaya, has_residence, description) VALUES
('INSFP Alger', 'Rue Didouche Mourad, Alger', 'Alger', TRUE, 'Institut national specialise de formation professionnelle'),
('CFPA Oran', 'Boulevard de lANP, Oran', 'Oran', FALSE, 'Centre de formation professionnelle et dapprentissage'),
('CFPA Constantine', 'Cite Boussouf, Constantine', 'Constantine', TRUE, 'Centre de formation professionnelle et dapprentissage'),
('INSFP Blida', 'Route de lUniversite, Blida', 'Blida', FALSE, 'Institut national specialise de formation professionnelle'),
('CFPA Setif', 'Cite Maabouda, Setif', 'Setif', TRUE, 'Centre de formation professionnelle et dapprentissage'),
('CFPA Annaba', 'Hai Seybouse, Annaba', 'Annaba', FALSE, 'Centre de formation professionnelle et dapprentissage'),
('INSFP Batna', 'Route de Tazoult, Batna', 'Batna', TRUE, 'Institut national specialise de formation professionnelle'),
('CFPA Tlemcen', 'Hai Bouhennak, Tlemcen', 'Tlemcen', FALSE, 'Centre de formation professionnelle et dapprentissage');

INSERT INTO institute_specializations (institute_id, specialization_id, available_spots) VALUES
(1, 1, 30), (1, 2, 25), (1, 9, 20),
(2, 1, 20), (2, 3, 15), (2, 5, 20),
(3, 2, 25), (3, 4, 15), (3, 6, 20),
(4, 1, 20), (4, 7, 15), (4, 8, 20),
(5, 3, 20), (5, 5, 15), (5, 9, 20),
(6, 4, 15), (6, 6, 20), (6, 10, 20),
(7, 1, 20), (7, 2, 15), (7, 5, 20),
(8, 7, 15), (8, 8, 20), (8, 10, 15);

INSERT INTO companies (name, location, wilaya, description) VALUES
('Sonatrach', 'Hydra, Alger', 'Alger', 'Societe nationale des hydrocarbures'),
('Sonelgaz', 'Belouizdad, Alger', 'Alger', 'Societe nationale de lelectricite et du gaz'),
('Djezzy', 'Bab Ezzouar, Alger', 'Alger', 'Operateur de telecommunications'),
('Condor Electronics', 'Zone Industrielle, Bordj Bou Arreridj', 'Bordj Bou Arreridj', 'Fabricant electronique'),
('ENIE', 'Sidi Bel Abbes', 'Sidi Bel Abbes', 'Entreprise nationale des industries electroniques');

INSERT INTO company_specializations (company_id, specialization_id) VALUES
(1, 1), (1, 3), (1, 8),
(2, 3), (2, 9),
(3, 1), (3, 2),
(4, 1), (4, 3), (4, 9),
(5, 1), (5, 3);
