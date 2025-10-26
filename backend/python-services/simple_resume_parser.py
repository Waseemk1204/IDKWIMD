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
    """Extract common skills"""
    common_skills = [
        'python', 'java', 'javascript', 'typescript', 'react', 'angular', 'vue',
        'node', 'express', 'django', 'flask', 'sql', 'mongodb', 'postgresql',
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'git', 'ci/cd',
        'html', 'css', 'rest api', 'graphql', 'agile', 'scrum', 'jira',
        'machine learning', 'data analysis', 'tensorflow', 'pytorch'
    ]
    
    text_lower = text.lower()
    found_skills = []
    for skill in common_skills:
        if skill in text_lower:
            found_skills.append(skill.title())
    
    return found_skills

def parse_resume(file_path):
    """Main resume parsing function"""
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
        
        # Process text with spaCy
        doc = nlp(text[:10000])  # Limit to first 10000 chars for performance
        
        # Extract information
        name = extract_name(doc)
        email = extract_email(text)
        phone = extract_phone(text)
        skills = extract_skills(text)
        
        # Return results (using field names expected by frontend)
        return {
            "success": True,
            "data": {
                "fullName": name,  # Changed from "name"
                "email": email,
                "phone": phone,  # Changed from "mobile_number"
                "skills": skills,
                "raw_text": text[:500]  # First 500 chars for reference
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

