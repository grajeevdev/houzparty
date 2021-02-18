from django.shortcuts import render
from django.http import HttpResponse,JsonResponse
from rest_framework import generics,status
from .serializers import RoomSerializer,UpdateRoomSerializer
from .serializers import CreateRoomSerializer
from .models import Room
from rest_framework.views import APIView
from rest_framework.response import Response


# Create your views here.
def index(request):
    return HttpResponse("Hello world!")

def secondary(request):
    return HttpResponse("Secondary URL")

class RoomView(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class=RoomSerializer


class GetRoom(APIView):
    serializer_class=RoomSerializer
    look_up_url_kwarg='code'

    def get(self,request,format=None):
        code = request.GET.get(self.look_up_url_kwarg)
        if code!=None:
            room = Room.objects.filter(code=code)
            if len(room)>0:
                data=RoomSerializer(room[0]).data
                data['is_host'] = self.request.session.session_key == room[0].host
                data['host']=room[0].host
                return Response(data,status.HTTP_200_OK)
            return Response('Corresponding room does not exist...',status.HTTP_404_NOT_FOUND)
        return Response({'Bad Request' : 'Code parameter not found in request!!!'},status =status.HTTP_400_BAD_REQUEST)


class UserInRoom(APIView):
    serializer_class=RoomSerializer
    
    def get(self,request,format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        
        data = {
            'code':self.request.session.get('room_code')
        }
        return JsonResponse(data,status=status.HTTP_200_OK)

class JoinRoom(APIView):
    serializer_class=RoomSerializer

    def post(self,request,format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()  
        code=request.data.get('code')
        if code!=None:
            room_result=Room.objects.filter(code=code)
            if len(room_result) >0:
                room = room_result[0]
                self.request.session['room_code']=code
                return Response({'message': 'Room Joined!'},status=status.HTTP_200_OK)
            return Response({'message' : 'Room could not be located!'},status=status.HTTP_404_NOT_FOUND)
        return Response({'Bad request!' : "No room code passed in the request!"},status = status.HTTP_400_BAD_REQUEST)

class LeaveRoom(APIView):

    def post(self,request,format=None):
        if 'room_code' in self.request.session:
            code=self.request.session.pop('room_code')
            host_id=self.request.session.session_key
            results=Room.objects.filter(host=host_id)
            if len(results)>0:
                room=results[0]
                room.delete()
        return Response({"message":"success"},status=status.HTTP_200_OK)

class UpdateRoom(APIView):
    serializer_class=UpdateRoomSerializer
    def patch(self,request,format=None):
        serializer=self.serializer_class(data=request.data)
        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            code = serializer.data.get('code')

            queryset= Room.objects.filter(code=code)
            if not queryset.exists():
                return Response({"message":"Room not found!"},status=status.HTTP_404_NOT_FOUND)
            room=queryset[0]
            user_id=self.request.session.session_key
            if room.host!=user_id:
                return Response({"message":"You are not the host of this room :'("},status=status.HTTP_403_FORBIDDEN)
            room.guest_can_pause=guest_can_pause
            room.votes_to_skip=votes_to_skip
            room.code=code
            room.save()
            self.request.session['room_code'] = room.code
            return Response({"OK":"ROOM UPDATE SUCCESSFUL!"},status=status.HTTP_200_OK)
        
        return Response({"Bad Request":"This request is invalid!"},status=status.HTTP_400_BAD_REQUEST)


class CreateRoomView(APIView):
    serializer_class=CreateRoomSerializer
    def post(self,request,format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        serializer=self.serializer_class(data=request.data)
        if serializer.is_valid():
            guest_can_pause=serializer.data.get('guest_can_pause')
            votes_to_skip=serializer.data.get('votes_to_skip')
            host=self.request.session.session_key
            querySet=Room.objects.filter(host=host)
            if querySet.exists():
                room=querySet[0]
                room.votes_to_skip=votes_to_skip
                room.guest_can_pause=guest_can_pause
                room.save(update_fields=['guest_can_pause','votes_to_skip'])
                self.request.session['room_code']=room.code
                return Response(RoomSerializer(room).data,status=status.HTTP_201_CREATED)
            else:
                room = Room(host=host,votes_to_skip=votes_to_skip,guest_can_pause=guest_can_pause)
                room.save()
                self.request.session['room_code']=room.code
                return Response(RoomSerializer(room).data,status=status.HTTP_201_CREATED)
            return Response({'Bad Request!' : "Room could not be created..."},status=status.HTTP_400_BAD_REQUEST)


