import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split
from sklearn import metrics
import joblib

from dataset import DATASET

def train_model():
    print("Initializing Machine Learning model training...")
    
    # Unpack data
    texts = [item[0] for item in DATASET]
    labels = [item[1] for item in DATASET]
    
    # 1. Feature Extraction (TF-IDF Vectorizer)
    # Using english stop words and sublinear TF scaling
    vectorizer = TfidfVectorizer(stop_words='english', sublinear_tf=True, ngram_range=(1, 2))
    X = vectorizer.fit_transform(texts)
    y = labels
    
    # 2. Train-Test Split for validation metrics
    X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)
    
    # Train validation model
    val_classifier = MultinomialNB(alpha=0.1)
    val_classifier.fit(X_train, y_train)
    
    # Predict validation set
    y_pred = val_classifier.predict(X_val)
    val_accuracy = metrics.accuracy_score(y_val, y_pred)
    
    print(f"Validation Accuracy (on 25% test split): {val_accuracy * 100:.2f}%")
    print("Classification Report:")
    print(metrics.classification_report(y_val, y_pred))
    
    # 3. Train final model on ALL data
    print("Training final model on full dataset...")
    classifier = MultinomialNB(alpha=0.1)
    classifier.fit(X, y)
    
    # Save artifacts to current directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    vectorizer_path = os.path.join(current_dir, "vectorizer.pkl")
    classifier_path = os.path.join(current_dir, "classifier.pkl")
    
    joblib.dump(vectorizer, vectorizer_path)
    joblib.dump(classifier, classifier_path)
    
    print(f"Successfully saved TF-IDF Vectorizer to: {vectorizer_path}")
    print(f"Successfully saved Naive Bayes Classifier to: {classifier_path}")
    
    return val_accuracy

if __name__ == "__main__":
    train_model()
