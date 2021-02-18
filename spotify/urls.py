from django.urls import path,include
from .views import *

urlpatterns = [
    path('get-auth-url',AuthURL.as_view()),
    path('redirect',spotify_callback),
    path('is-authenticated',IsAuthenticated.as_view()),
    path('current-song',CurrentSong.as_view()),
    #temporary endpoint
    path('tokens-in-system',TokensView.as_view()),
    path('purge',DeleteToken.as_view())
]