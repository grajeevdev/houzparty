from rest_framework import serializers
from .models import SpotifyToken


class TokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpotifyToken
        fields =('id','user','refresh_token','access_token','token_type','created_at','expires_in')