from flask import Flask, request, redirect, session, send_from_directory
from flask_bcrypt import Bcrypt
import sqlite3

app = Flask(__name__)
app.secret_key = "super_secret_key"

bcrypt = Bcrypt(app)

DATABASE = "users.db"


def init_db():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )
    """)

    conn.commit()
    conn.close()


init_db()


@app.route("/")
def index():
    return send_from_directory("../frontend", "index.html")


@app.route("/register", methods=["POST"])
def register():

    username = request.form["username"]
    password = request.form["password"]

    hashed = bcrypt.generate_password_hash(password).decode("utf-8")

    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    try:
        cursor.execute(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            (username, hashed)
        )
        conn.commit()
    except:
        return "Usuário já existe"

    conn.close()

    return "Usuário criado com sucesso"

@app.route("/login", methods=["POST"])
def login():

    username = request.form["username"]
    password = request.form["password"]

    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    cursor.execute(
        "SELECT password FROM users WHERE username=?",
        (username,)
    )

    user = cursor.fetchone()

    conn.close()

    if user and bcrypt.check_password_hash(user[0], password):

        session["user"] = username
        return redirect("/dashboard")

    return "Login inválido"


@app.route("/dashboard")
def dashboard():

    if "user" not in session:
        return redirect("/")

    username = session["user"]

    return f"""
    <h1>Bem-vindo {username}</h1>
    <br>
    <a href="/logout">Logout</a>
    """


@app.route("/logout")
def logout():

    session.clear()
    return redirect("/")


if __name__ == "__main__":
    app.run(debug=True)