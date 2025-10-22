#!/usr/bin/env python3
"""
Resume Parser using pyresparser
Extracts structured data from resume files (PDF, DOCX, DOC)
Outputs JSON to stdout for consumption by Node.js backend
"""

import sys
import json
import os
from pathlib import Path

try:
    from pyresparser import ResumeParser
except ImportError:
    error_response = {
        "success": False,
        "error": "pyresparser not installed. Run setup.sh/setup.bat first."
    }
    print(json.dumps(error_response))
    sys.exit(1)


def parse_resume(file_path):
    """
    Parse resume and extract structured data
    
    Args:
        file_path: Path to the resume file
        
    Returns:
        dict: Parsed resume data in JSON format
    """
    try:
        # Validate file exists
        if not os.path.exists(file_path):
            return {
                "success": False,
                "error": f"File not found: {file_path}"
            }
        
        # Validate file extension
        allowed_extensions = {'.pdf', '.docx', '.doc'}
        file_ext = Path(file_path).suffix.lower()
        if file_ext not in allowed_extensions:
            return {
                "success": False,
                "error": f"Unsupported file type: {file_ext}. Allowed: {', '.join(allowed_extensions)}"
            }
        
        # Parse resume
        data = ResumeParser(file_path).get_extracted_data()
        
        if not data:
            return {
                "success": False,
                "error": "Failed to extract data from resume"
            }
        
        # Transform data to match our User model schema
        transformed_data = transform_to_user_schema(data)
        
        return {
            "success": True,
            "data": transformed_data,
            "raw_data": data  # Include raw data for debugging
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Resume parsing error: {str(e)}",
            "error_type": type(e).__name__
        }


def transform_to_user_schema(parsed_data):
    """
    Transform pyresparser output to match User model schema
    
    Args:
        parsed_data: Raw data from pyresparser
        
    Returns:
        dict: Transformed data matching User model
    """
    transformed = {}
    
    # Basic information
    if parsed_data.get('name'):
        transformed['fullName'] = parsed_data['name']
    
    if parsed_data.get('email'):
        transformed['email'] = parsed_data['email']
    
    if parsed_data.get('mobile_number'):
        transformed['phone'] = parsed_data['mobile_number']
    
    # Skills - pyresparser returns a list of skills
    if parsed_data.get('skills'):
        transformed['skills'] = parsed_data['skills']
    
    # Education - transform to our schema
    if parsed_data.get('degree'):
        education = []
        degrees = parsed_data.get('degree', [])
        
        # pyresparser returns degrees as a list
        for degree in degrees:
            if isinstance(degree, str):
                education.append({
                    'degree': degree,
                    'institution': '',  # pyresparser doesn't always extract institution
                    'field': '',
                    'current': False
                })
        
        # Try to extract institution from 'college_name' if available
        if parsed_data.get('college_name'):
            colleges = parsed_data['college_name']
            for i, college in enumerate(colleges):
                if i < len(education):
                    education[i]['institution'] = college
        
        transformed['education'] = education
    
    # Experience - pyresparser extracts company names and years
    if parsed_data.get('company_names'):
        experiences = []
        companies = parsed_data['company_names']
        
        for company in companies:
            experiences.append({
                'company': company,
                'title': '',  # pyresparser doesn't extract job titles reliably
                'description': '',
                'current': False
            })
        
        # Try to add experience duration if available
        if parsed_data.get('experience'):
            exp_years = parsed_data['experience']
            # This is typically a list of years like ['2020-2022', '2018-2020']
            for i, duration in enumerate(exp_years):
                if i < len(experiences):
                    experiences[i]['duration'] = duration
        
        transformed['experiences'] = experiences
    
    # Total years of experience
    if parsed_data.get('total_experience'):
        transformed['totalExperience'] = parsed_data['total_experience']
    
    # Extract location if mentioned
    # pyresparser doesn't have a dedicated location field, but might be in raw text
    
    # Certifications (if any)
    if parsed_data.get('certifications'):
        transformed['certifications'] = parsed_data['certifications']
    
    # No of pages (for reference)
    if parsed_data.get('no_of_pages'):
        transformed['resumePages'] = parsed_data['no_of_pages']
    
    return transformed


def main():
    """Main entry point"""
    if len(sys.argv) < 2:
        error_response = {
            "success": False,
            "error": "Usage: python resume_parser.py <path_to_resume_file>"
        }
        print(json.dumps(error_response))
        sys.exit(1)
    
    file_path = sys.argv[1]
    
    # Parse resume
    result = parse_resume(file_path)
    
    # Output JSON to stdout
    print(json.dumps(result, indent=2))
    
    # Exit with appropriate code
    sys.exit(0 if result.get('success') else 1)


if __name__ == '__main__':
    main()

