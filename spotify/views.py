from django.shortcuts import render, redirect
from django.http import HttpResponse,JsonResponse
from .credentials import RedirectURI,clientID,Secret
from rest_framework import generics,status
from requests import Request,post
from myapp.models import Room
from rest_framework.views import APIView
from rest_framework.response import Response
from .util import *
from .serializers import *
from .models import Vote
# Create your views here.

class AuthURL(APIView):

    def get(self,request,format=None):
        scopes="user-read-playback-state user-modify-playback-state user-read-currently-playing"
        url=Request('GET','https://accounts.spotify.com/authorize',params={
            'scope':scopes,
            'response_type' : 'code',
            'redirect_uri' : RedirectURI,
            'client_id' : clientID
        }).prepare().url

        return Response({'message':'authentication successful with spotify!','url' : url},status=status.HTTP_200_OK)
    

def spotify_callback(request,format=None):
    code = request.GET.get('code')
    error = request.GET.get('error')

    response = post("https://accounts.spotify.com/api/token",data={
        'grant_type':'authorization_code',
        'code':code,
        'redirect_uri':RedirectURI,
        'client_id':clientID,
        'client_secret':Secret
    }).json()

    access_token=response.get('access_token')
    token_type=response.get('token_type')
    refresh_token=response.get('refresh_token')
    expires_in=response.get('expires_in')
    error=response.get('error')

    if not request.session.exists(request.session.session_key):
        request.session.create()
    
    update_or_create_user_tokens(request.session.session_key,access_token,token_type,expires_in,refresh_token)

    return redirect('frontend:')

#t662qn09fj7pj4q35j0ndbyk4czwdtxz

class IsAuthenticated(APIView):

    def get(self,request,format=None):
        is_authenticated=is_spotify_authenticated(self.request.session.session_key)

        return Response({"status":is_authenticated},status=status.HTTP_200_OK)


class TokensView(generics.ListAPIView):
    queryset = SpotifyToken.objects.all()
    serializer_class=TokenSerializer


class PauseSong(APIView):

    def put(self,response,format=None):
        room_code=self.request.session.get('room_code')
        room=Room.objects.filter(code=room_code)[0]
        if self.request.session.session_key==room.host or room.guest_can_pause:
            pause_song(room.host)
            return Response({},status=status.HTTP_204_NO_CONTENT)
        return Response({},status=status.HTTP_403_FORBIDDEN)

class NextSong(APIView):

    def post(self,request,format=None):
        room_code=self.request.session.get('room_code')
        room=Room.objects.filter(code=room_code)[0]
        votes=Vote.objects.filter(room=room,song_id=room.current_song)
        votes_needed=room.votes_to_skip
        if self.request.session.session_key==room.host or len(votes)+1>=votes_needed:
            votes.delete()
            skip_song(room.host)
            return Response({},status=status.HTTP_204_NO_CONTENT)
        else:
            vote = Vote(user=self.request.session.session_key,room=room,song_id=room.current_song)
            vote.save()
        return Response({},status=status.HTTP_403_FORBIDDEN)

class PreviousSong(APIView):

    def post(self,request,format=None):
        room_code=self.request.session.get('room_code')
        room=Room.objects.filter(code=room_code)[0]
        votes=Vote.objects.filter(room=room,song_id=room.current_song)
        votes_needed=room.votes_to_skip
        if self.request.session.session_key==room.host or len(votes)+1>=votes_needed:
            votes.delete()
            previous_song(room.host)
            return Response({},status=status.HTTP_204_NO_CONTENT)
        else:
            vote = Vote(user=self.request.session.session_key,room=room,song_id=room.current_song)
            vote.save()
        return Response({},status=status.HTTP_403_FORBIDDEN)


class PlaySong(APIView):

    def put(self,response,format=None):
        room_code=self.request.session.get('room_code')
        room=Room.objects.filter(code=room_code)[0]
        if self.request.session.session_key==room.host or room.guest_can_pause:
            play_song(room.host)
            return Response({},status=status.HTTP_204_NO_CONTENT)
        return Response({},status=status.HTTP_403_FORBIDDEN)

class DeleteToken(APIView):
    queryset = SpotifyToken.objects.all()
    serializer_class=TokenSerializer

    def post(self,request,format=None):
        host_id="t662qn09fj7pj4q35j0ndbyk4czwdtxz"
        results=SpotifyToken.objects.filter(user=host_id)
        if len(results)>0:
            token=results[0]
            token.delete()

class CurrentSong(APIView):

    def get(self,request,format=None):
        room_code=self.request.session.get('room_code')
        print(room_code)
        room=Room.objects.filter(code=room_code)
        if room.exists():
            room=room[0]
            print(room)
        else:
            return Response({"error":"Room does not exist!"},status=status.HTTP_404_NOT_FOUND)
        host=room.host
        endpoint="/player/currently-playing"
        response=execute_spotify_request(host,endpoint)
        
        if 'error' in response or 'item' not in response:
            return Response({},status=status.HTTP_204_NO_CONTENT)

        item = response.get('item')
        duration=item.get('duration_ms')
        progress=response.get('progress_ms')
        album_cover=item.get('album').get('images')[0].get('url')
        is_playing=response.get('is_playing')
        song_id=item.get('id')

        artist_string = ""

        for i,artist in enumerate(item.get('artists')):
            if i>0:
                artist_string+= ","
            name=artist.get('name')
            artist_string+=name
        votes=Vote.objects.filter(room=room,song_id=song_id)
        song = {
            'title': item.get('name'),
            'artist': artist_string,
            'duration':duration,
            'time':progress,
            'image_url':album_cover,
            'is_playing':is_playing,
            'votes':len(votes),
            'votes_required':room.votes_to_skip,
            'id':song_id

        }
        self.update_room_song(room,song_id)

        return Response(song,status=status.HTTP_200_OK)
    
    def update_room_song(self,room,song_id):
        current_song=room.current_song
        print(current_song)
        if current_song!=song_id:
            room.current_song=song_id
            room.save(update_fields=['current_song'])
            print("ROOM SONG UPDATED")
            votes=Vote.objects.filter(room=room).delete()

       
    