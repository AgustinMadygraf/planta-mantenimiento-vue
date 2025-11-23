from flask import Flask, jsonify

app = Flask(__name__)


@app.get("/health")
def health_check():
    """Return a lightweight health status payload."""
    return jsonify(status="ok"), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
