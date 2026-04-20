"""
Evidence Mapping — Flask API
============================
Wraps the two-phase NLP pipeline as an HTTP endpoint.

Start with:
    python app.py

Then start the frontend:
    npm run dev
"""

import os
import gc
import json
import tempfile
import traceback

import torch
from flask import Flask, request, jsonify
from flask_cors import CORS

from pipeline.phase1 import run_phase1
from pipeline.phase2 import run_phase2

app = Flask(__name__)
CORS(app)   # allow requests from Vite dev server (localhost:5173)


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/api/cluster", methods=["POST"])
def cluster():
    """
    Accepts:
        multipart/form-data
            file  : CSV file upload
            model : one of "scibert" | "specter2" | "minilm" | "qwen3_emb"

    Returns:
        JSON matching the shape parseUploadedCSV() returns on the frontend:
        {
            "papers":      [...],
            "topicColors": {...},
            "topicNames":  {...},
            "filterDefs":  [...]
        }
    """
    # ── Validate inputs ──────────────────────────────────────────────
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded."}), 400

    file = request.files["file"]
    if not file.filename.endswith(".csv"):
        return jsonify({"error": "Please upload a .csv file."}), 400

    model_key = request.form.get("model", "scibert")
    valid_models = {"scibert", "specter2", "minilm", "qwen3_emb"}
    if model_key not in valid_models:
        return jsonify({"error": f"Invalid model. Choose from: {', '.join(valid_models)}"}), 400

    # ── Save uploaded CSV to a temp file ─────────────────────────────
    with tempfile.NamedTemporaryFile(suffix=".csv", delete=False) as tmp:
        file.save(tmp.name)
        csv_path = tmp.name

    try:
        # ── Phase 1: embeddings + clustering ─────────────────────────
        print(f"\n[API] Starting Phase 1 — model: {model_key}")
        phase1_result = run_phase1(csv_path, model_key)

        # ── Phase 2: labeling + metrics + output ─────────────────────
        print(f"\n[API] Starting Phase 2 — labeling with Qwen2.5")
        result = run_phase2(phase1_result)

        # ── Clean up VRAM ─────────────────────────────────────────────
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        gc.collect()

        print(f"\n[API] Done — returning {len(result['papers'])} papers")
        return jsonify(result)

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

    finally:
        # Always clean up the temp file
        try:
            os.unlink(csv_path)
        except Exception:
            pass


if __name__ == "__main__":
    print("\n Evidence Mapping API")
    print(" Running on http://localhost:5000")
    print(" Start frontend with: npm run dev\n")
    app.run(host="0.0.0.0", port=5000, debug=False)
