import asyncio
from datetime import datetime

from django.conf import settings

from channels.db import database_sync_to_async
from channels.generic.http import AsyncHttpConsumer
from channels.generic.websocket import AsyncJsonWebsocketConsumer

from .models import Chan, Message


class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        # print(f'{self.scope=}')
        # print(f'{self.channel_name=}')
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'room_{self.room_name}'
        await self.set_chan()
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        for message in await self.get_messages():
            await self.send_json(content={'message': message})

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive_json(self, content):
        await self.channel_layer.group_send(self.room_group_name, {
            'type': 'chati_message',
            'message': content['message']
        })
        await self.add_message(content['message'])

    async def chati_message(self, event):
        await self.send_json(content={'message': event['message']})

    @database_sync_to_async
    def set_chan(self):
        self.chan = Chan.objects.get_or_create(name=self.room_name)[0]

    @database_sync_to_async
    def add_message(self, message):
        if self.scope['user'].is_authenticated:
            Message.objects.create(chan=self.chan, user=self.scope['user'], message=message)

    @database_sync_to_async
    def get_messages(self):
        return list(str(msg) for msg in Message.objects.filter(chan=self.chan))


class ServerSentEventsConsumer(AsyncHttpConsumer):
    async def handle(self, body):
        await self.send_headers(headers=[
            (b'Cache-Control', b'no-cache'),
            (b'Content-Type', b'text/event-stream'),
            (b'Transfer-Encoding', b'chunked'),
        ])
        while True:
            payload = 'data: %s\n\n' % datetime.now().isoformat()
            await self.send_body(payload.encode('utf-8'), more_body=True)
            await asyncio.sleep(1)
