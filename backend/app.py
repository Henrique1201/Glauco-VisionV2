from flask import Flask, redirect, request, session, url_for, send_from_directory
import requests
from local_settings import CLIENT_ID, CLIENT_SECRET

app = Flask(__name__)
app.secret_key = "super_secret_key"


GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_USER_API = "https://api.github.com/user"


@app.route("/")
def index():
    return send_from_directory("../frontend", "index.html")


@app.route("/login")
def login():
    return redirect(f"{GITHUB_AUTH_URL}?client_id={CLIENT_ID}")


@app.route("/callback")
def callback():

    code = request.args.get("code")

    token_response = requests.post(
        GITHUB_TOKEN_URL,
        headers={"Accept": "application/json"},
        data={
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "code": code
        },
    )

    access_token = token_response.json().get("access_token")

    user_response = requests.get(
        GITHUB_USER_API,
        headers={"Authorization": f"token {access_token}"}
    )

    user = user_response.json()

    session["user"] = {
        "login": user["login"],
        "avatar": user["avatar_url"]
    }

    return redirect("/dashboard")


@app.route("/dashboard")
def dashboard():

    if "user" not in session:
        return redirect("/")

    user = session["user"]

    return f"""
    <h1>Bem-vindo {user['login']}</h1>
    <img src="{user['avatar']}" width="120">
    <br><br>
    <a href="/logout">Logout</a>
    """


@app.route("/logout")
def logout():
    session.clear()
    return redirect("/")


if __name__ == "__main__":
    app.run(debug=True)