import chat.routing
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter

application = ProtocolTypeRouter({
    'websocket': AuthMiddlewareStack(URLRouter(chat.routing.websocket_urlpatterns)),
    'http': AuthMiddlewareStack(URLRouter(chat.routing.http_urlpatterns)),
})
