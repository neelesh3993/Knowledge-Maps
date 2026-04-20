"""
Phase 1 — Embedding Models + Clustering
========================================
Called by app.py as a function, not run as a script.
Accepts any CSV file path and a model key.
Returns a dict that phase2.py can consume directly.
"""

import gc
import time
import math
import warnings
import numpy as np
import pandas as pd
import torch
from pathlib import Path
from collections import defaultdict
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import normalize

import nltk
from nltk.tokenize import word_tokenize
from gensim.models.phrases import Phrases, Phraser

from sentence_transformers import SentenceTransformer
from transformers import AutoTokenizer, AutoModel
from umap import UMAP
from hdbscan import HDBSCAN
import hdbscan as hdbscan_lib

warnings.filterwarnings("ignore")


# ── CONFIG ────────────────────────────────────────────────────────────────────

SOFT_PROB_THRESHOLD  = 0.1
UMAP_N_NEIGHBORS     = 15
UMAP_N_COMPONENTS    = 5
UMAP_MIN_DIST        = 0.0
UMAP_METRIC          = "cosine"
UMAP_VIZ_COMPONENTS  = 2
UMAP_VIZ_NEIGHBORS   = 15
UMAP_VIZ_MIN_DIST    = 0.1
HDBSCAN_MIN_CLUSTER  = 6
HDBSCAN_MIN_SAMPLES  = 3
CTFIDF_TOP_N         = 10

MODEL_IDS = {
    "scibert":   "allenai/scibert_scivocab_uncased",
    "specter2":  "allenai/specter2_base",
    "minilm":    "sentence-transformers/all-MiniLM-L6-v2",
    "qwen3_emb": "Qwen/Qwen3-Embedding-0.6B",
}

OUTLIER_TOKENS = {
    "pa", "apa", "hxpressions", "exhibited",
    "image", "paper", "study", "condition", "control",
    "load", "videos", "use", "used", "using",
    "show", "showed", "shown", "find", "found", "finding",
    "result", "results", "research", "effects", "effect",
}

CTFIDF_STOPWORDS = {
    "the","a","an","and","or","but","in","on","at","to","for","of",
    "with","by","from","as","is","was","are","were","be","been","being",
    "have","has","had","do","does","did","will","would","could","should",
    "may","might","shall","can","not","no","nor","so","yet","both",
    "either","neither","than","that","this","these","those","which",
    "who","whom","what","where","when","why","how","all","each","every",
    "more","most","other","some","such","into","through","during",
    "before","after","above","below","between","out","off","over",
    "under","then","once","here","there","its","our","their","they",
    "we","you","he","she","it","his","her","also","about","up","two",
    "three","one","i","me","my","your","while","if","only","just",
    "even","however","although","thus","therefore","whether","among",
    "well","because","s","t","re","ve","d","ll","m",
    "study","studies","paper","papers","research","results","findings",
    "analysis","approach","based","using","used","method","methods",
    "model","models","system","systems","data","proposed","showed",
    "shown","found","provide","provided","present","presented",
    "investigate","investigated","effect","effects","different",
    "significant","significantly","across","within","compared",
    "comparison","participants","group","groups","condition","conditions",
    "task","tasks","type","types","level","levels","number","several",
    "many","new","first","second","third","high","higher","low","lower",
}


# ── DATA LOADING ──────────────────────────────────────────────────────────────

def load_and_clean(csv_path):
    df = pd.read_csv(csv_path)
    print(f"  Loaded {len(df)} rows from CSV")

    sep_docs, plain_docs = [], []
    for _, row in df.iterrows():
        title    = str(row.get("Title",    "")).strip() if pd.notna(row.get("Title"))    else ""
        abstract = str(row.get("Abstract", "")).strip() if pd.notna(row.get("Abstract")) else ""
        sep_docs.append(f"{title} [SEP] {abstract}")
        plain_docs.append(f"{title}. {abstract}")

    for resource in ["tokenizers/punkt", "tokenizers/punkt_tab"]:
        try:
            nltk.data.find(resource)
        except LookupError:
            nltk.download(resource.split("/")[-1], quiet=True)

    cleaned = []
    for doc in plain_docs:
        tokens = word_tokenize(doc.lower())
        tokens = [t for t in tokens if t not in OUTLIER_TOKENS]
        cleaned.append(" ".join(tokens))

    tokenized   = [d.split() for d in cleaned]
    bigram_mod  = Phraser(Phrases(tokenized, min_count=3, threshold=10, delimiter="_"))
    trigram_mod = Phraser(Phrases(bigram_mod[tokenized], min_count=2, threshold=10, delimiter="_"))
    docs_final  = [" ".join(trigram_mod[bigram_mod[d]]) for d in tokenized]

    return df, sep_docs, plain_docs, docs_final


# ── EMBEDDING WRAPPERS ────────────────────────────────────────────────────────

class SciBERTWrapper:
    def __init__(self):
        print("  Loading SciBERT...")
        self.model = SentenceTransformer(MODEL_IDS["scibert"])

    def encode(self, docs):
        device = "cuda" if torch.cuda.is_available() else "cpu"
        return self.model.encode(docs, batch_size=32, show_progress_bar=True,
                                  device=device, normalize_embeddings=True)

    def unload(self):
        del self.model
        if torch.cuda.is_available(): torch.cuda.empty_cache()
        gc.collect()


class MiniLMWrapper:
    def __init__(self):
        print("  Loading MiniLM...")
        self.model = SentenceTransformer(MODEL_IDS["minilm"])

    def encode(self, docs):
        device = "cuda" if torch.cuda.is_available() else "cpu"
        return self.model.encode(docs, batch_size=64, show_progress_bar=True,
                                  device=device, normalize_embeddings=True)

    def unload(self):
        del self.model
        if torch.cuda.is_available(): torch.cuda.empty_cache()
        gc.collect()


class SPECTER2Wrapper:
    def __init__(self):
        print("  Loading SPECTER2 + proximity adapter...")
        from adapters import AutoAdapterModel
        self.tokenizer = AutoTokenizer.from_pretrained("allenai/specter2_base")
        self.model     = AutoAdapterModel.from_pretrained("allenai/specter2_base")
        self.model.load_adapter("allenai/specter2", source="hf",
                                load_as="proximity", set_active=True)
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model  = self.model.to(self.device)
        self.model.eval()

    def encode(self, docs, batch_size=16):
        all_emb = []
        for i in range(0, len(docs), batch_size):
            batch  = docs[i:i + batch_size]
            inputs = self.tokenizer(batch, padding=True, truncation=True,
                                     return_tensors="pt", max_length=512,
                                     return_token_type_ids=False)
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            with torch.no_grad():
                out = self.model(**inputs)
                all_emb.extend(out.last_hidden_state[:, 0, :].cpu().numpy())
            print(f"\r  Encoded {min(i+batch_size, len(docs))}/{len(docs)}", end="", flush=True)
        print()
        return normalize(np.array(all_emb), norm="l2")

    def unload(self):
        del self.model, self.tokenizer
        if torch.cuda.is_available(): torch.cuda.empty_cache()
        gc.collect()


class Qwen3EmbWrapper:
    def __init__(self):
        print("  Loading Qwen3-Embedding...")
        self.tokenizer = AutoTokenizer.from_pretrained(MODEL_IDS["qwen3_emb"], padding_side="left")
        self.model     = AutoModel.from_pretrained(MODEL_IDS["qwen3_emb"], torch_dtype=torch.float16)
        self.device    = "cuda" if torch.cuda.is_available() else "cpu"
        self.model     = self.model.to(self.device)
        self.model.eval()

    def _pool(self, hidden, mask):
        if (mask[:, -1].sum() == mask.shape[0]):
            return hidden[:, -1]
        seq_len = mask.sum(dim=1) - 1
        return hidden[torch.arange(hidden.shape[0], device=hidden.device), seq_len]

    def encode(self, docs, batch_size=16):
        task   = "Instruct: Given a scientific paper, retrieve semantically similar papers\nQuery: "
        docs_i = [task + d for d in docs]
        all_emb = []
        for i in range(0, len(docs_i), batch_size):
            batch  = docs_i[i:i + batch_size]
            inputs = self.tokenizer(batch, padding=True, truncation=True,
                                     return_tensors="pt", max_length=512)
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            with torch.no_grad():
                out = self.model(**inputs)
                emb = self._pool(out.last_hidden_state, inputs["attention_mask"]).cpu().float().numpy()
            all_emb.extend(emb)
            print(f"\r  Encoded {min(i+batch_size, len(docs))}/{len(docs)}", end="", flush=True)
        print()
        return normalize(np.array(all_emb), norm="l2")

    def unload(self):
        del self.model, self.tokenizer
        if torch.cuda.is_available(): torch.cuda.empty_cache()
        gc.collect()


def load_model(model_key):
    if model_key == "scibert":   return SciBERTWrapper()
    if model_key == "specter2":  return SPECTER2Wrapper()
    if model_key == "minilm":    return MiniLMWrapper()
    if model_key == "qwen3_emb": return Qwen3EmbWrapper()
    raise ValueError(f"Unknown model: {model_key}")


# ── UMAP + HDBSCAN ────────────────────────────────────────────────────────────

def reduce_and_cluster(embeddings):
    umap_5d = UMAP(n_neighbors=UMAP_N_NEIGHBORS, n_components=UMAP_N_COMPONENTS,
                   min_dist=UMAP_MIN_DIST, metric=UMAP_METRIC, random_state=42)
    reduced_5d = umap_5d.fit_transform(embeddings)

    umap_2d = UMAP(n_neighbors=UMAP_VIZ_NEIGHBORS, n_components=UMAP_VIZ_COMPONENTS,
                   min_dist=UMAP_VIZ_MIN_DIST, metric=UMAP_METRIC, random_state=42)
    reduced_2d = umap_2d.fit_transform(embeddings)

    hdb = HDBSCAN(min_cluster_size=HDBSCAN_MIN_CLUSTER, min_samples=HDBSCAN_MIN_SAMPLES,
                  metric="euclidean", cluster_selection_method="eom", prediction_data=True)
    hdb.fit(reduced_5d)

    labels     = hdb.labels_
    probs      = hdb.probabilities_
    n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
    print(f"  HDBSCAN: {n_clusters} clusters, {int(np.sum(labels==-1))} outliers")
    return labels, probs, reduced_5d, reduced_2d, hdb, n_clusters


def compute_confidence(embeddings, labels, probs):
    n         = len(labels)
    centroids = {cid: embeddings[labels == cid].mean(axis=0, keepdims=True)
                 for cid in set(labels) if cid != -1}
    scores = np.zeros(n)
    for i in range(n):
        cid = int(labels[i])
        if cid != -1:
            sim       = cosine_similarity(embeddings[i:i+1], centroids[cid])[0][0]
            scores[i] = (probs[i] + float(np.clip(sim, 0, 1))) / 2.0
    return np.round(scores, 4)


def get_soft_assignments(hdb_model, reduced_5d, labels):
    try:
        soft = hdbscan_lib.membership_vector(hdb_model, reduced_5d)
        result = {}
        for i, row in enumerate(soft):
            above   = [(ci, float(p)) for ci, p in enumerate(row) if p >= SOFT_PROB_THRESHOLD]
            primary = int(labels[i])
            if primary != -1 and not any(ci == primary for ci, _ in above):
                above.append((primary, float(row[primary])))
            above.sort(key=lambda x: -x[1])
            result[i] = above
        return result
    except Exception:
        return {i: ([] if int(labels[i]) == -1 else [(int(labels[i]), 1.0)])
                for i in range(len(labels))}


# ── c-TF-IDF ──────────────────────────────────────────────────────────────────

def compute_ctfidf(plain_docs, labels):
    """
    Compute c-TF-IDF keywords per cluster using automatic stopword detection.

    Instead of a hardcoded domain-specific stopword list (which breaks
    generalization), we combine two automatic filters:

    1. NLTK English stopwords — handles function words for any language/domain
    2. Corpus-frequency filter — any word appearing in >50% of ALL documents
       is corpus-generic (equivalent to "learning", "students" in education).
       This auto-detects domain-generic terms without manual curation.

    This makes the pipeline work on any CSV from any domain.
    """
    import nltk
    from collections import Counter

    # Download NLTK stopwords if needed
    try:
        nltk.data.find("corpora/stopwords")
    except LookupError:
        nltk.download("stopwords", quiet=True)
    from nltk.corpus import stopwords as nltk_sw

    # Auto-detect corpus-generic words (appear in >50% of documents)
    n_docs = len(plain_docs)
    word_doc_freq = Counter(
        w for doc in plain_docs
        for w in set(doc.lower().split())
    )
    corpus_generic = {w for w, cnt in word_doc_freq.items()
                      if cnt / n_docs > 0.50}

    # Combined stopwords: NLTK + corpus-generic + short words/digits
    all_stopwords = set(nltk_sw.words("english")) | corpus_generic

    cluster_ids = sorted(set(labels) - {-1})
    class_counts = {}
    for cid in cluster_ids:
        text  = " ".join([plain_docs[i] for i, m in enumerate(labels == cid) if m])
        words = [w for w in text.lower().split()
                 if len(w) > 3 and not w.isdigit() and w not in all_stopwords]
        counts = defaultdict(int)
        for w in words: counts[w] += 1
        class_counts[cid] = counts

    global_tf = defaultdict(int)
    for counts in class_counts.values():
        for w, c in counts.items(): global_tf[w] += c

    avg_words = sum(global_tf.values()) / max(len(cluster_ids), 1)
    keywords  = {}
    for cid, counts in class_counts.items():
        scores = {}
        total  = sum(counts.values())
        for word, freq in counts.items():
            if global_tf[word] == 0: continue
            scores[word] = (freq / max(total, 1)) * math.log(1 + avg_words / global_tf[word])
        keywords[cid] = sorted(scores.items(), key=lambda x: -x[1])[:CTFIDF_TOP_N]

    keywords[-1] = []
    return keywords


# ── MAIN ENTRY POINT ──────────────────────────────────────────────────────────

def run_phase1(csv_path, model_key):
    """
    Run Phase 1 for a single model.
    Returns a dict that run_phase2() can consume directly.
    """
    print(f"\n[Phase 1] model={model_key}, csv={csv_path}")

    df, sep_docs, plain_docs, docs_final = load_and_clean(csv_path)

    # Use [SEP] format for SciBERT/SPECTER2, plain for others
    docs_for_model = sep_docs if model_key in ("scibert", "specter2") else plain_docs

    embed_model = load_model(model_key)
    t0          = time.time()
    embeddings  = embed_model.encode(docs_for_model)
    print(f"  Embeddings: {embeddings.shape} ({time.time()-t0:.1f}s)")
    embed_model.unload()
    del embed_model
    gc.collect()

    labels, probs, reduced_5d, reduced_2d, hdb, n_clusters = reduce_and_cluster(embeddings)
    confidence   = compute_confidence(embeddings, labels, probs)
    soft         = get_soft_assignments(hdb, reduced_5d, labels)
    ctfidf       = compute_ctfidf(plain_docs, labels)

    return {
        "df":          df,
        "docs_final":  docs_final,
        "plain_docs":  plain_docs,
        "embeddings":  embeddings,
        "labels":      labels,
        "reduced_5d":  reduced_5d,
        "reduced_2d":  reduced_2d,
        "n_clusters":  n_clusters,
        "confidence":  confidence,
        "soft":        soft,
        "ctfidf":      ctfidf,
        "model_key":   model_key,
    }