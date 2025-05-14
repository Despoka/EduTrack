import numpy as np
from models import Grade, Student, Chapter

def prepare_performance_data(students, chapters):
    """
    Prepare performance data for visualization
    
    Returns:
        dict: A dictionary containing performance data for visualization
    """
    result = {
        'chapter_names': [chapter.name for chapter in chapters],
        'chapter_ids': [chapter.id for chapter in chapters],
        'student_data': [],
        'average_scores': [],
        'performance_categories': {
            'special_class': 0,
            'unnecessary': 0,
            'required': 0,
            'very_necessary': 0,
            'no_data': 0
        }
    }
    
    # Initialize average scores array
    for _ in chapters:
        result['average_scores'].append([])
    
    # Process each student
    for student in students:
        student_grades = {}
        grades = Grade.query.filter_by(student_id=student.id).all()
        
        for grade in grades:
            student_grades[grade.chapter_id] = grade.score
        
        # Create student data entry
        student_data = {
            'id': student.id,
            'name': student.name,
            'scores': []
        }
        
        # Fill in scores for each chapter
        for i, chapter in enumerate(chapters):
            if chapter.id in student_grades:
                score = student_grades[chapter.id]
                student_data['scores'].append(score)
                result['average_scores'][i].append(score)
                
                # Update performance categories count - use 0-1 scale thresholds
                if score >= 0.9:
                    result['performance_categories']['special_class'] += 1
                elif score >= 0.8:
                    result['performance_categories']['unnecessary'] += 1
                elif score >= 0.7:
                    result['performance_categories']['required'] += 1
                else:
                    result['performance_categories']['very_necessary'] += 1
            else:
                student_data['scores'].append(None)
                result['performance_categories']['no_data'] += 1
        
        result['student_data'].append(student_data)
    
    # Calculate final averages
    for i in range(len(chapters)):
        if result['average_scores'][i]:
            result['average_scores'][i] = round(np.mean(result['average_scores'][i]), 2)
        else:
            result['average_scores'][i] = None
    
    # Calculate performance distribution
    total = sum(result['performance_categories'].values())
    if total > 0:
        for category in result['performance_categories']:
            result['performance_categories'][category] = round(
                (result['performance_categories'][category] / total) * 100, 2
            )
    
    return result

def get_student_grade_heatmap_data(class_id):
    """
    Get heatmap data for grades in a specific class
    
    Args:
        class_id: The ID of the class
        
    Returns:
        dict: Heatmap data
    """
    students = Student.query.filter_by(class_id=class_id).all()
    chapters = Chapter.query.all()
    
    # Create matrix
    heatmap_data = {
        'students': [student.name for student in students],
        'chapters': [chapter.name for chapter in chapters],
        'data': []
    }
    
    # Fill in data
    for student in students:
        student_grades = {}
        grades = Grade.query.filter_by(student_id=student.id).all()
        
        for grade in grades:
            student_grades[grade.chapter_id] = grade.score
        
        student_row = []
        for chapter in chapters:
            if chapter.id in student_grades:
                student_row.append(student_grades[chapter.id])
            else:
                student_row.append(None)
        
        heatmap_data['data'].append(student_row)
    
    return heatmap_data

def get_dependency_graph_data():
    """
    Get chapter dependency graph data for visualization
    
    Returns:
        dict: Graph data for visualization
    """
    from models import Chapter, ChapterDependency
    
    chapters = Chapter.query.all()
    dependencies = ChapterDependency.query.all()
    
    graph_data = {
        'nodes': [],
        'links': []
    }
    
    # Add nodes
    for chapter in chapters:
        graph_data['nodes'].append({
            'id': chapter.id,
            'name': chapter.name
        })
    
    # Add links
    for dep in dependencies:
        graph_data['links'].append({
            'source': dep.dependency_id,  # From
            'target': dep.chapter_id      # To
        })
    
    return graph_data
