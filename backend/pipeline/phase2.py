"""
Phase 2 — LLM Labeling + Output
=================================
Called by app.py as a function after phase1.py completes.
Receives the phase1 result dict, runs Qwen2.5 labeling,
and returns a JSON-ready dict matching the frontend's expected shape.

PROMPT DESIGN NOTES:
    - c-TF-IDF keywords kept in prompt — discriminating signal titles alone can't provide.
      Automatic corpus-frequency filtering in phase1 ensures keywords are meaningful.
    - LABEL: suffix removed from user turn — caused garbage output (!!!!!).
    - Few-shot example in system prompt — anchors format for small 1.5B model.
    - do_sample=True, temperature=0.3, repetition_penalty=1.2 — more stable than
      greedy decoding on small models which tend to loop/repeat.
"""

import gc
import time
import warnings
import numpy as np
import torch
from collections import defaultdict
from sklearn.metrics.pairwise import cosine_similarity
from transformers import AutoTokenizer, AutoModelForCausalLM

warnings.filterwarnings("ignore")

QWEN_MODEL_ID      = "Qwen/Qwen2.5-1.5B-Instruct"
REP_DOCS_N         = 4
ABSTRACT_MAX_CHARS = 300

PALETTE = [
    "#8c8fae","#584563","#9a6348","#c0c741",
    "#e4943a","#d26471","#34859d","#70377f",
    "#6b8e6b","#c98b5e","#5e8ec9","#c95e8e",
    "#8ec95e","#5ec9c9","#c9a45e","#7f5870",
]

ALWAYS_EXCLUDE = {
    "Author", "Year", "Title", "Abstract",
    "Primary Topic #", "Primary Topic Name",
    "All Topics", "All Topic Names",
    "cTFIDF_Keywords", "Confidence Score",
    "UMAP_X", "UMAP_Y",
}


# ── QWEN2.5 LOADING ───────────────────────────────────────────────────────────

_qwen_tok   = None
_qwen_model = None

def load_qwen():
    global _qwen_tok, _qwen_model
    if _qwen_model is not None:
        return _qwen_tok, _qwen_model

    print(f"  Loading {QWEN_MODEL_ID}...")

    if torch.cuda.is_available():
        torch.cuda.synchronize()
        torch.cuda.empty_cache()
    gc.collect()

    _qwen_tok = AutoTokenizer.from_pretrained(
        QWEN_MODEL_ID, trust_remote_code=True
    )
    _qwen_tok.pad_token    = _qwen_tok.eos_token
    _qwen_tok.pad_token_id = _qwen_tok.eos_token_id

    def _load(dtype):
        return AutoModelForCausalLM.from_pretrained(
            QWEN_MODEL_ID,
            torch_dtype=dtype,
            device_map="auto",
            low_cpu_mem_usage=True,
            trust_remote_code=True,
            # no attn_implementation — let transformers choose;
            # eager+float16 produces NaN on some CUDA versions
        )

    # Try float16 first — faster and uses less VRAM (~3GB)
    # Verify with a test forward pass to catch NaN before generation
    if torch.cuda.is_available():
        try:
            print("  Trying float16...")
            _qwen_model = _load(torch.float16)
            _qwen_model.eval()
            test = torch.tensor([[1, 2, 3]]).to(_qwen_model.device)
            with torch.no_grad():
                test_out = _qwen_model(test)
            if torch.isnan(test_out.logits).any():
                raise ValueError("NaN detected in float16 forward pass")
            print("  float16 stable — using float16")
        except (ValueError, RuntimeError) as e:
            print(f"  float16 unstable ({e}) — falling back to float32 (~6GB VRAM)")
            del _qwen_model
            torch.cuda.empty_cache()
            gc.collect()
            _qwen_model = _load(torch.float32)
            _qwen_model.eval()
    else:
        # CPU — always float32
        _qwen_model = _load(torch.float32)
        _qwen_model.eval()

    print(f"  Qwen2.5 loaded")
    return _qwen_tok, _qwen_model


def unload_qwen():
    global _qwen_tok, _qwen_model
    del _qwen_model, _qwen_tok
    _qwen_model = None
    _qwen_tok   = None
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
    gc.collect()


# ── REPRESENTATIVE DOCUMENT SELECTION ────────────────────────────────────────

def select_rep_docs(embeddings, labels, n=4):
    centroids = {
        cid: embeddings[labels == cid].mean(axis=0)
        for cid in set(labels) if cid != -1
    }
    rep = {}
    for cid, centroid in centroids.items():
        idxs = np.where(labels == cid)[0]
        sims = cosine_similarity(
            embeddings[idxs], centroid.reshape(1, -1)
        ).flatten()
        rep[cid] = idxs[np.argsort(-sims)][:n].tolist()
    return rep


# ── PROMPT BUILDING ───────────────────────────────────────────────────────────

def ctfidf_str(ctfidf, cid):
    if cid not in ctfidf or not ctfidf[cid]:
        return ""
    return ", ".join(w for w, _ in ctfidf[cid])


def build_prompt(df, paper_indices, kws_str):
    """
    Exact prompt structure from the working evidence-maps phase_2_labeling.py.
    Uses apply_chat_template with messages — same as what worked with Qwen2.5
    in the standalone pipeline. LABEL: suffix kept at end of user content
    (this worked fine in evidence-maps; the !!!!! issue is in generation params).
    """
    papers_section = []
    for rank, idx in enumerate(paper_indices[:REP_DOCS_N], 1):
        row      = df.iloc[idx]
        title    = str(row.get("Title",    "")).strip()
        abstract = str(row.get("Abstract", "")).strip()[:ABSTRACT_MAX_CHARS]
        papers_section.append(
            f"Paper {rank}: {title}\nAbstract: {abstract}"
        )
    papers_text = "\n\n".join(papers_section)

    user_content = (
        f"I have a cluster of research papers.\n"
        f"Discriminating keywords: {kws_str}\n\n"
        f"Representative papers:\n\n{papers_text}\n\n"
        f"Generate a concise label for this cluster.\n"
        f"Rules:\n"
        f"- 3-5 words only\n"
        f"- Specific to THIS cluster, not generic\n"
        f"- Return ONLY the label, nothing else\n\n"
        f"LABEL:"
    )

    return [
        {
            "role": "system",
            "content": (
                "You are a research taxonomy expert. "
                "You generate precise 3-5 word topic labels for clusters of academic papers. "
                "Your labels capture the unique research theme of each cluster."
            )
        },
        {"role": "user", "content": user_content}
    ]


# ── LABEL GENERATION ──────────────────────────────────────────────────────────

def generate_label(tok, model, df, cid, paper_indices, kws_str, n_papers=0):
    messages = build_prompt(df, paper_indices, kws_str)
    text     = tok.apply_chat_template(
        messages, tokenize=False, add_generation_prompt=True
    )
    inputs = tok(text, return_tensors="pt").to(model.device)

    with torch.no_grad():
        out = model.generate(
            **inputs,
            max_new_tokens=20,
            do_sample=False,
            temperature=1.0,    # override model's default 0.7 (conflicts with do_sample=False)
            top_p=1.0,          # override model's default 0.8 (conflicts with do_sample=False)
            top_k=0,            # override model's default 20  (conflicts with do_sample=False)
            pad_token_id=tok.eos_token_id,
            eos_token_id=tok.eos_token_id,
        )

    generated = out[0][len(inputs["input_ids"][0]):]
    raw       = tok.decode(generated, skip_special_tokens=True).strip()

    print(f"    [DEBUG] raw model output: {repr(raw)}")

    label = raw
    for prefix in ["LABEL:", "Label:", "label:"]:
        if label.startswith(prefix):
            label = label[len(prefix):].strip()
            break
    label = label.split("\n")[0].strip().strip("\"'").rstrip(".,:;")

    print(f"    [DEBUG] after cleaning: {repr(label)}")

    if not label or len(label) > 80 or all(c in "!?.,- " for c in label):
        label = f"Cluster {cid}"

    return label


# ── OUTPUT BUILDER ────────────────────────────────────────────────────────────

def build_output(df, labels, soft, cluster_labels, ctfidf, confidence, reduced_2d):
    all_cols     = list(df.columns)
    cluster_tail = {
        "Primary Topic #", "Primary Topic Name", "All Topics",
        "All Topic Names", "cTFIDF_Keywords", "Confidence Score",
        "UMAP_X", "UMAP_Y",
    }
    filter_cols = [c for c in all_cols if c not in ALWAYS_EXCLUDE and c not in cluster_tail]

    topic_ids    = sorted({int(l) for l in labels if l != -1})
    topic_colors = {tid: PALETTE[i % len(PALETTE)] for i, tid in enumerate(topic_ids)}
    topic_names  = {tid: cluster_labels.get(tid, f"Topic {tid}") for tid in topic_ids}
    topic_colors[-1] = "#aaaaaa"
    topic_names[-1]  = "Outlier"

    papers = []
    for i, row in df.iterrows():
        primary    = int(labels[i])
        assigns    = soft.get(i, [])
        all_topics = [cid for cid, _ in assigns] if (primary != -1 and assigns) else [primary]

        paper = {
            "id":     i,
            "author": str(row.get("Author", "")).strip(),
            "year":   str(row.get("Year",   "")).strip(),
            "t":      str(row.get("Title",  f"Paper {i}")).strip(),
            "p":      primary,
            "a":      all_topics,
            "k":      ctfidf_str(ctfidf, primary),
            "umap_x": float(round(reduced_2d[i, 0], 4)),
            "umap_y": float(round(reduced_2d[i, 1], 4)),
            "conf":   float(confidence[i]),
        }
        for col in filter_cols:
            paper[col] = str(row.get(col, "")).strip()

        papers.append(paper)

    filter_defs = [
        {
            "key":    col,
            "label":  col.lower(),
            "values": sorted({p[col] for p in papers if p[col]}),
        }
        for col in filter_cols
        if any(p[col] for p in papers)
    ]

    return {
        "papers":      papers,
        "topicColors": {str(k): v for k, v in topic_colors.items()},
        "topicNames":  {str(k): v for k, v in topic_names.items()},
        "filterDefs":  filter_defs,
    }


# ── MAIN ENTRY POINT ──────────────────────────────────────────────────────────

def run_phase2(phase1_result):
    df         = phase1_result["df"]
    embeddings = phase1_result["embeddings"]
    labels     = phase1_result["labels"]
    n_clusters = phase1_result["n_clusters"]
    ctfidf     = phase1_result["ctfidf"]
    soft       = phase1_result["soft"]
    confidence = phase1_result["confidence"]
    reduced_2d = phase1_result["reduced_2d"]

    print(f"\n[Phase 2] Labeling {n_clusters} clusters with Qwen2.5...")

    tok, model = load_qwen()

    rep_docs        = select_rep_docs(embeddings, labels, n=REP_DOCS_N)
    cluster_to_paps = defaultdict(list)
    for i, lbl in enumerate(labels):
        if lbl != -1:
            cluster_to_paps[int(lbl)].append(i)

    cluster_labels = {}
    for cid in sorted(cluster_to_paps.keys()):
        paps    = cluster_to_paps[cid]
        rep_idx = rep_docs.get(cid, paps[:REP_DOCS_N])
        kws     = ctfidf_str(ctfidf, cid)

        print(f"  Cluster {cid} ({len(paps)} papers)")
        print(f"    keywords: {kws[:70]}")
        t0    = time.time()
        label = generate_label(tok, model, df, cid, rep_idx, kws, len(paps))
        print(f"    label: '{label}'  ({time.time()-t0:.1f}s)")
        cluster_labels[cid] = label

    cluster_labels[-1] = "Outlier"
    unload_qwen()

    return build_output(df, labels, soft, cluster_labels, ctfidf, confidence, reduced_2d)