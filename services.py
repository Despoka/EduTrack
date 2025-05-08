import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from models import db, AcademicYear, Class, Student, Chapter, ChapterDependency, Grade

def initialize_sample_data():
    """Initialize sample chapters and their dependencies for the system"""
    # Check if we already have chapters
    if Chapter.query.count() > 0:
        return
    
    # Create chapters based on the provided image data
    chapters = [
        "Eksponen dan Logaritma",
        "Barisan dan Deret",
        "Vektor dan Operasinya",
        "Trigonometri",
        "Sistem Persamaan dan Pertidak Samaan",
        "Fungsi Kuadrat",
        "Statistika",
        "Peluang",
        "Komposisi Fungsi dan Fungsi Invers",
        "Lingkaran",
        "Statistika (Lanjutan)",
        "Transformasi Fungsi",
        "Busur dan Juring Lingkaran",
        "Kombinatorik"
    ]
    
    chapter_objects = {}
    
    for chapter_name in chapters:
        chapter = Chapter(name=chapter_name)
        db.session.add(chapter)
        db.session.flush()  # To get the ID
        chapter_objects[chapter_name] = chapter
    
    # Define dependencies based on the provided image
    dependencies = [
        ("Statistika (Lanjutan)", "Statistika"),
        ("Busur dan Juring Lingkaran", "Lingkaran")
    ]
    
    for chapter_name, dependency_name in dependencies:
        chapter = chapter_objects[chapter_name]
        dependency = chapter_objects[dependency_name]
        
        dep = ChapterDependency(
            chapter_id=chapter.id,
            dependency_id=dependency.id
        )
        db.session.add(dep)
    
    db.session.commit()
    
def initialize_indonesian_sample_data():
    """Initialize sample Indonesian data for demonstration purposes"""
    
    # Check if we already have sample data
    if AcademicYear.query.count() > 0:
        return
        
    # Create academic years
    academic_years = [
        "Tahun Ajaran 2022/2023",
        "Tahun Ajaran 2023/2024",
        "Tahun Ajaran 2024/2025"
    ]
    
    year_objects = {}
    for year_name in academic_years:
        year = AcademicYear(name=year_name)
        db.session.add(year)
        db.session.flush()
        year_objects[year_name] = year
        
    # Create classes
    classes = [
        # Old classes
        ("Kelas 10A", "Tahun Ajaran 2023/2024"),
        ("Kelas 10B", "Tahun Ajaran 2023/2024"),
        ("Kelas 11A", "Tahun Ajaran 2024/2025"),
        
        # Add XII MIPA 1-8 classes under 2022/2023 year
        ("XII MIPA 1", "Tahun Ajaran 2022/2023"),
        ("XII MIPA 2", "Tahun Ajaran 2022/2023"),
        ("XII MIPA 3", "Tahun Ajaran 2022/2023"),
        ("XII MIPA 4", "Tahun Ajaran 2022/2023"),
        ("XII MIPA 5", "Tahun Ajaran 2022/2023"),
        ("XII MIPA 6", "Tahun Ajaran 2022/2023"),
        ("XII MIPA 7", "Tahun Ajaran 2022/2023"),
        ("XII MIPA 8", "Tahun Ajaran 2022/2023")
    ]
    
    class_objects = {}
    for class_name, year_name in classes:
        class_obj = Class(name=class_name, academic_year_id=year_objects[year_name].id)
        db.session.add(class_obj)
        db.session.flush()
        class_objects[class_name] = class_obj
        
    # Indonesian names for generating students
    male_first_names = [
        "Abdul", "Ahmad", "Andi", "Arif", "Agus", "Bambang", "Budi", "Dedi", "Dodi", "Eko", 
        "Fajar", "Farhan", "Hari", "Hadi", "Iwan", "Joko", "Kurniawan", "Muhammad", "Rudi", 
        "Rizki", "Surya", "Tono", "Wahyu", "Yusuf", "Zaenal", "Bayu", "Dimas", "Gading", "Irfan", 
        "Lukman", "Novan", "Putra", "Reza", "Satria", "Teddy", "Untung", "Vicky"
    ]
    
    male_last_names = [
        "Santoso", "Wijaya", "Hidayat", "Kusuma", "Nugroho", "Saputra", "Wibowo", "Hermawan", 
        "Sugianto", "Setiawan", "Gunawan", "Suherman", "Permadi", "Kurniawan", "Prasetyo", "Martinus", 
        "Situmorang", "Pradana", "Wirawan", "Firmansyah", "Utama", "Rachman", "Harahap", "Lubis", 
        "Siagian", "Maulana", "Fuadi", "Pratama", "Hardiansyah", "Wardana", "Tirta"
    ]
    
    female_first_names = [
        "Ani", "Anisa", "Bella", "Cahya", "Dewi", "Dina", "Eka", "Farida", "Fitri", "Hana", 
        "Indah", "Jasmine", "Karina", "Lina", "Maya", "Nadia", "Putri", "Rina", "Sari", "Tari", 
        "Vina", "Wati", "Yanti", "Zahra", "Ayu", "Bunga", "Citra", "Diana", "Endah", "Fani", 
        "Gita", "Hesti", "Ida", "Juwita", "Kartika", "Laras", "Mawar", "Nur", "Oktavia", "Puspita", 
        "Ratna", "Sinta", "Tika", "Utari", "Vivi", "Wulan", "Yani", "Zulfa"
    ]
    
    female_last_names = [
        "Safitri", "Lestari", "Pertiwi", "Utami", "Rahmawati", "Anggraini", "Nuraini", "Hastuti", 
        "Suryani", "Handayani", "Fitriani", "Wulandari", "Yuniarti", "Susanti", "Sulistiani", 
        "Wijayanti", "Melinda", "Purnama", "Mardhiyah", "Salsabila", "Azzahra", "Syahputri", "Septiani", 
        "Novitasari", "Rahayu", "Ayuningtyas", "Octaviani", "Mahardika", "Srimulyani", "Riyanti"
    ]
    
    # Create students with Indonesian names
    students = [
        # Class 10A
        ("Budi Santoso", "Kelas 10A"),
        ("Siti Nurhaliza", "Kelas 10A"),
        ("Ahmad Ridwan", "Kelas 10A"),
        ("Dewi Safitri", "Kelas 10A"),
        ("Rini Marlina", "Kelas 10A"),
        ("Agus Hermawan", "Kelas 10A"),
        ("Rina Wijaya", "Kelas 10A"),
        ("Dedi Kurniawan", "Kelas 10A"),
        ("Lia Megawati", "Kelas 10A"),
        ("Hadi Pranoto", "Kelas 10A"),
        
        # Class 10B
        ("Bambang Suparno", "Kelas 10B"),
        ("Anisa Rahma", "Kelas 10B"),
        ("Joko Widodo", "Kelas 10B"),
        ("Nadia Putri", "Kelas 10B"),
        ("Rizki Pratama", "Kelas 10B"),
        
        # Class 11A
        ("Dian Sastro", "Kelas 11A"),
        ("Eko Prasetyo", "Kelas 11A"),
        ("Fani Maharani", "Kelas 11A"),
        ("Irfan Hakim", "Kelas 11A"),
        ("Novita Sari", "Kelas 11A")
    ]
    
    # Add XII MIPA 1 class students from the image
    mipa1_students = [
        "Abdul Rachman Lubis", "Ahmad Fadil Parawangsa", "Anisa Septiyani", "Aribi Putra", "Arka Gopa Siagian",
        "Bagas Adjie Putra Rinaldi", "Cahyani Sulistyanta", "Desi Fitria Sari", "Elsa Azahra", "Enrico Wuriawan",
        "Habibah Zahrulmadhan", "Hana Devi Lisha", "Hanif Ahmad Jailhani", "Herawati Putri Husaini", "Huzza Malinda",
        "Lilia Rahmawati", "Maharani Putri", "Maiadela Najwa Randa", "Muhamadina Fatya Auliya", "Muhammad Furqon Parakasi",
        "Muhammad Najib", "Muhammad Risky Aufadli", "Nadiyha Maula Asy Syifa", "Naila Qory Aina", "Najma Ramadhanty",
        "Putri Najwa Maharani", "Rafi Pura Ridjani Rechta", "Rahma Rita Juni", "Sabil Athil Tijani Wijoso", "Sendy Aulia",
        "Siti Rabha Maulidia", "Soraya Ramadhany", "Syamila Mutida", "Teguh Maroni", "Vanessa Dwi Rahmia", "Zahra Putri Safa'i"
    ]
    
    # Add XII MIPA 1 students with their gender to students list
    for name in mipa1_students:
        if name in ["Anisa Septiyani", "Cahyani Sulistyanta", "Desi Fitria Sari", "Elsa Azahra", "Hana Devi Lisha", 
                    "Herawati Putri Husaini", "Huzza Malinda", "Lilia Rahmawati", "Maharani Putri", "Maiadela Najwa Randa", 
                    "Nadiyha Maula Asy Syifa", "Naila Qory Aina", "Najma Ramadhanty", "Putri Najwa Maharani", 
                    "Rahma Rita Juni", "Sendy Aulia", "Siti Rabha Maulidia", "Soraya Ramadhany", "Syamila Mutida", 
                    "Vanessa Dwi Rahmia", "Zahra Putri Safa'i"]:
            students.append((name, "XII MIPA 1"))
        else:
            students.append((name, "XII MIPA 1"))

    # Create 35-40 students for each of the XII MIPA 2-8 classes
    import random
    
    for class_num in range(2, 9):  # MIPA 2 through MIPA 8
        class_name = f"XII MIPA {class_num}"
        num_students = random.randint(35, 40)  # Random number of students between 35-40
        
        for _ in range(num_students):
            # Randomly select gender and create name
            if random.random() < 0.5:  # Male
                first_name = random.choice(male_first_names)
                last_name = random.choice(male_last_names)
            else:  # Female
                first_name = random.choice(female_first_names)
                last_name = random.choice(female_last_names)
            
            full_name = f"{first_name} {last_name}"
            students.append((full_name, class_name))
    
    student_objects = {}
    for student_name, class_name in students:
        student = Student(name=student_name, class_id=class_objects[class_name].id)
        db.session.add(student)
        db.session.flush()
        student_objects[student_name] = student
        
    # Get all chapters
    chapters = Chapter.query.all()
    
    # Create grades with realistic distributions
    import random
    
    # For various classes
    for student_name, student in student_objects.items():
        class_obj = Class.query.get(student.class_id)
        class_name = class_obj.name if class_obj else ""
        
        if "Kelas 10A" in class_name:
            # Give grades for all chapters to class 10A (our main demo class)
            for chapter in chapters:
                # Generate a base score for the student that's somewhat consistent
                base_ability = random.uniform(60, 95)
                
                # Adjust score based on chapter complexity
                chapter_difficulty = 0
                if "Kuadrat" in chapter.name or "Eksponen" in chapter.name:
                    chapter_difficulty = -10  # Harder chapters
                elif "Statistika" in chapter.name or "Peluang" in chapter.name:
                    chapter_difficulty = 10   # Easier chapters
                
                # Add some randomness
                score = base_ability + chapter_difficulty + random.uniform(-15, 15)
                score = max(50, min(100, score))  # Keep between 50-100
                
                grade = Grade(student_id=student.id, chapter_id=chapter.id, score=round(score, 1))
                db.session.add(grade)
        
        elif "Kelas 10B" in class_name:
            # Give grades for only the first 5 chapters to class 10B
            for chapter in chapters[:5]:
                score = random.uniform(65, 90)
                grade = Grade(student_id=student.id, chapter_id=chapter.id, score=round(score, 1))
                db.session.add(grade)
                
        elif "Kelas 11A" in class_name:
            # Class 11A has more advanced material covered
            for chapter in chapters:
                if random.random() < 0.8:  # 80% chance to have a grade for each chapter
                    score = random.uniform(70, 95)  # Higher average scores for 11A
                    grade = Grade(student_id=student.id, chapter_id=chapter.id, score=round(score, 1))
                    db.session.add(grade)
                    
        elif "XII MIPA" in class_name:
            # For XII MIPA classes, use the data pattern from the image for MIPA 1 (with variation)
            # Generate all scores for all chapters
            for chapter_idx, chapter in enumerate(chapters):
                # Create a base ability for the student that's consistent
                if "MIPA 1" in class_name:
                    # For MIPA 1, make them match more closely to the image 
                    base_ability = random.uniform(80, 95)
                else:
                    # For other MIPA classes, slightly wider range
                    base_ability = random.uniform(75, 95)
                
                # Add some variation based on chapter
                chapter_adjustment = 0
                if chapter_idx % 3 == 0:  # Every third chapter is a bit harder
                    chapter_adjustment = -5
                elif chapter_idx % 4 == 0:  # Every fourth chapter is a bit easier
                    chapter_adjustment = 5
                
                # Add individual student variation 
                score = base_ability + chapter_adjustment + random.uniform(-10, 10)
                score = max(50, min(100, round(score)))  # Keep between 50-100 and round to integer
                
                grade = Grade(student_id=student.id, chapter_id=chapter.id, score=float(score))
                db.session.add(grade)
    
    db.session.commit()

def get_performance_category(score):
    """Determine the performance category based on score"""
    if score >= 90:
        return "Special Class"
    elif 80 <= score < 90:
        return "Unnecessary"
    elif 70 <= score < 80:
        return "Required"
    else:
        return "Very Necessary"

def get_student_grades(student_id):
    """Get all grades for a student"""
    grades = Grade.query.filter_by(student_id=student_id).all()
    results = {}
    
    for grade in grades:
        results[grade.chapter_id] = grade.score
    
    return results

def get_dependency_graph():
    """Build a chapter dependency graph"""
    dependencies = ChapterDependency.query.all()
    graph = {}
    
    for dep in dependencies:
        if dep.chapter_id not in graph:
            graph[dep.chapter_id] = []
        graph[dep.chapter_id].append(dep.dependency_id)
    
    return graph

def build_training_data():
    """Build training data for the Random Forest model"""
    # Get all students and chapters
    students = Student.query.all()
    chapters = Chapter.query.all()
    dependency_graph = get_dependency_graph()
    
    # Prepare data
    X = []  # Features
    y = []  # Target
    
    for student in students:
        grades = get_student_grades(student.id)
        
        for chapter in chapters:
            # Skip if the student doesn't have a grade for this chapter
            if chapter.id not in grades:
                continue
                
            # Build features for this student-chapter pair
            features = []
            
            # Current chapter score
            current_score = grades[chapter.id]
            
            # Get dependency scores
            dependency_scores = []
            if chapter.id in dependency_graph:
                for dep_id in dependency_graph[chapter.id]:
                    if dep_id in grades:
                        dependency_scores.append(grades[dep_id])
            
            # Add features
            features.append(current_score)
            
            # Add dependency statistics
            if dependency_scores:
                features.extend([
                    np.mean(dependency_scores),
                    np.min(dependency_scores),
                    np.max(dependency_scores),
                    np.std(dependency_scores) if len(dependency_scores) > 1 else 0
                ])
            else:
                features.extend([0, 0, 0, 0])  # No dependencies
            
            # Determine target category
            category = get_performance_category(current_score)
            
            X.append(features)
            y.append(category)
    
    return np.array(X), np.array(y)

def train_recommendation_model():
    """Train a Random Forest model for recommendations"""
    X, y = build_training_data()
    
    # If we don't have enough data, return a dummy model
    if len(X) < 5:
        model = RandomForestClassifier()
        if len(X) > 0:
            # Fit with the data we have
            model.fit(X, y)
        return model
    
    # Train model
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    return model

def get_recommendations(student_id):
    """Get recommendations for additional classes for a student"""
    student = Student.query.get(student_id)
    if not student:
        return {}
    
    # Get all chapters and student grades
    chapters = Chapter.query.all()
    student_grades = get_student_grades(student_id)
    dependency_graph = get_dependency_graph()
    
    # If student has no grades, recommend all as "Very Necessary" instead of "No Data"
    if not student_grades:
        return {chapter.id: "Very Necessary" for chapter in chapters}
    
    # Train model
    model = train_recommendation_model()
    
    # Generate recommendations for each chapter
    recommendations = {}
    
    for chapter in chapters:
        if chapter.id not in student_grades:
            # If student doesn't have a grade for this chapter,
            # check if they have grades for all dependencies
            if chapter.id in dependency_graph:
                dependencies_met = True
                dependency_scores = []
                
                for dep_id in dependency_graph[chapter.id]:
                    if dep_id not in student_grades:
                        dependencies_met = False
                        break
                    dependency_scores.append(student_grades[dep_id])
                
                if dependencies_met and dependency_scores:
                    # Predict recommendation based on dependency scores
                    features = [
                        np.mean(dependency_scores),  # Use mean of dependencies as a proxy
                        np.mean(dependency_scores),
                        np.min(dependency_scores),
                        np.max(dependency_scores),
                        np.std(dependency_scores) if len(dependency_scores) > 1 else 0
                    ]
                    
                    # Predict
                    prediction = model.predict([features])[0]
                    recommendations[chapter.id] = prediction
                else:
                    # Changed from "Complete Prerequisites" to "Very Necessary"
                    recommendations[chapter.id] = "Very Necessary"
            else:
                # Changed from "Not Started" to "Very Necessary"
                recommendations[chapter.id] = "Very Necessary"
        else:
            # Student has a grade for this chapter
            score = student_grades[chapter.id]
            category = get_performance_category(score)
            recommendations[chapter.id] = category
    
    return recommendations
