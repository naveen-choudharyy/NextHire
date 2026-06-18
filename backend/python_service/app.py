import os
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer

# Import trainer to train on demand
from model_trainer import train_model

app = Flask(__name__)
CORS(app)

# Global variables for model and vectorizer
vectorizer = None
classifier = None

def load_or_train_model():
    global vectorizer, classifier
    current_dir = os.path.dirname(os.path.abspath(__file__))
    vectorizer_path = os.path.join(current_dir, "vectorizer.pkl")
    classifier_path = os.path.join(current_dir, "classifier.pkl")
    
    if not os.path.exists(vectorizer_path) or not os.path.exists(classifier_path):
        print("Model files not found. Initiating dynamic model training...")
        train_model()
        
    try:
        vectorizer = joblib.load(vectorizer_path)
        classifier = joblib.load(classifier_path)
        print("Machine Learning models loaded successfully.")
    except Exception as e:
        print(f"Error loading models: {str(e)}")

# Syllable counting helper for readability computation
def count_syllables(word):
    word = word.lower().strip()
    if len(word) <= 3:
        return 1
    # Remove endings
    word = re.sub(r'(?:es|ed|e)$', '', word)
    # Count consecutive vowels
    vowels = re.findall(r'[aeiouy]+', word)
    return max(1, len(vowels))

# Readability index calculator (approximate Flesch Reading Ease)
def calculate_readability(text):
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 0]
    sentence_count = max(1, len(sentences))
    
    words = re.findall(r'\b\w+\b', text.lower())
    word_count = max(1, len(words))
    
    syllable_count = sum(count_syllables(w) for w in words)
    
    # Flesch Reading Ease Formula
    # Score = 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words))
    score = 206.835 - (1.015 * (word_count / sentence_count)) - (84.6 * (syllable_count / word_count))
    
    # Cap score between 0 and 100
    score = max(0.0, min(100.0, score))
    
    # Determine label
    if score >= 90:
        label = "Very Easy (5th Grade)"
    elif score >= 80:
        label = "Easy (6th Grade)"
    elif score >= 70:
        label = "Fairly Easy (7th Grade)"
    elif score >= 60:
        label = "Standard / Moderate (8th-9th Grade)"
    elif score >= 50:
        label = "Fairly Difficult (High School)"
    elif score >= 30:
        label = "Difficult (College)"
    else:
        label = "Very Confusing (College Graduate)"
        
    return {
        "word_count": word_count,
        "sentence_count": sentence_count,
        "avg_sentence_len": round(word_count / sentence_count, 1),
        "readability_score": round(score, 1),
        "readability_label": label
    }

# Stopwords list for keyword analytics
STOPWORDS = set([
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're", "you've", "you'll", "you'd",
    'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', "she's", 'her', 'hers',
    'herself', 'it', "it's", 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which',
    'who', 'whom', 'this', 'that', "that'll", 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if',
    'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between',
    'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out',
    'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why',
    'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
    'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', "don't",
    'should', "should've", 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', "aren't", 'couldn',
    "couldn't", 'didn', "didn't", 'doesn', "doesn't", 'hadn', "hadn't", 'hasn', "hasn't", 'haven', "haven't",
    'isn', "isn't", 'ma', 'mightn', "mightn't", 'mustn', "mustn't", 'needn', "needn't", 'shan', "shan't",
    'shouldn', "shouldn't", 'wasn', "wasn't", 'weren', "weren't", 'won', "won't", 'wouldn', "wouldn't",
    'experienced', 'skills', 'work', 'project', 'projects', 'using', 'responsibilities', 'development',
    'developed', 'system', 'systems', 'management', 'managed', 'team', 'teams', 'designed', 'built', 'created'
])

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "service": "NextHire ML/NLP Service",
        "model_loaded": classifier is not None
    }), 200

@app.route('/predict', methods=['POST'])
def predict():
    if not classifier or not vectorizer:
        return jsonify({"error": "ML Models are not initialized."}), 500
        
    data = request.json or {}
    text = data.get("text", "").strip()
    if not text:
        return jsonify({"error": "No input text provided."}), 400
        
    # Transform and predict
    text_vector = vectorizer.transform([text])
    predicted_category = classifier.predict(text_vector)[0]
    
    # Get prediction probabilities
    probabilities = classifier.predict_proba(text_vector)[0]
    classes = classifier.classes_
    
    prob_map = {classes[i]: float(probabilities[i]) for i in range(len(classes))}
    
    return jsonify({
        "predicted_category": predicted_category,
        "probabilities": prob_map
    }), 200

@app.route('/match-jobs', methods=['POST'])
def match_jobs():
    data = request.json or {}
    resume_text = data.get("resume_text", "").strip()
    jobs = data.get("jobs", [])
    
    if not resume_text or not jobs:
        return jsonify({"error": "Missing resume_text or jobs list."}), 400
        
    # Fit temporary TF-IDF Vectorizer on resume + jobs to calculate cosine similarity
    corpus = [resume_text]
    for j in jobs:
        corpus.append(j.get("description", ""))
        
    temp_vectorizer = TfidfVectorizer(stop_words='english')
    try:
        tfidf_matrix = temp_vectorizer.fit_transform(corpus)
    except Exception:
        # Fallback if corpus is empty or invalid
        return jsonify([{"job_id": j.get("id"), "match_score": 20, "matching_keywords": []} for j in jobs]), 200
        
    resume_vector = tfidf_matrix[0]
    
    results = []
    resume_words = set(re.findall(r'\b\w+\b', resume_text.lower()))
    
    for idx, job in enumerate(jobs):
        job_vector = tfidf_matrix[idx + 1]
        similarity = cosine_similarity(resume_vector, job_vector)[0][0]
        
        # Convert similarity to 0-100 percentage
        match_score = int(round(similarity * 100))
        
        # Adjust range slightly to feel realistic (e.g. at least some score if there is a match)
        # Identify intersection of keywords
        job_keywords = job.get("keywords", [])
        matching_keywords = [kw for kw in job_keywords if kw.lower() in resume_words]
        
        # Boost score slightly if keywords match
        if len(matching_keywords) > 0 and match_score < 30:
            match_score = min(95, 30 + len(matching_keywords) * 8)
            
        # Limit between 20 and 98 for realistic metrics
        match_score = max(20, min(98, match_score))
        
        results.append({
            "job_id": job.get("id"),
            "match_score": match_score,
            "matching_keywords": matching_keywords
        })
        
    # Sort descending by match score
    results.sort(key=lambda x: x["match_score"], reverse=True)
    
    return jsonify(results), 200

@app.route('/analyze-resume', methods=['POST'])
def analyze_resume():
    data = request.json or {}
    text = data.get("text", "").strip()
    if not text:
        return jsonify({"error": "No input text provided."}), 400
        
    # Readability and basic metrics
    metrics_data = calculate_readability(text)
    
    # Extract keywords
    words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
    filtered_words = [w for w in words if w not in STOPWORDS]
    
    # Count frequencies
    freq = {}
    for w in filtered_words:
        freq[w] = freq.get(w, 0) + 1
        
    sorted_keywords = sorted(freq.items(), key=lambda x: x[1], reverse=True)[:12]
    
    top_keywords = [{"text": k, "value": v} for k, v in sorted_keywords]
    
    metrics_data["top_keywords"] = top_keywords
    return jsonify(metrics_data), 200

@app.route('/skill-gap', methods=['POST'])
def skill_gap():
    data = request.json or {}
    resume_text = data.get("resume_text", "").strip()
    job_desc = data.get("job_description", "").strip()
    
    if not resume_text or not job_desc:
        return jsonify({"error": "Missing resume_text or job_description."}), 400
        
    # Clean words
    resume_words = set(re.findall(r'\b[a-zA-Z]{3,}\b', resume_text.lower()))
    job_words = re.findall(r'\b[a-zA-Z]{3,}\b', job_desc.lower())
    
    # Filter stopwords from job description
    filtered_job_words = [w for w in job_words if w not in STOPWORDS and w not in resume_words]
    
    # Get frequencies of words in job description that are missing in resume
    missing_freq = {}
    for w in filtered_job_words:
        missing_freq[w] = missing_freq.get(w, 0) + 1
        
    sorted_missing = sorted(missing_freq.items(), key=lambda x: x[1], reverse=True)[:8]
    suggested_skills = [item[0].capitalize() for item in sorted_missing]
    
    return jsonify({
        "missing_skills": suggested_skills
    }), 200

# Execute model loader on startup
load_or_train_model()

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5002))
    app.run(host='0.0.0.0', port=port, debug=True)
