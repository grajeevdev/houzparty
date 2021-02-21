from .models import SpotifyToken
from django.utils import timezone;
from datetime import timedelta;
from .credentials import clientID,Secret
from requests import post,put,get

BASE_URL="https://api.spotify.com/v1/me"


def get_user_tokens(session_id):
    user_tokens=SpotifyToken.objects.filter(user=session_id)
    return user_tokens[0] if user_tokens.exists() else None

def update_or_create_user_tokens(session_id,access_token,token_type,expires_in,refresh_token):
    token = get_user_tokens(session_id)
    expires_in= timezone.now() + timedelta(seconds=expires_in)

    if token:
        token.access_token=access_token
        token.refresh_token=refresh_token
        token.expires_in=expires_in
        token.token_type=token_type
        token.save(update_fields=['access_token','refresh_token','expires_in','token_type'])
    else:
        token = SpotifyToken(user=session_id,refresh_token=refresh_token,access_token=access_token,expires_in=expires_in,token_type=token_type)
        token.save()

def is_spotify_authenticated(session_id):
    token=get_user_tokens(session_id)
    if token:
        expiry = token.expires_in
        if expiry<=timezone.now():
            refresh_spotify_token(session_id)
        return True
    return False


def refresh_spotify_token(session_id):
    refresh_token=get_user_tokens(session_id).refresh_token
    response=post("https://accounts.spotify.com/api/token",data={
        'grant_type':'refresh_token',
        'refresh_token':refresh_token,
        'client_id':clientID,
        'client_secret':Secret
    }).json()

    print(response)
    access_token=response.get('access_token')
    token_type=response.get('token_type')
    expires_in=response.get('expires_in')
    refresh_token=refresh_token

    update_or_create_user_tokens(session_id,access_token,token_type,expires_in,refresh_token)


def execute_spotify_request(session_id,endpoint,post_=False,put_=False):
    token=get_user_tokens(session_id)
    headers={'Content-Type':'application/json','Authorization':"Bearer "+token.access_token}
    if post_:
        post(BASE_URL+endpoint,headers=headers)
    if put_:
        put(BASE_URL+endpoint,headers=headers)

    response = get(BASE_URL+endpoint,{},headers=headers)
    print(BASE_URL+endpoint)

    try:
        return response.json()
    except:
        return {'error':"Error encountered while communicating with spotify"}


def play_song(host):
    return execute_spotify_request(host,"/player/play",put_=True)

def pause_song(host):
    return execute_spotify_request(host,"/player/pause",put_=True)

def skip_song(host):
        return execute_spotify_request(host,"/player/next",post_=True)
        
def previous_song(host):
        return execute_spotify_request(host,"/player/previous",post_=True)
 