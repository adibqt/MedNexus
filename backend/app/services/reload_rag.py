"""
Script to reset and reload RAG database with updated symptoms
"""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from app.services.rag_service import rag_service

def reload_rag_database():
    """Reset and reload the RAG database"""
    
    print("=" * 60)
    print("RELOADING RAG DATABASE")
    print("=" * 60)
    
    # Reset database
    print("\n1. Resetting database...")
    rag_service.reset_database()
    
    # Load symptoms
    print("\n2. Loading updated symptoms...")
    symptoms_file = os.path.join(os.path.dirname(__file__), "symptoms.json")
    count = rag_service.load_symptom_mappings(symptoms_file)
    
    # Verify
    print("\n3. Verifying...")
    stats = rag_service.get_stats()
    print(f"   ✓ Total documents: {stats['total_documents']}")
    print(f"   ✓ Specializations: {stats['unique_categories']}")
    print(f"   ✓ Categories: {', '.join(stats['categories'])}")
    
    # Test new symptom
    print("\n4. Testing new differential diagnosis mapping...")
    result = rag_service.retrieve_context(
        "I have chest pain with burning after eating",
        n_results=3
    )
    print(f"   Query: 'chest pain with burning after eating'")
    print(f"   Top match: {result['categories'][0] if result['categories'] else 'None'}")
    print(f"   Context: {result['context_text'].split(chr(10))[0] if result['context_text'] else 'None'}")
    
    print("\n" + "=" * 60)
    print("✓ RAG DATABASE RELOADED SUCCESSFULLY")
    print(f"✓ {count} symptom mappings loaded")
    print("=" * 60)

if __name__ == "__main__":
    try:
        reload_rag_database()
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
