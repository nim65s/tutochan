from django.urls import re_path

from channels.http import AsgiHandler

from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<room_name>\w+)/$', consumers.ChatConsumer),
]

http_urlpatterns = [
    re_path('sse', consumers.ServerSentEventsConsumer),
    re_path('', AsgiHandler),
]
