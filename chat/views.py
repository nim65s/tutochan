from django.shortcuts import render

from rest_framework import viewsets

from .models import Chan, Message
from .serializers import ChanSerializer, MessageSerializer


def index(request):
    return render(request, 'chat/index.html')


def room(request, room_name):
    return render(request, 'chat/room.html', {'room_name': room_name})


class ChanViewSet(viewsets.ModelViewSet):
    queryset = Chan.objects.all().order_by('-created')
    serializer_class = ChanSerializer


class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all().order_by('-created')
    serializer_class = MessageSerializer
