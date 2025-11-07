#!/usr/bin/env python3
import sys
import json
import re
import spacy
from pdfminer.high_level import extract_text as extract_pdf_text
import docx2txt

def extract_text(file_path):
    """Extract text from PDF or DOCX file"""
    try:
        if file_path.lower().endswith('.pdf'):
            return extract_pdf_text(file_path)
        elif file_path.lower().endswith(('.docx', '.doc')):
            return docx2txt.process(file_path)
        else:
            return None
    except Exception as e:
        return None

def extract_email(text):
    """Extract email addresses"""
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    emails = re.findall(email_pattern, text)
    return emails[0] if emails else None

def extract_phone(text):
    """Extract phone numbers"""
    # Match various phone formats
    phone_pattern = r'(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})'
    phones = re.findall(phone_pattern, text)
    if phones:
        return ''.join(phones[0])
    return None

def extract_name(doc):
    """Extract name using spaCy NER"""
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            return ent.text
    # Fallback: first line often contains name
    lines = doc.text.split('\n')
    for line in lines[:5]:  # Check first 5 lines
        line = line.strip()
        if line and len(line.split()) <= 4 and not '@' in line:
            return line
    return None

def extract_skills(text):
    """Extract comprehensive skills list"""
    # Expanded skills database
    common_skills = [
        # Programming Languages
        'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin', 'go', 'rust', 'scala',
        # Web Technologies
        'react', 'angular', 'vue', 'nextjs', 'nuxt', 'svelte', 'html', 'css', 'sass', 'less', 'tailwind',
        # Backend
        'node', 'nodejs', 'express', 'django', 'flask', 'spring', 'asp.net', 'laravel', 'rails',
        # Databases
        'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'dynamodb', 'cassandra', 'oracle',
        # Cloud & DevOps
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'gitlab', 'github actions', 'terraform', 'ansible',
        'ci/cd', 'devops', 'cloud computing',
        # Data Science & AI
        'machine learning', 'deep learning', 'data analysis', 'data science', 'tensorflow', 'pytorch', 'keras',
        'pandas', 'numpy', 'scikit-learn', 'nlp', 'computer vision', 'ai', 'artificial intelligence',
        # APIs & Integration
        'rest api', 'graphql', 'microservices', 'api development', 'webhooks', 'soap',
        # Project Management
        'agile', 'scrum', 'kanban', 'jira', 'confluence', 'trello', 'asana',
        # Soft Skills
        'leadership', 'team management', 'project management', 'communication', 'problem solving',
        'critical thinking', 'collaboration', 'time management',
        # Tools
        'git', 'github', 'bitbucket', 'vs code', 'visual studio', 'intellij', 'eclipse',
        # Other
        'testing', 'unit testing', 'tdd', 'bdd', 'qa', 'automation', 'robotics', 'iot',
        'blockchain', 'cryptocurrency', 'security', 'cybersecurity', 'networking'
    ]
    
    text_lower = text.lower()
    found_skills = []
    for skill in common_skills:
        if skill in text_lower:
            # Capitalize properly
            if skill in ['nodejs', 'nextjs']:
                found_skills.append('Node.js' if skill == 'nodejs' else 'Next.js')
            elif skill in ['html', 'css', 'php', 'sql', 'api', 'aws', 'gcp', 'nlp', 'ai', 'qa', 'iot', 'tdd', 'bdd']:
                found_skills.append(skill.upper())
            else:
                found_skills.append(skill.title())
    
    # Remove duplicates while preserving order
    found_skills = list(dict.fromkeys(found_skills))
    
    return found_skills

def extract_location(text):
    """Extract location"""
    # Look for common location patterns
    import re
    # Pattern: City, State/Country ZIP
    location_pattern = r'([A-Z][a-zA-Z\s]+),\s*([A-Z][a-zA-Z\s]+)\s*\d{5,6}'
    matches = re.findall(location_pattern, text)
    if matches:
        return f"{matches[0][0]}, {matches[0][1]}"
    return None

def extract_experience(text):
    """Extract work experience"""
    experiences = []
    lines = text.split('\n')
    
    # Common section headers
    exp_headers = ['experience', 'work experience', 'employment', 'professional experience', 'work history']
    edu_headers = ['education', 'academic', 'qualifications']
    
    in_experience_section = False
    current_exp = {}
    
    for i, line in enumerate(lines):
        line_lower = line.strip().lower()
        
        # Check if we're entering experience section
        if any(header in line_lower for header in exp_headers):
            in_experience_section = True
            continue
        
        # Check if we're leaving experience section
        if in_experience_section and any(header in line_lower for header in edu_headers):
            in_experience_section = False
            if current_exp:
                experiences.append(current_exp)
            break
        
        # Parse experience entries
        if in_experience_section and line.strip():
            # Look for date patterns (e.g., "2020 - 2023", "Jan 2020 - Present")
            date_pattern = r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{4}).*?(?:Present|\d{4}))'
            if re.search(date_pattern, line, re.IGNORECASE):
                if current_exp:
                    experiences.append(current_exp)
                current_exp = {
                    'title': lines[i-1].strip() if i > 0 else '',
                    'company': lines[i-2].strip() if i > 1 else '',
                    'duration': line.strip(),
                    'description': ''
                }
    
    # Add last experience
    if current_exp:
        experiences.append(current_exp)
    
    return experiences[:5]  # Return max 5 experiences

def extract_education(text):
    """Extract education"""
    education = []
    lines = text.split('\n')
    
    # Common section headers
    edu_headers = ['education', 'academic', 'qualifications', 'academic background']
    
    in_education_section = False
    current_edu = {}
    
    for i, line in enumerate(lines):
        line_lower = line.strip().lower()
        
        # Check if we're entering education section
        if any(header in line_lower for header in edu_headers):
            in_education_section = True
            continue
        
        # Parse education entries
        if in_education_section and line.strip():
            # Look for degree keywords
            degree_keywords = ['bachelor', 'master', 'phd', 'diploma', 'certificate', 'degree', 'b.tech', 'm.tech', 'mba', 'b.s.', 'm.s.']
            if any(keyword in line_lower for keyword in degree_keywords):
                if current_edu:
                    education.append(current_edu)
                current_edu = {
                    'degree': line.strip(),
                    'institution': lines[i+1].strip() if i+1 < len(lines) else '',
                    'field': '',
                    'year': ''
                }
            # Look for years
            elif re.search(r'\b(19|20)\d{2}\b', line):
                if current_edu:
                    current_edu['year'] = line.strip()
    
    # Add last education
    if current_edu:
        education.append(current_edu)
    
    return education[:5]  # Return max 5 education entries

def extract_summary(text):
    """Extract professional summary"""
    lines = text.split('\n')
    summary_keywords = ['summary', 'profile', 'objective', 'about']
    
    in_summary = False
    summary_lines = []
    
    for line in lines:
        line_lower = line.strip().lower()
        
        if any(keyword in line_lower for keyword in summary_keywords) and len(line.strip()) < 50:
            in_summary = True
            continue
        
        if in_summary:
            if line.strip() and not line.strip().isupper() and len(line.strip()) > 20:
                summary_lines.append(line.strip())
            elif len(summary_lines) > 0 and (not line.strip() or line.strip().isupper()):
                break
    
    return ' '.join(summary_lines[:3]) if summary_lines else None

def parse_resume(file_path):
    """Main resume parsing function - Workday-style comprehensive extraction"""
    try:
        # Extract text from file
        text = extract_text(file_path)
        if not text:
            return {
                "success": False,
                "error": "Could not extract text from file"
            }
        
        # Load spaCy model
        try:
            nlp = spacy.load("en_core_web_sm")
        except Exception as e:
            return {
                "success": False,
                "error": f"Could not load spaCy model: {str(e)}"
            }
        
        # Process text with spaCy (limit to first 10000 chars for performance)
        doc = nlp(text[:10000])
        
        # Extract all information (comprehensive like Workday)
        full_name = extract_name(doc)
        email = extract_email(text)
        phone = extract_phone(text)
        location = extract_location(text)
        about = extract_summary(text)
        skills = extract_skills(text)
        experiences = extract_experience(text)
        education = extract_education(text)
        
        # Return comprehensive results
        return {
            "success": True,
            "data": {
                # Basic info
                "fullName": full_name,
                "email": email,
                "phone": phone,
                "location": location,
                "about": about,
                
                # Skills
                "skills": skills,
                
                # Experience (convert to format expected by frontend)
                "experiences": [
                    {
                        "company": exp.get('company', ''),
                        "title": exp.get('title', ''),
                        "description": exp.get('description', ''),
                        "current": 'present' in exp.get('duration', '').lower()
                    }
                    for exp in experiences
                ] if experiences else [],
                
                # Education (convert to format expected by frontend)
                "education": [
                    {
                        "institution": edu.get('institution', ''),
                        "degree": edu.get('degree', ''),
                        "field": edu.get('field', '') or 'Not specified',
                        "current": False
                    }
                    for edu in education
                ] if education else [],
                
                # Metadata
                "raw_text": text[:1000]  # First 1000 chars for reference
            }
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Resume parsing failed: {str(e)}"
        }

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"success": False, "error": "Usage: simple_resume_parser.py <file_path>"}))
        sys.exit(1)
    
    file_path = sys.argv[1]
    result = parse_resume(file_path)
    print(json.dumps(result))
    sys.exit(0 if result["success"] else 1)

