#!/usr/bin/env python3
"""
Advanced skill extraction using spaCy
Install: pip install spacy && python -m spacy download en_core_web_sm
"""

import spacy
import json
import sys
from collections import defaultdict

# Load spaCy model
try:
    nlp = spacy.load('en_core_web_sm')
except:
    print(json.dumps([]))
    sys.exit(0)

# Skill patterns
SKILL_PATTERNS = {
    'programming': ['python', 'java', 'javascript', 'c++', 'ruby', 'php', 'swift', 'kotlin'],
    'web': ['react', 'angular', 'vue', 'node.js', 'django', 'flask', 'html', 'css'],
    'database': ['sql', 'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch'],
    'cloud': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins'],
    'data': ['machine learning', 'deep learning', 'tensorflow', 'pytorch', 'pandas']
}

def extract_skills(text):
    """Extract skills from text using spaCy"""
    doc = nlp(text.lower())
    found_skills = defaultdict(list)
    
    # Extract entities
    for ent in doc.ents:
        if ent.label_ in ['ORG', 'PRODUCT', 'WORK_OF_ART']:
            found_skills['entities'].append({
                'text': ent.text,
                'label': ent.label_,
                'context': ent.sent.text
            })
    
    # Extract skill keywords
    for category, skills in SKILL_PATTERNS.items():
        for skill in skills:
            if skill in text.lower():
                # Find context
                for sent in doc.sents:
                    if skill in sent.text:
                        found_skills[category].append({
                            'name': skill,
                            'context': sent.text,
                            'confidence': 0.85
                        })
                        break
    
    # Remove duplicates
    result = []
    seen = set()
    for category, skills in found_skills.items():
        for skill in skills:
            if skill['name'] not in seen:
                skill['category'] = category
                result.append(skill)
                seen.add(skill['name'])
    
    return result

if __name__ == "__main__":
    if len(sys.argv) > 1:
        text = sys.argv[1]
        skills = extract_skills(text)
        print(json.dumps(skills))
    else:
        print(json.dumps([]))