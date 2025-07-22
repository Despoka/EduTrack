# EduTrack

**EduTrack** adalah aplikasi berbasis web yang bertujuan untuk memantau dan menganalisis performa siswa dalam mata pelajaran tertentu, seperti Matematika. Aplikasi ini membantu guru atau pengajar untuk mengidentifikasi siswa yang memerlukan perhatian lebih melalui visualisasi data dan klasifikasi performa.

## 🚀 Fitur Utama

- Input nilai siswa secara manual atau dari file.
- Klasifikasi performa siswa menggunakan algoritma machine learning.
- Visualisasi statistik nilai: rata-rata, tertinggi, dan terendah.
- Rekomendasi tindakan/remedial untuk siswa dengan performa rendah.
- Backend menggunakan Flask dan database MySQL.

## 🛠️ Teknologi yang Digunakan

- Python
- Flask
- Flask-SQLAlchemy
- Gunicorn
- MySQL / PyMySQL / mysqlclient
- Pandas, NumPy
- Scikit-learn
- python-dotenv

## 📦 Instalasi

### 1. Clone repository


- git clone https://github.com/Despoka/EduTrack.git
- cd EduTrack


## Optional
Gunakan Virtual Environment
- python -m venv venv
- venv\Scripts\activate  # Windows
- source venv/bin/activate  # Linux/macOS


## Install Dependencies
- pip install -r requirements.txt

## File .env
- FLASK_APP=app.py 
- FLASK_ENV=development
- DATABASE_URL=mysql://username:password@localhost/nama_database


