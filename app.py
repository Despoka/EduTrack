import os
import logging
from datetime import datetime
from flask import Flask, render_template, request, redirect, url_for, jsonify, flash, session
from models import db, AcademicYear, Class, Student, Chapter, ChapterDependency, Grade
from services import get_recommendations, initialize_sample_data
import utils

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev_secret_key")

# Initialize in-memory database
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db.init_app(app)

# Create tables and load initial data
with app.app_context():
    db.create_all()
    # Initialize sample chapter dependencies structure
    initialize_sample_data()
    
# Add global template context
@app.context_processor
def inject_now():
    return {'now': datetime.utcnow()}

@app.route('/')
def index():
    return redirect(url_for('dashboard'))

@app.route('/dashboard')
def dashboard():
    years = AcademicYear.query.all()
    classes = Class.query.all()
    
    selected_class_id = request.args.get('class_id', None)
    
    class_data = None
    students = []
    chapters = []
    performance_data = {}
    
    if selected_class_id:
        class_data = Class.query.get(selected_class_id)
        if class_data:
            students = Student.query.filter_by(class_id=selected_class_id).all()
            chapters = Chapter.query.all()
            
            # Prepare performance data for visualization
            performance_data = utils.prepare_performance_data(students, chapters)
    
    return render_template('dashboard.html', 
                           years=years, 
                           classes=classes, 
                           selected_class=class_data,
                           students=students,
                           chapters=chapters,
                           performance_data=performance_data)

@app.route('/classes', methods=['GET', 'POST'])
def classes():
    if request.method == 'POST':
        if 'add_year' in request.form:
            name = request.form.get('year_name')
            if name:
                year = AcademicYear(name=name)
                db.session.add(year)
                db.session.commit()
                flash('Academic year added successfully', 'success')
            else:
                flash('Year name cannot be empty', 'danger')
                
        elif 'add_class' in request.form:
            name = request.form.get('class_name')
            year_id = request.form.get('year_id')
            if name and year_id:
                class_obj = Class(name=name, academic_year_id=year_id)
                db.session.add(class_obj)
                db.session.commit()
                flash('Class added successfully', 'success')
            else:
                flash('Class name and academic year must be provided', 'danger')
    
    years = AcademicYear.query.all()
    classes = Class.query.all()
    return render_template('classes.html', years=years, classes=classes)

@app.route('/students', methods=['GET', 'POST'])
def students():
    if request.method == 'POST':
        if 'add_student' in request.form:
            name = request.form.get('student_name')
            class_id = request.form.get('class_id')
            if name and class_id:
                student = Student(name=name, class_id=class_id)
                db.session.add(student)
                db.session.commit()
                flash('Student added successfully', 'success')
            else:
                flash('Student name and class must be provided', 'danger')

    classes = Class.query.all()
    selected_class_id = request.args.get('class_id')
    
    if selected_class_id:
        students_list = Student.query.filter_by(class_id=selected_class_id).all()
        selected_class = Class.query.get(selected_class_id)
    else:
        students_list = []
        selected_class = None
        
    chapters = Chapter.query.all()
    return render_template('students.html', 
                           classes=classes,
                           students=students_list,
                           selected_class=selected_class,
                           chapters=chapters,
                           Chapter=Chapter)

@app.route('/chapters', methods=['GET', 'POST'])
def chapters():
    if request.method == 'POST':
        if 'add_chapter' in request.form:
            name = request.form.get('chapter_name')
            if name:
                chapter = Chapter(name=name)
                db.session.add(chapter)
                db.session.commit()
                flash('Chapter added successfully', 'success')
            else:
                flash('Chapter name must be provided', 'danger')
                
        elif 'add_dependency' in request.form:
            chapter_id = request.form.get('chapter_id')
            dependency_id = request.form.get('dependency_id')
            if chapter_id and dependency_id and chapter_id != dependency_id:
                # Check if dependency doesn't already exist
                existing = ChapterDependency.query.filter_by(
                    chapter_id=chapter_id, 
                    dependency_id=dependency_id
                ).first()
                
                if not existing:
                    dependency = ChapterDependency(
                        chapter_id=chapter_id,
                        dependency_id=dependency_id
                    )
                    db.session.add(dependency)
                    db.session.commit()
                    flash('Dependency added successfully', 'success')
                else:
                    flash('This dependency already exists', 'warning')
            else:
                flash('Please select different chapters for dependency', 'danger')
    
    chapters_list = Chapter.query.all()
    dependencies = ChapterDependency.query.all()
    
    # Create a dependency mapping for the frontend
    dependency_map = {}
    for dep in dependencies:
        if dep.chapter_id not in dependency_map:
            dependency_map[dep.chapter_id] = []
        dependency_map[dep.chapter_id].append(dep.dependency_id)
    
    return render_template('chapters.html', 
                           chapters=chapters_list,
                           dependencies=dependencies,
                           dependency_map=dependency_map)

@app.route('/grades', methods=['POST'])
def update_grades():
    student_id = request.form.get('student_id')
    chapter_id = request.form.get('chapter_id')
    score = request.form.get('score')
    
    if student_id and chapter_id and score:
        try:
            score = float(score)
            if 0 <= score <= 100:
                # Check if grade exists
                grade = Grade.query.filter_by(
                    student_id=student_id,
                    chapter_id=chapter_id
                ).first()
                
                if grade:
                    grade.score = score
                else:
                    grade = Grade(student_id=student_id, chapter_id=chapter_id, score=score)
                    db.session.add(grade)
                
                db.session.commit()
                flash('Grade updated successfully', 'success')
            else:
                flash('Score must be between 0 and 100', 'danger')
        except ValueError:
            flash('Score must be a valid number', 'danger')
    else:
        flash('Missing required information', 'danger')
    
    # Get the student and extract class_id if it exists
    student = Student.query.get(student_id) if student_id else None
    if student:
        return redirect(url_for('students', class_id=student.class_id))
    return redirect(url_for('students'))

@app.route('/recommendations')
def recommendations():
    class_id = request.args.get('class_id')
    if not class_id:
        flash('Please select a class', 'warning')
        return redirect(url_for('dashboard'))
    
    class_obj = Class.query.get(class_id)
    students = Student.query.filter_by(class_id=class_id).all()
    chapters = Chapter.query.all()
    
    # Get recommendations for all students in the class
    recommendations_data = {}
    for student in students:
        student_recommendations = get_recommendations(student.id)
        recommendations_data[student.id] = student_recommendations
    
    return render_template('recommendations.html',
                           class_obj=class_obj,
                           students=students,
                           chapters=chapters,
                           recommendations=recommendations_data)

@app.route('/api/performance_data')
def api_performance_data():
    class_id = request.args.get('class_id')
    if not class_id:
        return jsonify({'error': 'No class selected'}), 400
    
    students = Student.query.filter_by(class_id=class_id).all()
    chapters = Chapter.query.all()
    
    performance_data = utils.prepare_performance_data(students, chapters)
    return jsonify(performance_data)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
