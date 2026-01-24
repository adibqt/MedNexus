"""
RAG (Retrieval-Augmented Generation) Service
Provides medical knowledge retrieval from symptom-to-specialization mappings
"""
import os
import json
from typing import List, Dict, Optional
import chromadb
from chromadb.config import Settings
from pathlib import Path


class MedicalRAGService:
    """
    RAG service for medical symptom-to-specialization knowledge retrieval
    """
    
    def __init__(self, persist_directory: str = "./chroma_db"):
        """
        Initialize the RAG service with ChromaDB
        
        Args:
            persist_directory: Directory to persist the vector database
        """
        self.persist_directory = persist_directory
        self.collection_name = "medical_symptom_mappings"
        self.client = None
        self.collection = None
        self._initialize_chromadb()
        
    def _initialize_chromadb(self):
        """Initialize ChromaDB client and collection"""
        try:
            # Create persistent client
            self.client = chromadb.PersistentClient(path=self.persist_directory)
            
            # Get or create collection with default embedding function
            self.collection = self.client.get_or_create_collection(
                name=self.collection_name,
                metadata={"description": "Medical symptom to specialization mappings"}
            )
            
            print(f"✓ ChromaDB initialized. Collection: {self.collection_name}")
            print(f"✓ Current documents in collection: {self.collection.count()}")
            
        except Exception as e:
            print(f"✗ Error initializing ChromaDB: {e}")
            raise
    
    def load_symptom_mappings(self, json_file_path: str) -> int:
        """
        Load symptom mappings from JSON file into ChromaDB
        
        Args:
            json_file_path: Path to the symptoms.json file
            
        Returns:
            Number of documents loaded
        """
        try:
            # Check if already loaded
            current_count = self.collection.count()
            if current_count > 0:
                print(f"ℹ Collection already contains {current_count} documents. Skipping reload.")
                return current_count
            
            # Load JSON file with UTF-8-sig to handle BOM
            with open(json_file_path, 'r', encoding='utf-8-sig') as f:
                content = f.read().strip()
                if not content:
                    print("⚠ JSON file is empty")
                    return 0
                symptom_data = json.loads(content)
            
            if not symptom_data:
                print("⚠ No symptom data found in JSON file")
                return 0
            
            print(f"✓ Loaded {len(symptom_data)} symptom mappings from JSON")
            
            # Prepare documents for embedding
            documents = []
            metadatas = []
            ids = []
            
            for item in symptom_data:
                symptom_id = item.get('id')
                category = item.get('category', 'General')
                mapping = item.get('mapping', '')
                
                if not mapping:
                    continue
                
                # Create rich document text for better semantic search
                doc_text = f"{category}: {mapping}"
                
                documents.append(doc_text)
                metadatas.append({
                    "category": category,
                    "original_id": symptom_id,
                    "mapping": mapping
                })
                ids.append(f"symptom_{symptom_id}")
            
            # Add to ChromaDB in batches
            batch_size = 50
            total_added = 0
            
            for i in range(0, len(documents), batch_size):
                batch_docs = documents[i:i + batch_size]
                batch_metas = metadatas[i:i + batch_size]
                batch_ids = ids[i:i + batch_size]
                
                self.collection.add(
                    documents=batch_docs,
                    metadatas=batch_metas,
                    ids=batch_ids
                )
                total_added += len(batch_docs)
                print(f"  → Added batch {i//batch_size + 1}: {len(batch_docs)} documents")
            
            print(f"✓ Successfully loaded {total_added} symptom mappings into RAG database")
            return total_added
            
        except FileNotFoundError:
            print(f"✗ Symptom mapping file not found: {json_file_path}")
            return 0
        except json.JSONDecodeError as e:
            print(f"✗ Error parsing JSON file: {e}")
            print(f"  File path: {json_file_path}")
            # Try to read first few bytes to debug
            try:
                with open(json_file_path, 'rb') as f:
                    first_bytes = f.read(100)
                    print(f"  First bytes (hex): {first_bytes[:50].hex()}")
            except:
                pass
            return 0
        except Exception as e:
            print(f"✗ Error loading symptom mappings: {e}")
            import traceback
            traceback.print_exc()
            return 0
    
    def retrieve_context(
        self, 
        query: str, 
        n_results: int = 5,
        filter_category: Optional[str] = None
    ) -> Dict:
        """
        Retrieve relevant medical knowledge based on query
        
        Args:
            query: User's symptom description
            n_results: Number of top results to return
            filter_category: Optional category filter (e.g., 'Cardiology')
            
        Returns:
            Dict containing retrieved documents and metadata
        """
        try:
            if self.collection.count() == 0:
                print("⚠ RAG database is empty. Please load symptom mappings first.")
                return {
                    "documents": [],
                    "categories": [],
                    "context_text": ""
                }
            
            # Build where clause for filtering
            where_clause = None
            if filter_category:
                where_clause = {"category": filter_category}
            
            # Query the collection
            results = self.collection.query(
                query_texts=[query],
                n_results=n_results,
                where=where_clause
            )
            
            if not results['documents'] or not results['documents'][0]:
                return {
                    "documents": [],
                    "categories": [],
                    "context_text": ""
                }
            
            # Extract relevant information
            documents = results['documents'][0]
            metadatas = results['metadatas'][0]
            distances = results.get('distances', [[]])[0]
            
            # Build category list
            categories = [meta['category'] for meta in metadatas]
            
            # Create formatted context text
            context_parts = []
            for i, (doc, meta, dist) in enumerate(zip(documents, metadatas, distances if distances else [0]*len(documents))):
                context_parts.append(f"{i+1}. {meta['category']}: {meta['mapping']}")
            
            context_text = "\n".join(context_parts)
            
            return {
                "documents": documents,
                "categories": categories,
                "metadatas": metadatas,
                "distances": distances if distances else None,
                "context_text": context_text,
                "n_results": len(documents)
            }
            
        except Exception as e:
            print(f"✗ Error retrieving context: {e}")
            return {
                "documents": [],
                "categories": [],
                "context_text": ""
            }
    
    def get_specialization_context(self, specializations: List[str]) -> str:
        """
        Get aggregated context for specific specializations
        
        Args:
            specializations: List of specialization names
            
        Returns:
            Combined context text for the specializations
        """
        try:
            all_contexts = []
            
            for spec in specializations:
                results = self.collection.query(
                    query_texts=[spec],
                    n_results=3,
                    where={"category": spec}
                )
                
                if results['metadatas'] and results['metadatas'][0]:
                    for meta in results['metadatas'][0]:
                        all_contexts.append(meta['mapping'])
            
            return "\n".join(all_contexts) if all_contexts else ""
            
        except Exception as e:
            print(f"✗ Error getting specialization context: {e}")
            return ""
    
    def get_stats(self) -> Dict:
        """
        Get statistics about the RAG database
        
        Returns:
            Dict with collection statistics
        """
        try:
            count = self.collection.count()
            
            # Get sample to analyze categories
            if count > 0:
                sample = self.collection.get(limit=count)
                categories = set()
                if sample['metadatas']:
                    categories = set(meta['category'] for meta in sample['metadatas'])
                
                return {
                    "total_documents": count,
                    "unique_categories": len(categories),
                    "categories": sorted(list(categories)),
                    "status": "ready"
                }
            
            return {
                "total_documents": 0,
                "unique_categories": 0,
                "categories": [],
                "status": "empty"
            }
            
        except Exception as e:
            print(f"✗ Error getting stats: {e}")
            return {
                "total_documents": 0,
                "unique_categories": 0,
                "categories": [],
                "status": "error"
            }
    
    def reset_database(self):
        """
        Reset the RAG database (delete and recreate collection)
        Use with caution - this will delete all stored embeddings
        """
        try:
            self.client.delete_collection(name=self.collection_name)
            print(f"✓ Deleted collection: {self.collection_name}")
            
            self.collection = self.client.create_collection(
                name=self.collection_name,
                metadata={"description": "Medical symptom to specialization mappings"}
            )
            print(f"✓ Created new collection: {self.collection_name}")
            
        except Exception as e:
            print(f"✗ Error resetting database: {e}")


# Singleton instance
_rag_service_instance = None

def get_rag_service() -> MedicalRAGService:
    """
    Get or create the singleton RAG service instance
    
    Returns:
        MedicalRAGService instance
    """
    global _rag_service_instance
    
    if _rag_service_instance is None:
        # Initialize RAG service
        persist_dir = os.path.join(os.path.dirname(__file__), "..", "..", "chroma_db")
        _rag_service_instance = MedicalRAGService(persist_directory=persist_dir)
        
        # Load symptom mappings
        symptoms_file = os.path.join(os.path.dirname(__file__), "symptoms.json")
        if os.path.exists(symptoms_file):
            _rag_service_instance.load_symptom_mappings(symptoms_file)
        else:
            print(f"⚠ Warning: symptoms.json not found at {symptoms_file}")
    
    return _rag_service_instance


# Initialize on module import
rag_service = get_rag_service()
