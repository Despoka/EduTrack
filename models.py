from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class AcademicYear(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    classes = db.relationship('Class', backref='academic_year', lazy=True)
    
    def __repr__(self):
        return f'<AcademicYear {self.name}>'

class Class(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    academic_year_id = db.Column(db.Integer, db.ForeignKey('academic_year.id'), nullable=False)
    students = db.relationship('Student', backref='class', lazy=True)
    
    def __repr__(self):
        return f'<Class {self.name} ({self.academic_year.name})>'

class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    class_id = db.Column(db.Integer, db.ForeignKey('class.id'), nullable=False)
    grades = db.relationship('Grade', backref='student', lazy=True)
    
    def __repr__(self):
        return f'<Student {self.name}>'

class Chapter(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    # Define relationship to represent dependencies
    dependencies = db.relationship('ChapterDependency', 
                                  foreign_keys='ChapterDependency.chapter_id',
                                  backref='chapter', 
                                  lazy=True)
    dependents = db.relationship('ChapterDependency', 
                                foreign_keys='ChapterDependency.dependency_id',
                                backref='dependency_of', 
                                lazy=True)
    grades = db.relationship('Grade', backref='chapter', lazy=True)
    
    def __repr__(self):
        return f'<Chapter {self.name}>'

class ChapterDependency(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    chapter_id = db.Column(db.Integer, db.ForeignKey('chapter.id'), nullable=False)
    dependency_id = db.Column(db.Integer, db.ForeignKey('chapter.id'), nullable=False)
    
    def __repr__(self):
        return f'<ChapterDependency {self.chapter_id} depends on {self.dependency_id}>'

class Grade(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    chapter_id = db.Column(db.Integer, db.ForeignKey('chapter.id'), nullable=False)
    score = db.Column(db.Float, nullable=False)
    
    __table_args__ = (
        db.UniqueConstraint('student_id', 'chapter_id', name='unique_student_chapter'),
    )
    
    def __repr__(self):
        return f'<Grade {self.student_id}: {self.chapter_id} = {self.score}>'
