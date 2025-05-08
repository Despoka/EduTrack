import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from models import db, AcademicYear, Class, Student, Chapter, ChapterDependency, Grade

def initialize_sample_data():
    """Initialize sample chapters and their dependencies for the system"""
    # Check if we already have chapters
    if Chapter.query.count() > 0:
        return
    
    # Create basic math chapters
    chapters = [
        "Algebra Basics",
        "Linear Equations",
        "Inequalities",
        "Functions",
        "Polynomials",
        "Quadratic Equations",
        "Exponential Functions",
        "Logarithmic Functions",
        "Trigonometry Basics",
        "Trigonometric Functions"
    ]
    
    chapter_objects = {}
    
    for chapter_name in chapters:
        chapter = Chapter(name=chapter_name)
        db.session.add(chapter)
        db.session.flush()  # To get the ID
        chapter_objects[chapter_name] = chapter
    
    # Define dependencies
    dependencies = [
        ("Linear Equations", "Algebra Basics"),
        ("Inequalities", "Algebra Basics"),
        ("Functions", "Algebra Basics"),
        ("Polynomials", "Algebra Basics"),
        ("Quadratic Equations", "Polynomials"),
        ("Quadratic Equations", "Linear Equations"),
        ("Exponential Functions", "Functions"),
        ("Logarithmic Functions", "Exponential Functions"),
        ("Trigonometric Functions", "Trigonometry Basics"),
        ("Trigonometric Functions", "Functions")
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
    
    # If student has no grades, recommend all chapters
    if not student_grades:
        return {chapter.id: "No Data" for chapter in chapters}
    
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
                    recommendations[chapter.id] = "Complete Prerequisites"
            else:
                recommendations[chapter.id] = "Not Started"
        else:
            # Student has a grade for this chapter
            score = student_grades[chapter.id]
            category = get_performance_category(score)
            recommendations[chapter.id] = category
    
    return recommendations
